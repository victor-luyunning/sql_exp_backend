const db = require('../src/config/database.config'); // 确保引入了上面的配置
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

try {
    // 关键点：这一步会执行建表语句
    db.exec(schema);
    console.log('✅ 表结构创建成功！');
    
    // 顺便检查一下表是否真的存在
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").get();
    if (tableCheck) {
        console.log('确认：user 表已存在！');
    } else {
        console.log('警告：user 表还是没建成功，请检查 schema.sql 内容');
    }
} catch (err) {
    console.error('初始化失败:', err);
} finally {
    db.close();
}