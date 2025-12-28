const db = require('../config/database.config');
const Response = require('../utils/response.util');

class CartController {
  /**
   * 验证购物车商品 (匹配截图格式)
   * 接收: { "items": [{ "bookId": 1, "quantity": 1 }, ...] }
   */
  static async validateCart(req, res) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.json(Response.error(400, '购物车为空'));
      }

      // 1. 提取所有 ID 用于查询数据库
      const ids = items.map(item => item.bookId);
      const placeholders = ids.map(() => '?').join(',');
      
      // 2. 查询这些书的状态
      const dbBooks = db.prepare(`SELECT id, title, status, stock FROM book WHERE id IN (${placeholders})`).all(...ids);

      // 3. 逻辑校验
      const errors = [];
      items.forEach(item => {
        const book = dbBooks.find(b => b.id === item.bookId);
        
        if (!book) {
          errors.push(`ID为${item.bookId}的书籍不存在`);
        } else if (book.status !== 'ON_SALE') {
          errors.push(`《${book.title}》已下架或售出`);
        } else if (book.stock < item.quantity) {
          errors.push(`《${book.title}》库存不足 (剩余:${book.stock})`);
        }
      });

      if (errors.length > 0) {
        // 返回校验失败信息
        return res.json(Response.error(1005, errors.join('; ')));
      }

      return res.json(Response.success(null, '所有商品有效，可以结算'));
    } catch (error) {
      console.error('验证购物车失败:', error);
      return res.json(Response.error(500, '服务器错误'));
    }
  }

  /**
   * 获取购物车商品详情 (用于展示列表)
   */
  static async getCartItems(req, res) {
    try {
      const { items } = req.body; // 同样适配截图格式
      if (!items || items.length === 0) {
        return res.json(Response.success({ items: [] }));
      }

      const ids = items.map(item => item.bookId);
      const placeholders = ids.map(() => '?').join(',');
      
      // 查询书籍信息，包括卖家信息
      const sql = `
        SELECT b.*, u.username as seller_name, u.avatar as seller_avatar
        FROM book b
        JOIN user u ON b.seller_id = u.id
        WHERE b.id IN (${placeholders})
      `;
      const books = db.prepare(sql).all(...ids);

      // 合并数量信息
      const result = books.map(book => {
        const cartItem = items.find(item => item.bookId === book.id);
        return {
          ...book,
          bookId: book.id, // 添加 bookId 字段以便前端使用
          quantity: cartItem ? cartItem.quantity : 1,
          cover_image: book.cover_image || '' // 确保封面字段存在
        };
      });

      return res.json(Response.success({ items: result }));
    } catch (error) {
      console.error('获取购物车详情失败:', error);
      return res.json(Response.error(500, '服务器错误'));
    }
  }
}

module.exports = CartController;