const db = require('../config/database.config');
const Response = require('../utils/response.util');

class BookController {
  /**
   * 发布教材
   */
  static async createBook(req, res) {
    try {
      // 从请求体拿书的信息，从 Token 里拿卖家 ID
      const { title, author, isbn, price, original_price, condition } = req.body;
      const sellerId = req.user.userId; // 这是保安中间件解析 Token 后存入的

      const stmt = db.prepare(`
        INSERT INTO book (seller_id, title, author, isbn, price, original_price, condition)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(sellerId, title, author, isbn, price, original_price, condition);

      return res.json(Response.success({ bookId: result.lastInsertRowid }, '教材发布成功'));
    } catch (error) {
      console.error('发布教材失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }

  static async searchBooks(req, res) {
    try {
      // 1. 获取参数（注意：从 query 拿到的默认是字符串）
      const { keyword = '' } = req.query;
      
      // 2. 强制转换数字，并设置“保底值”
      // Number() 如果转换失败会返回 NaN，所以我们用 || 确保它至少是个数字
      const pageNum = Number(req.query.pageNum) || 1; 
      const pageSize = Number(req.query.pageSize) || 10;
      
      // 计算跳过的行数
      const offset = (pageNum - 1) * pageSize;

      // 3. 搜索 SQL
      const sql = `
        SELECT b.*, u.username as seller_name 
        FROM book b
        JOIN user u ON b.seller_id = u.id
        WHERE b.status = 'ON_SALE' 
        AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)
        ORDER BY b.create_time DESC
        LIMIT ? OFFSET ?
      `;

      const searchPattern = `%${keyword}%`;
      
      // 执行查询
      // 确保传给 prepare().all() 的最后两个参数是 pageNum 算出来的数字
      const books = db.prepare(sql).all(
        searchPattern, 
        searchPattern, 
        searchPattern, 
        pageSize,  // 对应第一个 LIMIT ?
        offset     // 对应第二个 OFFSET ?
      );

      // 4. 获取总数
      const totalCount = db.prepare(`
        SELECT COUNT(*) as count FROM book 
        WHERE status = 'ON_SALE' 
        AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)
      `).get(searchPattern, searchPattern, searchPattern).count;

      return res.json(Response.success({
        total: totalCount,
        records: books,
        pageNum,
        pageSize
      }));
    } catch (error) {
      console.error('搜索教材失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }

  /**
   * 获取教材详情
   */
  static async getBookDetail(req, res) {
    try {
      const { id } = req.params;
      const book = db.prepare(`
        SELECT b.*, u.username as seller_name, u.avatar as seller_avatar 
        FROM book b
        JOIN user u ON b.seller_id = u.id
        WHERE b.id = ?
      `).get(id);

      if (!book) return res.json(Response.error(404, '该教材不存在'));
      
      return res.json(Response.success(book));
    } catch (error) {
      return res.json(Response.error(500, '获取详情失败'));
    }
  }
}

module.exports = BookController;