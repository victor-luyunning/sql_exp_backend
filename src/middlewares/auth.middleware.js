const JwtUtil = require('../utils/jwt.util');
const Response = require('../utils/response.util');

const authMiddleware = (req, res, next) => {
  try {
    // 1. 从请求头获取 Token (格式通常为 Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(Response.error(401, '未授权，请先登录'));
    }

    const token = authHeader.substring(7); // 去掉 "Bearer " 这 7 个字符
     console.log('--- 保安正在检查 ---');
    console.log('收到的 Token 前 10 位:', token.substring(0, 10));
    // 2. 验证 Token
    const decoded = JwtUtil.verifyToken(token);
      console.log('验证结果:', decoded ? '成功' : '失败 (返回了 null)');
    if (!decoded) {
      return res.status(401).json(Response.error(401, 'Token 无效或已过期'));
    }
    
    // 3. 将用户信息存入 request 对象，方便后面的程序使用
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };
    
    // 4. 放行，进入下一个环节
    next();
  } catch (error) {
    return res.status(401).json(Response.error(401, '身份认证失败'));
  }
};

module.exports = authMiddleware;