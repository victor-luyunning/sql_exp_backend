// 数据库表结构升级脚本 - 添加缺失的字段

const db = require('../src/config/database.config');

console.log('🔧 开始升级数据库表结构...\n');

try {
  // ========== 升级 user 表 ==========
  console.log('📋 检查 user 表...');
  const userColumns = db.prepare("PRAGMA table_info(user)").all();
  const userColumnNames = userColumns.map(col => col.name);
  
  const userFieldsToAdd = [
    { name: 'major', sql: 'ALTER TABLE user ADD COLUMN major TEXT' },
  ];
  
  let userAddedCount = 0;
  for (const field of userFieldsToAdd) {
    if (!userColumnNames.includes(field.name)) {
      console.log(`  ➕ 添加字段: ${field.name}`);
      db.prepare(field.sql).run();
      userAddedCount++;
    }
  }
  
  if (userAddedCount === 0) {
    console.log('  ✅ user 表已是最新');
  } else {
    console.log(`  ✅ user 表已添加 ${userAddedCount} 个字段`);
  }
  console.log('');
  
  // ========== 升级 book 表 ==========
  console.log('📋 检查 book 表...');
  const bookColumns = db.prepare("PRAGMA table_info(book)").all();
  const bookColumnNames = bookColumns.map(col => col.name);
  
  const bookFieldsToAdd = [
    { name: 'title_en', sql: 'ALTER TABLE book ADD COLUMN title_en TEXT' },
    { name: 'isbn10', sql: 'ALTER TABLE book ADD COLUMN isbn10 TEXT' },
    { name: 'cover_image', sql: 'ALTER TABLE book ADD COLUMN cover_image TEXT' },
    { name: 'images', sql: 'ALTER TABLE book ADD COLUMN images TEXT' },
    { name: 'condition_note', sql: 'ALTER TABLE book ADD COLUMN condition_note TEXT' },
    { name: 'edition', sql: 'ALTER TABLE book ADD COLUMN edition TEXT' },
    { name: 'publisher', sql: 'ALTER TABLE book ADD COLUMN publisher TEXT' },
    { name: 'publish_date', sql: 'ALTER TABLE book ADD COLUMN publish_date TEXT' },
    { name: 'course_name', sql: 'ALTER TABLE book ADD COLUMN course_name TEXT' },
    { name: 'department', sql: 'ALTER TABLE book ADD COLUMN department TEXT' },
    { name: 'categories', sql: 'ALTER TABLE book ADD COLUMN categories TEXT' },
    { name: 'description', sql: 'ALTER TABLE book ADD COLUMN description TEXT' },
    { name: 'view_count', sql: 'ALTER TABLE book ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0' },
  ];
  
  let bookAddedCount = 0;
  for (const field of bookFieldsToAdd) {
    if (!bookColumnNames.includes(field.name)) {
      console.log(`  ➕ 添加字段: ${field.name}`);
      db.prepare(field.sql).run();
      bookAddedCount++;
    }
  }
  
  if (bookAddedCount === 0) {
    console.log('  ✅ book 表已是最新');
  } else {
    console.log(`  ✅ book 表已添加 ${bookAddedCount} 个字段`);
  }
  
  console.log('\n✨ 数据库升级完成！');
  
} catch (error) {
  console.error('❌ 升级失败:', error);
  process.exit(1);
}
