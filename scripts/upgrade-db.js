// 数据库表结构升级脚本 - 添加缺失的字段

const db = require('../src/config/database.config');

console.log('🔧 开始升级数据库表结构...\n');

try {
  // 检查 book 表的所有列
  const columns = db.prepare("PRAGMA table_info(book)").all();
  const columnNames = columns.map(col => col.name);
  
  console.log('当前 book 表的字段:', columnNames.join(', '));
  console.log('');
  
  // 需要添加的字段列表
  const fieldsToAdd = [
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
  
  let addedCount = 0;
  
  for (const field of fieldsToAdd) {
    if (!columnNames.includes(field.name)) {
      console.log(`➕ 添加字段: ${field.name}`);
      db.prepare(field.sql).run();
      addedCount++;
    }
  }
  
  if (addedCount === 0) {
    console.log('✅ 表结构已是最新，无需升级');
  } else {
    console.log(`\n✅ 已添加 ${addedCount} 个字段`);
  }
  
  // 再次检查
  const newColumns = db.prepare("PRAGMA table_info(book)").all();
  console.log(`\n📊 当前 book 表共有 ${newColumns.length} 个字段`);
  
} catch (error) {
  console.error('❌ 升级失败:', error);
  process.exit(1);
}
