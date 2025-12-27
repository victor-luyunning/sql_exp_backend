const db = require('../src/config/database.config');

console.log('🔧 开始升级数据库表结构...\n');

try {
  // 检查 book 表的字段
  const columns = db.prepare("PRAGMA table_info(book)").all();
  const columnNames = columns.map(col => col.name);
  
  console.log('当前 book 表字段:', columnNames.join(', '));
  console.log('');
  
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
    { name: 'view_count', sql: 'ALTER TABLE book ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0' }
  ];
  
  let addedCount = 0;
  
  for (const field of fieldsToAdd) {
    if (!columnNames.includes(field.name)) {
      console.log(`➕ 添加字段: ${field.name}`);
      db.prepare(field.sql).run();
      addedCount++;
    }
  }
  
  if (addedCount > 0) {
    console.log(`\n✅ 已添加 ${addedCount} 个字段`);
  } else {
    console.log('✅ 所有字段都已存在，无需添加');
  }
  
  // 检查 order_item 表的字段
  const orderItemColumns = db.prepare("PRAGMA table_info(order_item)").all();
  const orderItemColumnNames = orderItemColumns.map(col => col.name);
  
  if (!orderItemColumnNames.includes('book_cover')) {
    console.log('\n➕ 添加 order_item.book_cover 字段');
    db.prepare('ALTER TABLE order_item ADD COLUMN book_cover TEXT').run();
  }
  
  console.log('\n✨ 表结构升级完成！');
} catch (error) {
  console.error('❌ 升级失败:', error);
  process.exit(1);
}
