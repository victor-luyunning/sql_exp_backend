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

      // 1.2 生成订单号 (简单时间戳 + 随机数)
      const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);

      // 1.3 插入订单主表
      const orderStmt = db.prepare(`
        INSERT INTO "order" (order_no, user_id, total_amount, status, building, room, phone, payment_type)
        VALUES (?, ?, ?, 'PAID', ?, ?, ?, ?)
      `);
      const orderResult = orderStmt.run(orderNo, userId, book.price, building, room, phone, paymentType);
      const orderId = orderResult.lastInsertRowid;

      // 1.4 插入订单项详情
      const itemStmt = db.prepare(`
        INSERT INTO order_item (order_id, book_id, book_title, book_author, book_isbn, price, seller_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      itemStmt.run(orderId, book.id, book.title, book.author, book.isbn, book.price, book.seller_id);

      // 1.5 修改教材状态为“已售出”
      const updateBookStmt = db.prepare("UPDATE book SET status = 'SOLD_OUT' WHERE id = ?");
      updateBookStmt.run(book.id);

      return { orderNo, totalAmount: book.price };
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
      return res.json(Response.error(500, '订单创建失败'));
    }
  }

  /**
   * 获取我的订单列表
   */
  static async getMyOrders(req, res) {
    try {
      const userId = req.user.userId;
      const orders = db.prepare(`
        SELECT o.*, oi.book_title, oi.book_author 
        FROM "order" o
        JOIN order_item oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        ORDER BY o.create_time DESC
      `).all(userId);
      
      return res.json(Response.success(orders));
    } catch (error) {
      return res.json(Response.error(500, '获取订单失败'));
    }
  }
}

module.exports = OrderController;