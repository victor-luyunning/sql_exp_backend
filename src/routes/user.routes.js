const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// --- A. 公开接口 (不需要 Token) ---
router.get('/check-username', UserController.checkUsername);

// --- B. 需要保安检查的接口 (必须带 Token) ---
router.use(authMiddleware); 

router.get('/me', UserController.getMe);
router.get('/profile', UserController.getProfile);
router.put('/update', UserController.updateProfile);
router.post('/change-password', UserController.changePassword);

module.exports = router;