const db = require('../config/database.config');
const CryptoUtil = require('../utils/crypto.util');
const Response = require('../utils/response.util');

class UserController {
  /**
   * 1. 检查用户名是否可用 (注册时使用，无需登录)
   * 访问路径：GET /user/check-username?username=xxx
   */
  static async checkUsername(req, res) {
    try {
      const { username } = req.query; // 从 URL 参数中获取 ?username=xxx
      if (!username) return res.json(Response.error(400, '请输入用户名'));

      const userExist = db.prepare('SELECT id FROM user WHERE username = ?').get(username);
      
      if (userExist) {
        return res.json(Response.error(1001, '用户名已被占用'));
      }
      return res.json(Response.success(null, '用户名可用'));
    } catch (error) {
      return res.json(Response.error(500, '服务器查询失败'));
    }
  }

  /**
   * 2. 获取个人资料 (需登录)
   */
  static async getProfile(req, res) {
    try {
      const user = db.prepare('SELECT id, username, email, student_id, create_time FROM user WHERE id = ?').get(req.user.userId);
      return res.json(Response.success(user));
    } catch (error) {
      return res.json(Response.error(500, '获取失败'));
    }
  }

  /**
   * 3. 更新个人信息 (需登录)
   */
  static async updateProfile(req, res) {
    try {
      const { email, studentId } = req.body;
      db.prepare('UPDATE user SET email = ?, student_id = ? WHERE id = ?')
        .run(email, studentId, req.user.userId);
      return res.json(Response.success({}, '信息更新成功'));
    } catch (error) {
      return res.json(Response.error(500, '更新失败'));
    }
  }

  /**
   * 4. 修改密码 (需登录)
   */
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = db.prepare('SELECT password, salt FROM user WHERE id = ?').get(req.user.userId);

      const inputOld = CryptoUtil.hashPassword(oldPassword, user.salt);
      if (inputOld !== user.password) {
        return res.json(Response.error(1003, '原密码错误'));
      }

      const newSalt = CryptoUtil.generateSalt();
      const newHash = CryptoUtil.hashPassword(newPassword, newSalt);
      db.prepare('UPDATE user SET password = ?, salt = ? WHERE id = ?').run(newHash, newSalt, req.user.userId);

      return res.json(Response.success({}, '密码修改成功'));
    } catch (error) {
      console.error('修改密码失败具体原因:', error); // 这一行会在 VS Code 终端打印详细报错
      // 把具体的 error.message 返回给 Apifox，这样你就知道是缺了文件还是数据库锁定了
      return res.json(Response.error(500, '服务器内部错误: ' + error.message));
    }
  }
}

module.exports = UserController;