const db = require('../src/config/database.config');

console.log('🔧 开始添加 balance 字段...\n');

try {
  // 1. 检查字段是否已存在
  const columns = db.prepare("PRAGMA table_info(user)").all();
  const hasBalance = columns.some(col => col.name === 'balance');
  
  if (hasBalance) {
    console.log('✅ balance 字段已存在，无需添加');
  } else {
    // 2. 添加 balance 字段
    console.log('➕ 添加 balance 字段...');
    db.prepare('ALTER TABLE user ADD COLUMN balance REAL NOT NULL DEFAULT 200.00').run();
    console.log('✅ balance 字段添加成功');
    
    // 3. 更新现有用户的 balance
    console.log('📝 更新现有用户余额为 200 元...');
    const result = db.prepare('UPDATE user SET balance = 200.00 WHERE balance = 0').run();
    console.log(`✅ 已更新 ${result.changes} 个用户的余额`);
  }
  
  // 4. 验证
  const users = db.prepare('SELECT id, username, balance FROM user').all();
  console.log('\n📊 当前用户余额情况：');
  users.forEach(u => {
    console.log(`   用户 ${u.username}: ${u.balance} 元`);
  });
  
  console.log('\n✨ 完成！');
} catch (error) {
  console.error('❌ 操作失败:', error);
  process.exit(1);
}
