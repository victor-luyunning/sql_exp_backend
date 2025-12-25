-- ========================================
-- 校园二手教材交易平台 - 数据库初始化脚本
-- 数据库类型: SQLite 3
-- 创建时间: 2023-12-25
-- ========================================

-- 启用外键约束（SQLite默认关闭）
PRAGMA foreign_keys = ON;

-- ========================================
-- 1. 用户表 (user)
-- ========================================
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  student_id TEXT,
  phone TEXT,
  avatar TEXT,
  department TEXT,
  grade TEXT,
  balance REAL NOT NULL DEFAULT 0.00,
  status INTEGER NOT NULL DEFAULT 1,
  deleted INTEGER NOT NULL DEFAULT 0,
  create_time TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  update_time TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_user_student_id ON user(student_id);

-- ========================================
-- 2. 教材表 (book)
-- ========================================
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL,
  isbn10 TEXT,
  cover_image TEXT,
  images TEXT,
  price REAL NOT NULL,
  original_price REAL,
  condition TEXT NOT NULL,
  condition_note TEXT,
  edition TEXT,
  publisher TEXT,
  publish_date TEXT,
  course_name TEXT,
  department TEXT,
  categories TEXT,
  stock INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ON_SALE',
  description TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0,
  create_time TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  update_time TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (seller_id) REFERENCES user(id)
);

-- 教材表索引
CREATE INDEX IF NOT EXISTS idx_book_seller_id ON book(seller_id);
CREATE INDEX IF NOT EXISTS idx_book_isbn ON book(isbn);
CREATE INDEX IF NOT EXISTS idx_book_status ON book(status);
CREATE INDEX IF NOT EXISTS idx_book_create_time ON book(create_time);

-- ========================================
-- 3. 订单表 (order)
-- ========================================
CREATE TABLE IF NOT EXISTS "order" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
  building TEXT NOT NULL,
  room TEXT NOT NULL,
  phone TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  payment_time TEXT,
  remark TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  create_time TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  update_time TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 订单表索引
CREATE INDEX IF NOT EXISTS idx_order_user_id ON "order"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_order_create_time ON "order"(create_time);

-- ========================================
-- 4. 订单项表 (order_item)
-- ========================================
CREATE TABLE IF NOT EXISTS order_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  book_title TEXT NOT NULL,
  book_author TEXT NOT NULL,
  book_isbn TEXT NOT NULL,
  book_cover TEXT,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  seller_id INTEGER NOT NULL,
  create_time TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (order_id) REFERENCES "order"(id),
  FOREIGN KEY (book_id) REFERENCES book(id),
  FOREIGN KEY (seller_id) REFERENCES user(id)
);

-- 订单项表索引
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_book_id ON order_item(book_id);
CREATE INDEX IF NOT EXISTS idx_order_item_seller_id ON order_item(seller_id);
