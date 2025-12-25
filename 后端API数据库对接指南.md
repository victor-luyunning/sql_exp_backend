# 后端API数据库对接指南

## 📚 目录
1. [环境准备](#环境准备)
2. [数据库初始化](#数据库初始化)
3. [用户认证接口](#用户认证接口)
4. [教材搜索接口](#教材搜索接口)
5. [订单创建接口](#订单创建接口)
6. [余额管理接口](#余额管理接口)
7. [完整示例代码](#完整示例代码)

---

## 环境准备

### 1. 安装依赖

bash
npm install better-sqlite3 express cors body-parser


### 2. 项目结构

backend/
├── database/
│   ├── schema.sql          # 建表脚本
│   ├── seed.sql            # 测试数据
│   └── db.js               # 数据库连接模块
├── routes/
│   ├── auth.js             # 认证路由
│   ├── books.js            # 教材路由
│   ├── orders.js           # 订单路由
│   └── users.js            # 用户路由
├── data/
│   └── campus_textbook.db  # SQLite数据库文件（自动生成）
├── app.js                  # Express应用入口
└── package.json


---

## 数据库初始化

### 启动时自动初始化

在 `app.js` 中：

javascript
const express = require('express');
const { initDatabase } = require('./database/db');

const app = express();

// 初始化数据库（首次运行会自动建表和插入测试数据）
initDatabase();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});


---

## 用户认证接口

### 1. 用户注册 (`POST /api/auth/register`)

**前端请求**:
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@university.edu",
  "studentId": "20240099"
}
```

**后端实现** (`routes/auth.js`):
```javascript
const express = require('express');
const crypto = require('crypto');
const { getUserByUsername, getUserByEmail, createUser } = require('../database/db');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, studentId } = req.body;

    // 1. 参数验证
    if (!username || !password || !email) {
      return res.status(400).json({
        code: 400,
        message: '用户名、密码、邮箱不能为空',
        data: null,
        timestamp: Date.now()
      });
    }

    // 2. 检查用户名是否已存在
    const existingUser = getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        code: 1001,
        message: '用户名已存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 3. 检查邮箱是否已存在
    const existingEmail = getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        code: 1001,
        message: '邮箱已被注册',
        data: null,
        timestamp: Date.now()
      });
    }

    // 4. 密码加密
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.createHash('md5').update(password + salt).digest('hex');

    // 5. 创建用户（默认余额0元）
    const userId = createUser({
      username,
      password: hashedPassword,
      salt,
      email,
      studentId: studentId || null,
      balance: 0.00  // 初始余额为0
    });

    // 6. 返回成功
    res.json({
      code: 200,
      message: '注册成功',
      data: { userId },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
});

module.exports = router;
```

---

### 2. 用户登录 (`POST /api/auth/login`)

**前端请求**:
```json
{
  "username": "张伟",
  "password": "password123"
}
```

**后端实现**:
```javascript
const jwt = require('jsonwebtoken');

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. 查询用户
    const user = getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        code: 1002,
        message: '用户不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 2. 验证密码
    const hashedPassword = crypto.createHash('md5').update(password + user.salt).digest('hex');
    if (hashedPassword !== user.password) {
      return res.status(401).json({
        code: 1003,
        message: '密码错误',
        data: null,
        timestamp: Date.now()
      });
    }

    // 3. 生成JWT Token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username 
      },
      'your-secret-key',  // 生产环境应使用环境变量
      { expiresIn: '7d' }
    );

    // 4. 返回用户信息（不包含密码和盐）
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        tokenType: 'Bearer',
        expiresIn: 604800,  // 7天
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          studentId: user.student_id,
          avatar: user.avatar,
          balance: user.balance,  // 返回用户余额
          createTime: user.create_time
        }
      },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
});
```

---

### 3. 退出登录 (`POST /api/auth/logout`)

**后端实现**:
```javascript
// 退出登录（JWT是无状态的，前端删除Token即可）
router.post('/logout', (req, res) => {
  res.json({
    code: 200,
    message: '退出成功',
    data: null,
    timestamp: Date.now()
  });
});
```

**前端处理**:
```javascript
// 前端删除localStorage中的token
localStorage.removeItem('token');
```

---

## 教材搜索接口

### 搜索教材 (`GET /api/books/search`)

**前端请求**:
```
GET /api/books/search?keyword=微积分&pageNum=1&pageSize=10
```

**后端实现** (`routes/books.js`):
```javascript
const express = require('express');
const { searchBooks, getBookById, getLatestBooks } = require('../database/db');

const router = express.Router();

// 搜索教材
router.get('/search', (req, res) => {
  try {
    const params = {
      keyword: req.query.keyword,
      conditions: req.query.conditions,  // 'GOOD,LIKE_NEW'
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      department: req.query.department,
      sortBy: req.query.sortBy || 'latest',
      pageNum: req.query.pageNum || 1,
      pageSize: req.query.pageSize || 10
    };

    // 调用数据库模块搜索
    const result = searchBooks(params);

    res.json({
      code: 200,
      message: '操作成功',
      data: result,  // { records, total, pageNum, pageSize, totalPages }
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
});

// 获取教材详情
router.get('/:id', (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const book = getBookById(bookId);

    if (!book) {
      return res.status(404).json({
        code: 1004,
        message: '教材不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    res.json({
      code: 200,
      message: '操作成功',
      data: book,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('查询失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
});

// 获取最新发布
router.get('/latest', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const books = getLatestBooks(limit);

    res.json({
      code: 200,
      message: '操作成功',
      data: books,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('查询失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
});

module.exports = router;
```

---

## 订单创建接口

### 创建订单+自动扣款 (`POST /api/orders`)

**前端请求**:
```json
{
  "items": [
    { "bookId": 1 },
    { "bookId": 3 }
  ],
  "address": {
    "building": "北区宿舍楼",
    "room": "304B",
    "phone": "13800138000"
  },
  "payment": {
    "type": "CAMPUS_CARD"
  }
}
```

**后端实现** (`routes/orders.js`):
```javascript
const express = require('express');
const { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  cancelOrder,
  getUserBalance,
  validateCartItems 
} = require('../database/db');

const router = express.Router();

// JWT中间件（验证登录）
const authMiddleware = require('../middleware/auth');

// 创建订单
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, address, payment } = req.body;
    const userId = req.user.userId;  // 从JWT中获取

    // 1. 验证购物车商品
    const validation = validateCartItems(items);
    if (!validation.valid) {
      return res.status(400).json({
        code: 1005,
        message: '部分商品已售出或下架',
        data: { invalidItems: validation.invalidItems },
        timestamp: Date.now()
      });
    }

    // 2. 计算总金额
    const totalAmount = validation.items.reduce((sum, item) => sum + item.price, 0);

    // 3. 检查余额
    const balance = getUserBalance(userId);
    if (balance < totalAmount) {
      return res.status(400).json({
        code: 1008,
        message: `余额不足，当前余额: ${balance.toFixed(2)}元，需要: ${totalAmount.toFixed(2)}元`,
        data: null,
        timestamp: Date.now()
      });
    }

    // 4. 生成订单号
    const orderNo = Date.now().toString() + Math.floor(Math.random() * 1000);

    // 5. 创建订单（自动扣款、给卖家加钱、更新教材状态）
    const orderId = createOrder({
      orderNo,
      userId,
      totalAmount,
      items,
      address,
      payment,
      status: 'PENDING_PAYMENT'
    });

    // 6. 返回订单信息
    const order = getOrderById(orderId);
    
    res.json({
      code: 200,
      message: '订单创建成功',
      data: order,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('创建订单失败:', error);
    
    // 余额不足的错误
    if (error.message.includes('余额不足')) {
      return res.status(400).json({
        code: 1008,
        message: error.message,
        data: null,
        timestamp: Date.now()
      });
    }

    res.status(500).json({
      code: 500,
      message: error.message || '订单创建失败',
      data: null,
      timestamp: Date.now()
    });
  }
});

// 获取用户订单列表
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId;
    const status = req.query.status;

    const orders = getUserOrders(userId, status);

    res.json({
      code: 200,
      message: '操作成功',
      data: {
        total: orders.length,
        pageNum: 1,
        pageSize: orders.length,
        totalPages: 1,
        records: orders
      },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('查询订单失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
});

// 取消订单
router.put('/:orderId/cancel', authMiddleware, (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    cancelOrder(orderId);

    res.json({
      code: 200,
      message: '订单已取消',
      data: null,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(400).json({
      code: 400,
      message: error.message || '取消订单失败',
      data: null,
      timestamp: Date.now()
    });
  }
});

module.exports = router;
```

---

## 余额管理接口

### 获取用户余额 (`GET /api/users/me/balance`)

**后端实现** (`routes/users.js`):
```javascript
const express = require('express');
const { getUserById, getUserBalance, updateUserBalance } = require('../database/db');

const router = express.Router();
const authMiddleware = require('../middleware/auth');

// 获取当前用户余额
router.get('/me/balance', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId;
    const balance = getUserBalance(userId);

    res.json({
      code: 200,
      message: '操作成功',
      data: { balance },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('查询余额失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
});

// 充值余额（模拟）
router.post('/me/recharge', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        code: 400,
        message: '充值金额必须大于0',
        data: null,
        timestamp: Date.now()
      });
    }

    // 增加余额
    updateUserBalance(userId, amount);
    const newBalance = getUserBalance(userId);

    res.json({
      code: 200,
      message: '充值成功',
      data: { balance: newBalance },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('充值失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
});

module.exports = router;
```

---

## 完整示例代码

### JWT认证中间件 (`middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  try {
    // 从请求头获取Token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请登录',
        data: null,
        timestamp: Date.now()
      });
    }

    const token = authHeader.substring(7);  // 移除'Bearer '
    
    // 验证Token
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded;  // { userId, username }
    
    next();

  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'Token无效或已过期',
      data: null,
      timestamp: Date.now()
    });
  }
};
```

---

## 完整的支付流程说明

### 创建订单+支付的完整流程：

**1. 前端提交订单**
```javascript
// 前端代码
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    items: [{ bookId: 1 }, { bookId: 3 }],
    address: { building: '北区', room: '304B', phone: '13800138000' },
    payment: { type: 'CAMPUS_CARD' }
  })
});
```

**2. 后端处理（db.js中的createOrder函数）**
```
步骤1: 检查用户余额是否足够
步骤2: 创建订单记录（状态=PENDING_PAYMENT）
步骤3: 创建订单项
步骤4: 更新教材状态为SOLD_OUT
步骤5: 给卖家账户增加余额（+教材价格）
步骤6: 扣除买家账户余额（-订单总额）
步骤7: 更新订单状态为PAID，记录支付时间
步骤8: 返回订单ID
```

**3. 事务保证**
- 所有操作在一个事务中执行
- 任何步骤失败，所有操作回滚
- 保证数据一致性

---

## 测试数据说明

测试用户的初始余额（seed.sql中已设置）：
- 张伟: 1000.00元
- 李娜: 1500.00元
- 王强: 800.00元
- 赵敏: 2000.00元
- 刘洋: 500.00元

可以使用这些账号测试购买流程！

---

## 错误码汇总

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 1001 | 用户名已存在 |
| 1002 | 用户不存在 |
| 1003 | 密码错误 |
| 1004 | 教材不存在 |
| 1005 | 教材已售出 |
| 1008 | 余额不足 |
| 500 | 服务器内部错误 |
