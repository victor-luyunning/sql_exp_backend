const db = require('../config/database.config');
const CryptoUtil = require('../utils/crypto.util');
const Response = require('../utils/response.util');

class UserController {
  /**
   * 1. 获取当前登录用户信息 (/user/me)
   */
  static async getMe(req, res) {
    try {
      const user = db.prepare(
        'SELECT id, username, email, student_id, phone, avatar, department, grade, balance, create_time FROM user WHERE id = ?'
      ).get(req.user.userId);
      
      if (!user) {
        return res.json(Response.error(1004, '用户不存在'));
      }
      
      return res.json(Response.success(user));
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return res.json(Response.error(500, '服务器内部错误'));
    }
  }

  /**
   * 2. 检查用户名是否可用 (注册时使用，无需登录)
   * 访问路径：GET /user/check-username?username=xxx
   */
  static async checkUsername(req, res) {
    try {
      const { username } = req.query; // 从 URL 参数中获取 ?username=xxx
      if (!username) return res.json(Response.error(400, '请输入用户名'));

      const userExist = db.prepare('SELECT id FROM user WHERE username = ?').get(username);
      
      if (userExist) {
        return res.json(Response.success({ available: false }, '用户名已被占用'));
      }
      return res.json(Response.success({ available: true }, '用户名可用'));
    } catch (error) {
      return res.json(Response.error(500, '服务器查询失败'));
    }
  }

  /**
   * 2. 获取个人资料 (需登录)
   */
  static async getProfile(req, res) {
    try {
      const user = db.prepare('SELECT id, username, email, student_id, grade, create_time FROM user WHERE id = ?').get(req.user.userId);
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
      const userId = req.user.userId;
      const { email, studentId, phone, avatar, department, grade } = req.body;

      // 1. 检查用户是否存在
      const user = db.prepare('SELECT id FROM user WHERE id = ?').get(userId);
      if (!user) {
        return res.json(Response.error(1004, '用户不存在'));
      }

      // 2. 构建更新 SQL（只更新传入的字段）
      const updateFields = [];
      const updateValues = [];

      if (email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (studentId !== undefined) {
        updateFields.push('student_id = ?');
        updateValues.push(studentId);
      }
      if (phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
      }
      if (avatar !== undefined) {
        updateFields.push('avatar = ?');
        updateValues.push(avatar);
      }
      if (department !== undefined) {
        updateFields.push('department = ?');
        updateValues.push(department);
      }
      if (grade !== undefined) {
        updateFields.push('grade = ?');
        updateValues.push(grade);
      }

      // 如果没有任何字段需要更新
      if (updateFields.length === 0) {
        return res.json(Response.error(1005, '没有提供需要更新的字段'));
      }

      // 添加更新时间
      updateFields.push("update_time = datetime('now', 'localtime')");

      // 3. 执行更新
      updateValues.push(userId); // 添加 WHERE 条件的参数
      const sql = `UPDATE user SET ${updateFields.join(', ')} WHERE id = ?`;
      
      const stmt = db.prepare(sql);
      stmt.run(...updateValues);

      // 4. 返回更新后的用户信息
      const updatedUser = db.prepare(
        'SELECT id, username, email, student_id, phone, avatar, department, grade FROM user WHERE id = ?'
      ).get(userId);

      return res.json(Response.success(updatedUser, '用户信息更新成功'));
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return res.json(Response.error(500, '服务器内部错误: ' + error.message));
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