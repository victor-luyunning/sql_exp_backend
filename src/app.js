const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const Response = require('./utils/response.util');

// --- 1. 引入所有路由文件 (包括组员的和你的) ---
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const orderRoutes = require('./routes/order.routes'); 
const userRoutes = require('./routes/user.routes');  // 你写的
const cartRoutes = require('./routes/cart.routes');  // 你写的

const app = express();

// 2. 中间件配置
app.use(cors());
app.use(express.json());

// --- 3. 统一挂载所有路由 ---
app.use('/auth', authRoutes);   // 组员的
app.use('/books', bookRoutes);  // 组员的
app.use('/orders', orderRoutes);// 组员的
app.post('/test-cart', (req, res) => res.json({msg: "OK"}));
app.use('/user', userRoutes);   // 你的：访问路径 http://localhost:3000/user/...
app.use('/cart', cartRoutes);   // 你的：访问路径 http://localhost:3000/cart/...

// 4. 基础测试路由
app.get('/test', (req, res) => {
  res.json(Response.success({ version: "1.0.0" }, "欢迎来到校园二手教材交易平台 API"));
});

// 5. 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(Response.error(500, '服务器内部运行出错'));
});

// 6. 启动
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务启动成功！端口：${PORT}`);
});