const db = require('../config/database.config');
const Response = require('../utils/response.util');

class OrderController {
  /**
   * 创建订单 (购买教材)
   */
  static async createOrder(req, res) {
    // 1. 开启事务 (Transaction)
    // db.transaction 会返回一个函数，调用这个函数时，里面的 SQL 具有原子性
    const createOrderTx = db.transaction((orderInfo) => {
      const { bookId, building, room, phone, paymentType } = orderInfo;
      const userId = req.user.userId;
  
      // 1.1 检查书是否存在且在售
      const book = db.prepare("SELECT * FROM book WHERE id = ? AND status = 'ON_SALE'").get(bookId);
      if (!book) throw new Error('BOOK_UNAVAILABLE');
  
      // 1.2 计算实际应付金额（书籍价格 + 5%服务费）
      const bookPrice = book.price;
      const serviceFee = bookPrice * 0.05;
      const totalAmount = bookPrice + serviceFee;
  
      // 1.3 检查用户余额是否足够（需要支付总价）
      const user = db.prepare('SELECT balance FROM user WHERE id = ?').get(userId);
      if (!user || user.balance < totalAmount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }
  
      // 1.4 生成订单号 (简单时间戳 + 随机数)
      const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  
      // 1.5 插入订单主表（总价包含服务费）
      const orderStmt = db.prepare(`
        INSERT INTO "order" (order_no, user_id, total_amount, status, building, room, phone, payment_type)
        VALUES (?, ?, ?, 'PAID', ?, ?, ?, ?)
      `);
      const orderResult = orderStmt.run(orderNo, userId, totalAmount, building, room, phone, paymentType);
      const orderId = orderResult.lastInsertRowid;
  
      // 1.6 插入订单项详情（价格为书籍原价）
      const itemStmt = db.prepare(`
        INSERT INTO order_item (order_id, book_id, book_title, book_author, book_isbn, book_cover, price, seller_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      itemStmt.run(orderId, book.id, book.title, book.author, book.isbn, book.cover_image, bookPrice, book.seller_id);
  
      // 1.7 修改教材状态为"已售出"
      const updateBookStmt = db.prepare("UPDATE book SET status = 'SOLD_OUT' WHERE id = ?");
      updateBookStmt.run(book.id);
  
      // 1.8 扣除买家余额（总价，包含服务费）
      const deductBuyerStmt = db.prepare('UPDATE user SET balance = balance - ? WHERE id = ?');
      deductBuyerStmt.run(totalAmount, userId);
  
      // 1.9 增加卖家余额（只给书籍价格，不包含服务费）
      const addSellerStmt = db.prepare('UPDATE user SET balance = balance + ? WHERE id = ?');
      addSellerStmt.run(bookPrice, book.seller_id);
  
      // 服务费留在平台，不给卖家
  
      return { orderNo, totalAmount };
    });
  
    try {
      // 执行事务
      const result = createOrderTx(req.body);
      return res.json(Response.success(result, '下单并支付成功'));
    } catch (error) {
      console.error('下单失败:', error);
      if (error.message === 'BOOK_UNAVAILABLE') {
        return res.json(Response.error(1005, '教材已售出或不存在'));
      }
      if (error.message === 'INSUFFICIENT_BALANCE') {
        return res.json(Response.error(1006, '余额不足，请充值'));
      }
      return res.json(Response.error(500, '订单创建失败'));
    }
  }

  /**
   * 获取我的订单列表
   */
  static async getMyOrders(req, res) {
    try {
      const userId = req.user.userId;
      const status = req.query.status || '';
      const pageNum = Number(req.query.pageNum) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const offset = (pageNum - 1) * pageSize;

      let whereClause = 'WHERE o.user_id = ?';
      const params = [userId];
      
      if (status) {
        whereClause += ' AND o.status = ?';
        params.push(status);
      }

      const sql = `
        SELECT 
          o.id, o.order_no, o.total_amount, o.status,
          o.building, o.room, o.phone, o.payment_type,
          o.payment_time, o.create_time,
          GROUP_CONCAT(oi.book_title, ',') as book_titles,
          GROUP_CONCAT(oi.book_cover, ',') as book_covers,
          COUNT(oi.id) as item_count
        FROM "order" o
        LEFT JOIN order_item oi ON o.id = oi.order_id
        ${whereClause}
        GROUP BY o.id
        ORDER BY o.create_time DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(pageSize, offset);
      const orders = db.prepare(sql).all(...params);

      const countSql = `SELECT COUNT(*) as count FROM "order" o ${whereClause}`;
      const total = db.prepare(countSql).get(...params.slice(0, -2)).count;

      return res.json(Response.success({
        total, pageNum, pageSize, records: orders
      }));
    } catch (error) {
      console.error('获取订单失败:', error);
      return res.json(Response.error(500, '获取订单失败'));
    }
  }

  /**
   * 获取订单详情
   */
  static async getOrderDetail(req, res) {
    try {
      const userId = req.user.userId;
      const { orderId } = req.params;

      const order = db.prepare(`
        SELECT * FROM "order" WHERE id = ? AND user_id = ?
      `).get(orderId, userId);

      if (!order) {
        return res.json(Response.error(404, '订单不存在'));
      }

      const items = db.prepare(`
        SELECT oi.*, u.username as seller_name, u.phone as seller_phone
        FROM order_item oi
        LEFT JOIN user u ON oi.seller_id = u.id
        WHERE oi.order_id = ?
      `).all(orderId);

      const orderDetail = {
        id: order.id,
        orderNo: order.order_no,
        totalAmount: order.total_amount,
        status: order.status,
        address: {
          building: order.building,
          room: order.room,
          phone: order.phone
        },
        payment: {
          type: order.payment_type,
          time: order.payment_time
        },
        remark: order.remark,
        createTime: order.create_time,
        updateTime: order.update_time,
        items: items.map(item => ({
          id: item.id,
          bookId: item.book_id,
          bookTitle: item.book_title,
          bookAuthor: item.book_author,
          bookIsbn: item.book_isbn,
          bookCover: item.book_cover,
          price: item.price,
          quantity: item.quantity,
          sellerId: item.seller_id,
          sellerName: item.seller_name,
          sellerPhone: item.seller_phone
        }))
      };

      return res.json(Response.success(orderDetail));
    } catch (error) {
      console.error('获取订单详情失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }

  /**
   * 取消订单
   */
  static async cancelOrder(req, res) {
    try {
      const userId = req.user.userId;
      const { orderId } = req.params;

      const order = db.prepare(`
        SELECT * FROM "order" WHERE id = ? AND user_id = ?
      `).get(orderId, userId);

      if (!order) {
        return res.json(Response.error(404, '订单不存在'));
      }

      if (order.status === 'CANCELLED') {
        return res.json(Response.error(400, '订单已经取消'));
      }
      if (order.status === 'COMPLETED') {
        return res.json(Response.error(400, '已完成的订单不能取消'));
      }

      const cancelOrderTx = db.transaction(() => {
        db.prepare(`
          UPDATE "order" 
          SET status = 'CANCELLED', update_time = datetime('now', 'localtime')
          WHERE id = ?
        `).run(orderId);

        if (order.status === 'PAID') {
          const items = db.prepare('SELECT book_id FROM order_item WHERE order_id = ?').all(orderId);
          const updateBookStmt = db.prepare("UPDATE book SET status = 'ON_SALE' WHERE id = ?");
          for (const item of items) {
            updateBookStmt.run(item.book_id);
          }
        }
      });

      cancelOrderTx();
      return res.json(Response.success(null, '订单已取消'));
    } catch (error) {
      console.error('取消订单失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }
}

module.exports = OrderController;