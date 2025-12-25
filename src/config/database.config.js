const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 从环境变量读取路径，如果没有则默认存放在 data 目录
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/campus_textbook.db');

// 自动创建 data 目录（防止报错）
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 连接数据库
const db = new Database(dbPath, {
    // 打印执行的 SQL 语句，方便调试
    verbose: console.log 
});

// 启用外键约束（这能保证如果用户不存在，就没法发书）
db.pragma('foreign_keys = ON');

module.exports = db;