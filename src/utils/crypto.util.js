//加密工具类

const crypto = require('crypto');

class CryptoUtil {
  /**
   * 生成随机盐值 (Salt)
   */
  static generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * MD5 加密
   */
  static md5(text, salt = '') {
    return crypto
      .createHash('md5')
      .update(text + salt)
      .digest('hex');
  }

  /**
   * 密码加密
   */
  static hashPassword(password, salt) {
    return this.md5(password, salt);
  }
}

module.exports = CryptoUtil;