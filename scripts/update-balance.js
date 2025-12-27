// 更新现有数据库，添加 balance 字段并设置默认值为 200

const db = require('../src/config/database.config');

console.log('开始更新数据库...');

try {
  // 1. 检查 balance 列是否存在
  const tableInfo = db.prepare("PRAGMA table_info(user)").all();
  const hasBalance = tableInfo.some(col => col.name === 'balance');

  if (!hasBalance) {
    console.log('添加 balance 列...');
    db.prepare('ALTER TABLE user ADD COLUMN balance REAL NOT NULL DEFAULT 200.00').run();
    console.log('✓ balance 列添加成功');
  } else {
    console.log('balance 列已存在');
    
    // 2. 更新所有用户的 balance 为 200（如果当前为 0 或 null）
    console.log('更新现有用户的 balance...');
    const result = db.prepare('UPDATE user SET balance = 200.00 WHERE balance = 0 OR balance IS NULL').run();
    console.log(`✓ 已更新 ${result.changes} 个用户的余额为 200 元`);
  }

  console.log('\n数据库更新完成！');
  console.log('所有用户的初始余额已设置为 200 元');
  
} catch (error) {
  console.error('更新失败:', error);
  process.exit(1);
}
