const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 订单操作全部需要登录
router.use(authMiddleware);

router.post('/create', OrderController.createOrder); // 下单
router.get('/list', OrderController.getMyOrders);    // 查订单

module.exports = router;