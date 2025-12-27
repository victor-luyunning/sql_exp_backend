const express = require('express');
const router = express.Router();
const BookController = require('../controllers/book.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 1. 搜索教材和详情（所有人都能看，不需要保安）
router.get('/search', BookController.searchBooks);
router.get('/:id', BookController.getBookDetail);

// 2. 发布教材（必须登录，需要保安验证 Token）
router.post('/publish', authMiddleware, BookController.createBook);

module.exports = router;