//用户控制类

const db = require('../config/database.config');
const CryptoUtil = require('../utils/crypto.util');
const Response = require('../utils/response.util');
const JwtUtil = require('../utils/jwt.util');

class AuthController {
  /**
   * 用户注册
   */
  static async register(req, res) {
    try {
      const { username, password, email, studentId } = req.body;

      // 1. 检查用户名是否已存在
      const userExist = db.prepare('SELECT id FROM user WHERE username = ?').get(username);
      if (userExist) {
        return res.json(Response.error(1001, '用户名已存在'));
      }

      // 2. 生成盐值并加密密码
      const salt = CryptoUtil.generateSalt();
      const hashedPassword = CryptoUtil.hashPassword(password, salt);

      // 3. 写入数据库
      const stmt = db.prepare(`
        INSERT INTO user (username, password, salt, email, student_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(username, hashedPassword, salt, email, studentId);

      return res.json(Response.success(null, '注册成功'));
    } catch (error) {
      console.error('注册失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }

  /**
   * 用户登录
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 1. 查找用户
      const user = db.prepare('SELECT * FROM user WHERE username = ?').get(username);
      if (!user) {
        return res.json(Response.error(1002, '用户不存在'));
      }

      // 2. 验证密码
      // 注意：要用数据库里存的 salt 重新给传进来的 password 加密，看结果对不对
      const inputPassword = CryptoUtil.hashPassword(password, user.salt);
      if (inputPassword !== user.password) {
        return res.json(Response.error(1003, '密码错误'));
      }

      // 3. 生成 Token
      const token = JwtUtil.generateToken({ 
        userId: user.id, 
        username: user.username 
      });

      // 4. 返回成功（不返回 salt 和 password，保护隐私）
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        token: token // 把令牌给前端
      };

      return res.json(Response.success(userData, '登录成功'));
    } catch (error) {
      console.error('登录失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }

  /**
   * 获取当前登录用户信息
   */
  static async getMe(req, res) {
    // 这个 req.user 是保安（中间件）塞进去的
    const user = db.prepare('SELECT id, username, email, student_id FROM user WHERE id = ?').get(req.user.userId);
    return res.json(Response.success(user));
  }

  /**
   * 退出登录
   */
  static async logout(req, res) {
    try {
      // JWT 是无状态的，退出登录主要由前端清除 token
      // 后端这里只是返回一个成功的响应
      return res.json(Response.success(null, '退出登录成功'));
    } catch (error) {
      console.error('退出登录失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }
}

module.exports = AuthController;