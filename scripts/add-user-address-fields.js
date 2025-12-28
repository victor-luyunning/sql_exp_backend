const db = require('../src/config/database.config');

console.log('🔧 开始为用户表添加地址和支付信息字段...\n');

try {
  // 检查 user 表的字段
  const columns = db.prepare("PRAGMA table_info(user)").all();
  const columnNames = columns.map(col => col.name);
  
  console.log('当前 user 表字段:', columnNames.join(', '));
  console.log('');
  
  const fieldsToAdd = [
    { name: 'default_dormitory', sql: 'ALTER TABLE user ADD COLUMN default_dormitory TEXT', desc: '默认宿舍楼' },
    { name: 'default_room_number', sql: 'ALTER TABLE user ADD COLUMN default_room_number TEXT', desc: '默认房间号' },
    { name: 'default_phone', sql: 'ALTER TABLE user ADD COLUMN default_phone TEXT', desc: '默认联系电话' },
    { name: 'campus_card_number', sql: 'ALTER TABLE user ADD COLUMN campus_card_number TEXT', desc: '校园一卡通号' }
  ];
  
  let addedCount = 0;
  
  for (const field of fieldsToAdd) {
    if (!columnNames.includes(field.name)) {
      console.log(`➕ 添加字段: ${field.name} (${field.desc})`);
      db.prepare(field.sql).run();
      addedCount++;
    } else {
      console.log(`✓ 字段已存在: ${field.name}`);
    }
  }
  
  if (addedCount > 0) {
    console.log(`\n✅ 已添加 ${addedCount} 个字段`);
  } else {
    console.log('\n✅ 所有字段都已存在，无需添加');
  }
  
  console.log('\n✨ 用户表升级完成！');
} catch (error) {
  console.error('❌ 升级失败:', error);
  process.exit(1);
}
