const express = require('express');
const cors = require('cors');
require('dotenv').config(); // 加载 .env 里的配置
const Response = require('./utils/response.util');

// --- 引入路由 ---
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const orderRoutes = require('./routes/order.routes'); 

const app = express();

// 1. 中间件配置
app.use(cors());
app.use(express.json());

// --- 挂载路由 ---
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/orders', orderRoutes);

// 2. 一个基础的测试路由
app.get('/test', (req, res) => {
  res.json(Response.success({ version: "1.0.0" }, "欢迎来到校园二手教材交易平台 API"));
});

// 3. 错误处理中间件（当代码报错时，不会直接崩溃，而是返回友好提示）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(Response.error(500, '服务器内部运行出错'));
});

// 4. 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 服务启动成功！`);
  console.log(`🔗 本地地址: http://localhost:${PORT}`);
  console.log(`-----------------------------------------`);
});