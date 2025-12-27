const sqlite3 = require('sqlite3').verbose();
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

let db = null;

// 初始化数据库连接
function initDB() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ 数据库连接失败:', err.message);
        reject(err);
      } else {
        console.log('📦 数据库连接成功:', DB_PATH);
        // 启用外键约束
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) reject(err);
          else resolve(db);
        });
      }
    });
  });
}

// 工具函数：将sqlite3回调转为Promise
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function execAsync(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * 初始化数据库
 * 执行建表脚本和测试数据脚本
 */
async function initDatabase() {
  console.log('🔧 开始初始化数据库...');

  try {
    // 先初始化数据库连接
    if (!db) {
      await initDB();
    }

    // 检查user表是否存在
    const tableExists = await getAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user'"
    );

    if (!tableExists) {
      console.log('📝 执行建表脚本 (schema.sql)...');
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
      await execAsync(schema);
      console.log('✅ 数据表创建成功');

      // 插入测试数据
      console.log('📝 执行测试数据脚本 (seed.sql)...');
      const seed = fs.readFileSync(SEED_PATH, 'utf8');
      await execAsync(seed);
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
async function getAllUsers() {
  return await allAsync('SELECT * FROM user WHERE deleted = 0');
}

/**
 * 根据ID查询用户
 */
async function getUserById(id) {
  return await getAsync('SELECT * FROM user WHERE id = ? AND deleted = 0', [id]);
}

/**
 * 根据用户名查询用户
 */
async function getUserByUsername(username) {
  return await getAsync('SELECT * FROM user WHERE username = ? AND deleted = 0', [username]);
}

/**
 * 根据邮箱查询用户
 */
async function getUserByEmail(email) {
  return await getAsync('SELECT * FROM user WHERE email = ? AND deleted = 0', [email]);
}

/**
 * 创建用户
 */
async function createUser(userData) {
  const result = await runAsync(`
    INSERT INTO user (username, password, salt, email, student_id, phone, avatar, department, grade, balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
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
  ]);
  
  return result.lastID;
}

/**
 * 获取用户余额
 */
async function getUserBalance(userId) {
  const result = await getAsync('SELECT balance FROM user WHERE id = ? AND deleted = 0', [userId]);
  return result ? result.balance : 0;
}

/**
 * 更新用户余额
 */
async function updateUserBalance(userId, amount) {
  return await runAsync('UPDATE user SET balance = balance + ? WHERE id = ?', [amount, userId]);
}

/**
 * 检查余额是否足够
 */
async function checkBalance(userId, requiredAmount) {
  const balance = await getUserBalance(userId);
  return balance >= requiredAmount;
}

/**
 * 搜索教材
 */
async function searchBooks(params) {
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

  const books = await allAsync(sql, values);

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
  const countResult = await getAsync(countSql, countValues);

  return {
    records: books,
    total: countResult.total,
    pageNum,
    pageSize,
    totalPages: Math.ceil(countResult.total / pageSize)
  };
}

/**
 * 根据ID获取教材详情
 */
async function getBookById(id) {
  return await getAsync(`
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
  `, [id]);
}

/**
 * 获取最新发布的教材
 */
async function getLatestBooks(limit = 8) {
  return await allAsync(`
    SELECT 
      b.*,
      u.username AS seller_name,
      u.avatar AS seller_avatar
    FROM book b
    LEFT JOIN user u ON b.seller_id = u.id
    WHERE b.deleted = 0 AND b.status = 'ON_SALE'
    ORDER BY b.create_time DESC
    LIMIT ?
  `, [limit]);
}

/**
 * 验证购物车商品
 */
async function validateCartItems(items) {
  const bookIds = items.map(item => item.bookId);
  const placeholders = bookIds.map(() => '?').join(',');
  
  const books = await allAsync(`
    SELECT id, title, author, isbn, price, condition, stock, status
    FROM book
    WHERE id IN (${placeholders}) AND deleted = 0
  `, bookIds);

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
async function createOrder(orderData) {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 开启事务
        await runAsync('BEGIN TRANSACTION');

        // 1. 检查用户余额
        const balance = await getUserBalance(orderData.userId);
        if (balance < orderData.totalAmount) {
          throw new Error(`余额不足，当前余额: ${balance}元，需要: ${orderData.totalAmount}元`);
        }

        // 2. 创建订单
        const orderResult = await runAsync(`
          INSERT INTO "order" (order_no, user_id, total_amount, status, building, room, phone, payment_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderData.orderNo,
          orderData.userId,
          orderData.totalAmount,
          orderData.status || 'PENDING_PAYMENT',
          orderData.address.building,
          orderData.address.room,
          orderData.address.phone,
          orderData.payment.type
        ]);
        
        const orderId = orderResult.lastID;

        // 3. 插入订单项
        for (const item of orderData.items) {
          const book = await getBookById(item.bookId);
          if (!book) {
            throw new Error(`教材不存在: ${item.bookId}`);
          }
          if (book.status !== 'ON_SALE') {
            throw new Error(`教材已售出: ${book.title}`);
          }

          await runAsync(`
            INSERT INTO order_item (order_id, book_id, book_title, book_author, book_isbn, book_cover, price, quantity, seller_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            orderId,
            book.id,
            book.title,
            book.author,
            book.isbn,
            book.cover_image,
            book.price,
            1,
            book.seller_id
          ]);

          // 4. 更新教材状态为已售出
          await runAsync('UPDATE book SET status = ?, stock = 0 WHERE id = ?', ['SOLD_OUT', book.id]);
          
          // 5. 给卖家增加余额
          await updateUserBalance(book.seller_id, book.price);
        }

        // 6. 扣除买家余额
        await updateUserBalance(orderData.userId, -orderData.totalAmount);

        // 7. 更新订单状态为已支付
        await runAsync('UPDATE "order" SET status = ?, payment_time = datetime("now", "localtime") WHERE id = ?', ['PAID', orderId]);

        // 提交事务
        await runAsync('COMMIT');
        resolve(orderId);

      } catch (error) {
        // 回滚事务
        await runAsync('ROLLBACK');
        reject(error);
      }
    });
  });
}

/**
 * 获取用户订单列表
 */
async function getUserOrders(userId, status = null) {
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
  
  return await allAsync(sql, params);
}

/**
 * 获取订单详情
 */
async function getOrderById(orderId) {
  const order = await getAsync(`
    SELECT * FROM "order" WHERE id = ?
  `, [orderId]);

  if (!order) return null;

  const items = await allAsync(`
    SELECT 
      oi.*,
      u.username AS seller_name,
      u.avatar AS seller_avatar
    FROM order_item oi
    LEFT JOIN user u ON oi.seller_id = u.id
    WHERE oi.order_id = ?
  `, [orderId]);

  return {
    ...order,
    items
  };
}

/**
 * 取消订单（恢复余额）
 */
async function cancelOrder(orderId) {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 开启事务
        await runAsync('BEGIN TRANSACTION');

        // 获取订单信息
        const order = await getAsync('SELECT user_id, total_amount, status FROM "order" WHERE id = ?', [orderId]);
        
        if (!order) {
          throw new Error('订单不存在');
        }
        
        if (order.status !== 'PENDING_PAYMENT') {
          throw new Error('只有待支付订单才能取消');
        }

        // 1. 更新订单状态
        await runAsync('UPDATE "order" SET status = ? WHERE id = ?', ['CANCELLED', orderId]);

        // 2. 恢复教材库存和状态
        const items = await allAsync('SELECT book_id FROM order_item WHERE order_id = ?', [orderId]);
        
        for (const item of items) {
          await runAsync('UPDATE book SET status = ?, stock = 1 WHERE id = ?', ['ON_SALE', item.book_id]);
        }

        // 提交事务
        await runAsync('COMMIT');
        resolve();

      } catch (error) {
        // 回滚事务
        await runAsync('ROLLBACK');
        reject(error);
      }
    });
  });
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
