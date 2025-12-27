const db = require('../src/config/database.config');
const fs = require('fs');
const path = require('path');

console.log('🔄 开始重新初始化数据库...\n');

try {
  // 1. 清空所有表的数据
  console.log('第1步：清空旧数据...');
  db.prepare('DELETE FROM order_item').run();
  db.prepare('DELETE FROM "order"').run();
  db.prepare('DELETE FROM book').run();
  db.prepare('DELETE FROM user').run();
  console.log('✅ 旧数据已清空\n');

  // 2. 重置自增ID
  console.log('第2步：重置自增ID...');
  db.prepare('DELETE FROM sqlite_sequence').run();
  console.log('✅ 自增ID已重置\n');

  // 3. 导入测试数据
  console.log('第3步：导入测试数据...');
  const seedPath = path.join(__dirname, '../database/seed.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf8');
  
  db.exec(seedSQL);
  console.log('✅ 测试数据已导入\n');

  // 4. 验证数据
  const userCount = db.prepare('SELECT COUNT(*) as count FROM user').get().count;
  const bookCount = db.prepare('SELECT COUNT(*) as count FROM book').get().count;
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM "order"').get().count;
  
  console.log('📊 数据统计：');
  console.log(`   用户: ${userCount} 个`);
  console.log(`   教材: ${bookCount} 本`);
  console.log(`   订单: ${orderCount} 个`);
  
  console.log('\n✨ 数据库初始化完成！');
} catch (error) {
  console.error('❌ 初始化失败:', error);
  process.exit(1);
}
