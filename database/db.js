const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, '../data/campus_textbook.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

// 确保data目录存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ 创建data目录');
}

// 连接数据库（如果不存在会自动创建）
const db = new Database(DB_PATH);

// 启用外键约束（SQLite默认关闭，必须手动开启）
db.pragma('foreign_keys = ON');

console.log('📦 数据库连接成功:', DB_PATH);

/**
 * 初始化数据库
 * 执行建表脚本和测试数据脚本
 */
function initDatabase() {
  console.log('🔧 开始初始化数据库...');

  try {
    // 检查user表是否存在
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user'"
    ).get();

    if (!tableExists) {
      console.log('📝 执行建表脚本 (schema.sql)...');
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
      db.exec(schema);
      console.log('✅ 数据表创建成功');

      // 插入测试数据
      console.log('📝 执行测试数据脚本 (seed.sql)...');
      const seed = fs.readFileSync(SEED_PATH, 'utf8');
      db.exec(seed);
      console.log('✅ 测试数据插入成功');
      
      console.log('🎉 数据库初始化完成！');
    } else {
      console.log('ℹ️  数据表已存在，跳过初始化');
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  }
}

/**
 * 查询所有用户
 */
function getAllUsers() {
  return db.prepare('SELECT * FROM user WHERE deleted = 0').all();
}

/**
 * 根据ID查询用户
 */
function getUserById(id) {
  return db.prepare('SELECT * FROM user WHERE id = ? AND deleted = 0').get(id);
}

/**
 * 根据用户名查询用户
 */
function getUserByUsername(username) {
  return db.prepare('SELECT * FROM user WHERE username = ? AND deleted = 0').get(username);
}

/**
 * 根据邮箱查询用户
 */
function getUserByEmail(email) {
  return db.prepare('SELECT * FROM user WHERE email = ? AND deleted = 0').get(email);
}

/**
 * 创建用户
 */
function createUser(userData) {
  const stmt = db.prepare(`
    INSERT INTO user (username, password, salt, email, student_id, phone, avatar, department, grade, balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    userData.username,
    userData.password,
    userData.salt,
    userData.email,
    userData.studentId || null,
    userData.phone || null,
    userData.avatar || null,
    userData.department || null,
    userData.grade || null,
    userData.balance || 0.00
  );
  
  return result.lastInsertRowid;
}

/**
 * 获取用户余额
 */
function getUserBalance(userId) {
  const result = db.prepare('SELECT balance FROM user WHERE id = ? AND deleted = 0').get(userId);
  return result ? result.balance : 0;
}

/**
 * 更新用户余额
 */
function updateUserBalance(userId, amount) {
  const stmt = db.prepare('UPDATE user SET balance = balance + ? WHERE id = ?');
  return stmt.run(amount, userId);
}

/**
 * 检查余额是否足够
 */
function checkBalance(userId, requiredAmount) {
  const balance = getUserBalance(userId);
  return balance >= requiredAmount;
}

/**
 * 搜索教材
 */
function searchBooks(params) {
  let sql = `
    SELECT 
      b.*,
      u.username AS seller_name,
      u.avatar AS seller_avatar
    FROM book b
    LEFT JOIN user u ON b.seller_id = u.id
    WHERE b.deleted = 0 AND b.status = 'ON_SALE'
  `;
  
  const conditions = [];
  const values = [];

  // 关键词搜索
  if (params.keyword) {
    conditions.push(`(
      b.title LIKE ? OR 
      b.author LIKE ? OR 
      b.isbn LIKE ? OR 
      b.course_name LIKE ?
    )`);
    const keyword = `%${params.keyword}%`;
    values.push(keyword, keyword, keyword, keyword);
  }

  // 价格范围
  if (params.minPrice !== undefined) {
    conditions.push('b.price >= ?');
    values.push(params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    conditions.push('b.price <= ?');
    values.push(params.maxPrice);
  }

  // 成色筛选
  if (params.conditions) {
    const conditionList = params.conditions.split(',');
    const placeholders = conditionList.map(() => '?').join(',');
    conditions.push(`b.condition IN (${placeholders})`);
    values.push(...conditionList);
  }

  // 院系筛选
  if (params.department) {
    conditions.push('b.department = ?');
    values.push(params.department);
  }

  if (conditions.length > 0) {
    sql += ' AND ' + conditions.join(' AND ');
  }

  // 排序
  const sortBy = params.sortBy || 'latest';
  const sortMap = {
    'latest': 'b.create_time DESC',
    'price_asc': 'b.price ASC',
    'price_desc': 'b.price DESC',
    'relevance': 'b.create_time DESC'
  };
  sql += ` ORDER BY ${sortMap[sortBy] || sortMap.latest}`;

  // 分页
  const pageNum = parseInt(params.pageNum) || 1;
  const pageSize = parseInt(params.pageSize) || 10;
  const offset = (pageNum - 1) * pageSize;
  
  sql += ` LIMIT ? OFFSET ?`;
  values.push(pageSize, offset);

  const books = db.prepare(sql).all(...values);

  // 获取总数
  let countSql = `
    SELECT COUNT(*) as total
    FROM book b
    WHERE b.deleted = 0 AND b.status = 'ON_SALE'
  `;
  if (conditions.length > 0) {
    countSql += ' AND ' + conditions.join(' AND ');
  }
  const countValues = values.slice(0, -2); // 移除LIMIT和OFFSET的值
  const { total } = db.prepare(countSql).get(...countValues);

  return {
    records: books,
    total,
    pageNum,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * 根据ID获取教材详情
 */
function getBookById(id) {
  return db.prepare(`
    SELECT 
      b.*,
      u.id AS seller_id,
      u.username AS seller_name,
      u.avatar AS seller_avatar,
      u.department AS seller_department,
      u.grade AS seller_grade
    FROM book b
    LEFT JOIN user u ON b.seller_id = u.id
    WHERE b.id = ? AND b.deleted = 0
  `).get(id);
}

/**
 * 获取最新发布的教材
 */
function getLatestBooks(limit = 8) {
  return db.prepare(`
    SELECT 
      b.*,
      u.username AS seller_name,
      u.avatar AS seller_avatar
    FROM book b
    LEFT JOIN user u ON b.seller_id = u.id
    WHERE b.deleted = 0 AND b.status = 'ON_SALE'
    ORDER BY b.create_time DESC
    LIMIT ?
  `).all(limit);
}

/**
 * 验证购物车商品
 */
function validateCartItems(items) {
  const bookIds = items.map(item => item.bookId);
  const placeholders = bookIds.map(() => '?').join(',');
  
  const books = db.prepare(`
    SELECT id, title, author, isbn, price, condition, stock, status
    FROM book
    WHERE id IN (${placeholders}) AND deleted = 0
  `).all(...bookIds);

  const invalidItems = [];
  const validItems = books.map(book => {
    const available = book.status === 'ON_SALE' && book.stock > 0;
    if (!available) {
      invalidItems.push(book.id);
    }
    return {
      bookId: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      price: book.price,
      condition: book.condition,
      stock: book.stock,
      status: book.status,
      available
    };
  });

  return {
    valid: invalidItems.length === 0,
    invalidItems,
    items: validItems
  };
}

/**
 * 创建订单（使用事务+余额扫款）
 */
function createOrder(orderData) {
  // 使用事务确保原子性
  const transaction = db.transaction((data) => {
    // 1. 检查用户余额
    const balance = getUserBalance(data.userId);
    if (balance < data.totalAmount) {
      throw new Error(`余额不足，当前余额: ${balance}元，需要: ${data.totalAmount}元`);
    }

    // 2. 创建订单
    const orderStmt = db.prepare(`
      INSERT INTO "order" (order_no, user_id, total_amount, status, building, room, phone, payment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const orderResult = orderStmt.run(
      data.orderNo,
      data.userId,
      data.totalAmount,
      data.status || 'PENDING_PAYMENT',
      data.address.building,
      data.address.room,
      data.address.phone,
      data.payment.type
    );
    
    const orderId = orderResult.lastInsertRowid;

    // 3. 插入订单项
    const itemStmt = db.prepare(`
      INSERT INTO order_item (order_id, book_id, book_title, book_author, book_isbn, book_cover, price, quantity, seller_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    data.items.forEach(item => {
      const book = getBookById(item.bookId);
      if (!book) {
        throw new Error(`教材不存在: ${item.bookId}`);
      }
      if (book.status !== 'ON_SALE') {
        throw new Error(`教材已售出: ${book.title}`);
      }

      itemStmt.run(
        orderId,
        book.id,
        book.title,
        book.author,
        book.isbn,
        book.cover_image,
        book.price,
        1,
        book.seller_id
      );

      // 4. 更新教材状态为已售出
      db.prepare('UPDATE book SET status = ?, stock = 0 WHERE id = ?')
        .run('SOLD_OUT', book.id);
      
      // 5. 给卖家增加余额
      updateUserBalance(book.seller_id, book.price);
    });

    // 6. 扣除买家余额
    updateUserBalance(data.userId, -data.totalAmount);

    // 7. 更新订单状态为已支付
    db.prepare('UPDATE "order" SET status = ?, payment_time = datetime("now", "localtime") WHERE id = ?')
      .run('PAID', orderId);

    return orderId;
  });

  return transaction(orderData);
}

/**
 * 获取用户订单列表
 */
function getUserOrders(userId, status = null) {
  let sql = `
    SELECT 
      o.*,
      COUNT(oi.id) AS item_count
    FROM "order" o
    LEFT JOIN order_item oi ON o.id = oi.order_id
    WHERE o.user_id = ? AND o.deleted = 0
  `;
  
  const params = [userId];
  
  if (status) {
    sql += ' AND o.status = ?';
    params.push(status);
  }
  
  sql += ' GROUP BY o.id ORDER BY o.create_time DESC';
  
  return db.prepare(sql).all(...params);
}

/**
 * 获取订单详情
 */
function getOrderById(orderId) {
  const order = db.prepare(`
    SELECT * FROM "order" WHERE id = ?
  `).get(orderId);

  if (!order) return null;

  const items = db.prepare(`
    SELECT 
      oi.*,
      u.username AS seller_name,
      u.avatar AS seller_avatar
    FROM order_item oi
    LEFT JOIN user u ON oi.seller_id = u.id
    WHERE oi.order_id = ?
  `).all(orderId);

  return {
    ...order,
    items
  };
}

/**
 * 取消订单（恢复余额）
 */
function cancelOrder(orderId) {
  const transaction = db.transaction(() => {
    // 获取订单信息
    const order = db.prepare('SELECT user_id, total_amount, status FROM "order" WHERE id = ?').get(orderId);
    
    if (!order) {
      throw new Error('订单不存在');
    }
    
    if (order.status !== 'PENDING_PAYMENT') {
      throw new Error('只有待支付订单才能取消');
    }

    // 1. 更新订单状态
    db.prepare('UPDATE "order" SET status = ? WHERE id = ?')
      .run('CANCELLED', orderId);

    // 2. 恢复教材库存和状态
    const items = db.prepare('SELECT book_id FROM order_item WHERE order_id = ?')
      .all(orderId);
    
    items.forEach(item => {
      db.prepare('UPDATE book SET status = ?, stock = 1 WHERE id = ?')
        .run('ON_SALE', item.book_id);
    });
  });

  transaction();
}

// 导出数据库实例和工具函数
module.exports = {
  db,
  initDatabase,
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  createUser,
  getUserBalance,
  updateUserBalance,
  checkBalance,
  searchBooks,
  getBookById,
  getLatestBooks,
  validateCartItems,
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
};
