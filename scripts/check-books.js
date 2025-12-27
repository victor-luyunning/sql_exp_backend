// 查看数据库中的所有教材

const db = require('../src/config/database.config');

console.log('=== 数据库中的所有教材 ===\n');

try {
  const books = db.prepare('SELECT id, title, author, isbn, price, status, seller_id, create_time FROM book ORDER BY id').all();
  
  if (books.length === 0) {
    console.log('⚠️  数据库中没有任何教材数据！');
    console.log('\n建议执行: node scripts/init-db.js');
  } else {
    console.log(`📚 共找到 ${books.length} 本教材：\n`);
    books.forEach(book => {
      console.log(`ID: ${book.id}`);
      console.log(`标题: ${book.title}`);
      console.log(`作者: ${book.author}`);
      console.log(`ISBN: ${book.isbn}`);
      console.log(`价格: ¥${book.price}`);
      console.log(`状态: ${book.status}`);
      console.log(`卖家ID: ${book.seller_id}`);
      console.log(`创建时间: ${book.create_time}`);
      console.log('---');
    });
  }
} catch (error) {
  console.error('查询失败:', error);
}
