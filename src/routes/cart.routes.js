const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 路由定义
router.post('/validate', CartController.validateCart);//无认证
router.post('/items',  CartController.getCartItems);//无认证

module.exports = router;