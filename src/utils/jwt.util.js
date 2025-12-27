const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class JwtUtil {
  /**
   * 生成通行证 (Token)
   * @param {Object} payload 载荷（比如存放用户ID和用户名）
   */
  static generateToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
  }

  /**
   * 验证通行证
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (error) {
      return null;
    }
  }
}

module.exports = JwtUtil;