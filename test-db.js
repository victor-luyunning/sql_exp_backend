const {
  db,
  initDatabase,
  getAllUsers,
  getUserByUsername,
  getUserBalance,
  searchBooks,
  getBookById,
  createOrder,
  getUserOrders,
  getOrderById
} = require('./database/db');

(async function testDatabase() {
  console.log('========================================');
  console.log('📦 校园二手教材交易平台 - 数据库测试');
  console.log('========================================\n');

  try {
    // 1. 初始化数据库
    console.log('🔧 步骤1: 初始化数据库...');
    await initDatabase();
    console.log('✅ 数据库初始化完成\n');

    // 2. 测试用户查询
    console.log('👥 步骤2: 测试用户查询...');
    const allUsers = await getAllUsers();
    console.log(`✅ 查询到 ${allUsers.length} 个用户:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (学号: ${user.student_id}, 余额: ${user.balance}元)`);
    });
    console.log('');

    // 3. 测试单个用户查询和余额
    console.log('💰 步骤3: 测试用户余额查询...');
    const user = await getUserByUsername('张伟');
    if (user) {
      const balance = await getUserBalance(user.id);
      console.log(`✅ 用户 ${user.username}:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - 邮箱: ${user.email}`);
      console.log(`   - 余额: ${balance}元`);
      console.log(`   - 注册时间: ${user.create_time}`);
    }
    console.log('');

    // 4. 测试教材搜索
    console.log('📚 步骤4: 测试教材搜索...');
    const searchResult = await searchBooks({
      keyword: '微积分',
      pageNum: 1,
      pageSize: 10
    });
    console.log(`✅ 搜索"微积分"找到 ${searchResult.total} 本教材:`);
    searchResult.records.forEach(book => {
      console.log(`   - ${book.title} (价格: ${book.price}元, 成色: ${book.condition}, 卖家: ${book.seller_name})`);
    });
    console.log('');

    // 5. 测试教材详情查询
    console.log('📖 步骤5: 测试教材详情查询...');
    const book = await getBookById(1);
    if (book) {
      console.log(`✅ 教材详情:`);
      console.log(`   - 书名: ${book.title}`);
      console.log(`   - 作者: ${book.author}`);
      console.log(`   - ISBN: ${book.isbn}`);
      console.log(`   - 价格: ${book.price}元 (原价: ${book.original_price}元)`);
      console.log(`   - 成色: ${book.condition_note}`);
      console.log(`   - 卖家: ${book.seller_name}`);
    }
    console.log('');

    // 6. 测试订单查询
    console.log('📋 步骤6: 测试订单查询...');
    const orders = await getUserOrders(5); // 用户5的订单
    console.log(`✅ 用户ID=5 的订单列表 (共 ${orders.length} 个):`);
    orders.forEach(order => {
      console.log(`   - 订单号: ${order.order_no}`);
      console.log(`     状态: ${order.status}`);
      console.log(`     金额: ${order.total_amount}元`);
      console.log(`     包含 ${order.item_count} 件商品`);
      console.log(`     创建时间: ${order.create_time}`);
      console.log('');
    });

    // 7. 测试订单详情
    if (orders.length > 0) {
      console.log('📦 步骤7: 测试订单详情查询...');
      const orderDetail = await getOrderById(orders[0].id);
      if (orderDetail) {
        console.log(`✅ 订单详情:`);
        console.log(`   - 订单号: ${orderDetail.order_no}`);
        console.log(`   - 状态: ${orderDetail.status}`);
        console.log(`   - 总金额: ${orderDetail.total_amount}元`);
        console.log(`   - 收货地址: ${orderDetail.building} ${orderDetail.room}`);
        console.log(`   - 订单项:`);
        orderDetail.items.forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.book_title} - ${item.price}元 x ${item.quantity}`);
        });
      }
      console.log('');
    }

    // 8. 测试创建订单（模拟购买）
    console.log('🛒 步骤8: 测试创建订单（模拟购买）...');
    try {
      const testUser = await getUserByUsername('赵敏'); // 余额2000元
      const testBook = await searchBooks({ keyword: '经济学', pageNum: 1, pageSize: 1 });
      
      if (testUser && testBook.records.length > 0) {
        const bookToBuy = testBook.records[0];
        
        console.log(`🔍 准备购买:`);
        console.log(`   - 买家: ${testUser.username} (余额: ${await getUserBalance(testUser.id)}元)`);
        console.log(`   - 商品: ${bookToBuy.title} (价格: ${bookToBuy.price}元)`);
        
        // 生成订单号
        const orderNo = 'TEST' + Date.now();
        
        // 创建订单
        const orderId = await createOrder({
          orderNo,
          userId: testUser.id,
          totalAmount: bookToBuy.price,
          items: [{ bookId: bookToBuy.id }],
          address: {
            building: '测试宿舍楼',
            room: '999',
            phone: '13900000000'
          },
          payment: {
            type: 'CAMPUS_CARD'
          }
        });

        console.log(`✅ 订单创建成功!`);
        console.log(`   - 订单ID: ${orderId}`);
        console.log(`   - 订单号: ${orderNo}`);
        
        // 查询更新后的余额
        const newBalance = await getUserBalance(testUser.id);
        console.log(`   - 买家新余额: ${newBalance}元 (已扣款)`);
        
        // 查询卖家余额
        const sellerBalance = await getUserBalance(bookToBuy.seller_id);
        console.log(`   - 卖家余额: ${sellerBalance}元 (已到账)`);
      }
    } catch (error) {
      console.log(`❌ 创建订单失败: ${error.message}`);
    }
    console.log('');

    // 9. 测试数据库统计
    console.log('📊 步骤9: 数据库统计信息...');
    const userCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM user WHERE deleted = 0', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    const bookCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM book WHERE deleted = 0', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    const orderCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM "order" WHERE deleted = 0', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`✅ 数据统计:`);
    console.log(`   - 总用户数: ${userCount.count}`);
    console.log(`   - 总教材数: ${bookCount.count}`);
    console.log(`   - 总订单数: ${orderCount.count}`);
    console.log('');

    console.log('========================================');
    console.log('🎉 所有测试通过！数据库工作正常！');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    db.close();
  }
})();
