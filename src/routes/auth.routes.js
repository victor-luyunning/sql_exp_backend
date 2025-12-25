//用户认证路由

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // 引入保安

// 定义注册接口：POST /api/auth/register
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe); 

module.exports = router;