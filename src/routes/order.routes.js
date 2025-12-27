const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 订单操作全部需要登录
router.use(authMiddleware);

router.post('/create', OrderController.createOrder);
router.get('/', OrderController.getMyOrders);
router.get('/:orderId', OrderController.getOrderDetail);
router.put('/:orderId/cancel', OrderController.cancelOrder);

module.exports = router;