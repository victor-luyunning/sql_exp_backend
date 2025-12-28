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
      const { keyword = '', condition, minPrice, maxPrice, sortBy } = req.query;
      
      // 2. 强制转换数字，并设置“保底值”
      const pageNum = Number(req.query.pageNum) || 1; 
      const pageSize = Number(req.query.pageSize) || 10;
      
      // 计算跳过的行数
      const offset = (pageNum - 1) * pageSize;

      // 3. 构建搜索条件
      let conditions = ["b.status = 'ON_SALE'"];
      let params = [];
      
      // 关键词搜索
      if (keyword) {
        conditions.push('(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)');
        const searchPattern = `%${keyword}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      
      // 成色筛选
      if (condition) {
        conditions.push('b.condition = ?');
        params.push(condition);
      }
      
      // 价格范围
      if (minPrice) {
        conditions.push('b.price >= ?');
        params.push(Number(minPrice));
      }
      if (maxPrice) {
        conditions.push('b.price <= ?');
        params.push(Number(maxPrice));
      }
      
      // 4. 构建排序
      let orderBy = 'b.create_time DESC'; // 默认按时间
      if (sortBy === 'price_asc') {
        orderBy = 'b.price ASC';
      } else if (sortBy === 'price_desc') {
        orderBy = 'b.price DESC';
      } else if (sortBy === 'latest') {
        orderBy = 'b.create_time DESC';
      }
      
      // 5. 执行查询 - 添加 seller_avatar
      const sql = `
        SELECT b.*, u.username as seller_name, u.avatar as seller_avatar
        FROM book b
        JOIN user u ON b.seller_id = u.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;
      
      const books = db.prepare(sql).all(...params, pageSize, offset);

      // 6. 获取总数
      const countSql = `
        SELECT COUNT(*) as count FROM book b
        WHERE ${conditions.join(' AND ')}
      `;
      const totalCount = db.prepare(countSql).get(...params).count;

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

  /**
   * 获取最新发布的教材
   */
  static async getLatestBooks(req, res) {
    try {
      const limit = Number(req.query.limit) || 8;

      const sql = `
        SELECT b.*, u.username as seller_name, u.avatar as seller_avatar
        FROM book b
        JOIN user u ON b.seller_id = u.id
        WHERE b.status = 'ON_SALE'
        ORDER BY b.create_time DESC
        LIMIT ?
      `;

      const books = db.prepare(sql).all(limit);
      return res.json(Response.success(books));
    } catch (error) {
      console.error('获取最新教材失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }

  /**
   * 获取卖家的其他教材
   */
  static async getSellerBooks(req, res) {
    try {
      const { sellerId } = req.params;
      const excludeBookId = Number(req.query.excludeBookId) || 0;
      const limit = Number(req.query.limit) || 5;

      const sql = `
        SELECT b.*, u.username as seller_name, u.avatar as seller_avatar
        FROM book b
        JOIN user u ON b.seller_id = u.id
        WHERE b.seller_id = ?
        AND b.status = 'ON_SALE'
        AND b.id != ?
        ORDER BY b.create_time DESC
        LIMIT ?
      `;

      const books = db.prepare(sql).all(sellerId, excludeBookId, limit);
      return res.json(Response.success(books));
    } catch (error) {
      console.error('获取卖家教材失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }
}

module.exports = BookController;