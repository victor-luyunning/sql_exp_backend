-- ========================================
-- 校园二手教材交易平台 - 测试数据脚本
-- 注意: 密码均为 password123 的MD5加密值
-- ========================================

-- ========================================
-- 1. 插入测试用户（5个用户）
-- ========================================
INSERT INTO user (username, password, salt, email, student_id, phone, avatar, department, grade, balance, status) VALUES
('张伟', '5f4dcc3b5aa765d61d8327deb882cf99', 'salt001', 'zhangwei@university.edu', '20230001', '13800138001', 'https://i.pravatar.cc/150?img=1', '数学系', '2023届', 1000.00, 1),
('李娜', '5f4dcc3b5aa765d61d8327deb882cf99', 'salt002', 'lina@university.edu', '20230002', '13800138002', 'https://i.pravatar.cc/150?img=2', '计算机系', '2023届', 1500.00, 1),
('王强', '5f4dcc3b5aa765d61d8327deb882cf99', 'salt003', 'wangqiang@university.edu', '20230003', '13800138003', 'https://i.pravatar.cc/150?img=3', '物理系', '2023届', 800.00, 1),
('赵敏', '5f4dcc3b5aa765d61d8327deb882cf99', 'salt004', 'zhaomin@university.edu', '20240001', '13800138004', 'https://i.pravatar.cc/150?img=4', '化学系', '2024届', 2000.00, 1),
('刘洋', '5f4dcc3b5aa765d61d8327deb882cf99', 'salt005', 'liuyang@university.edu', '20240002', '13800138005', 'https://i.pravatar.cc/150?img=5', '生物系', '2024届', 500.00, 1);

-- ========================================
-- 2. 插入测试教材（8本教材）
-- ========================================
INSERT INTO book (seller_id, title, title_en, author, isbn, isbn10, cover_image, price, original_price, condition, condition_note, edition, publisher, publish_date, course_name, department, categories, stock, status, description) VALUES
-- 数学类
(1, '微积分：早期超越函数', 'Calculus: Early Transcendentals', 'James Stewart', '978-1285741550', '1285741552', 'https://images-na.ssl-images-amazon.com/images/I/51E8VjvQ8PL._SX384_BO1,204,203,200_.jpg', 45.00, 120.00, 'GOOD', '这本书在 MATH 101 课程中使用了一个学期。封面边角有轻微磨损，但装订依然完好紧实。第3章有少量黄色高亮标记。', '第8版', 'Cengage Learning', '2015-01-01', 'MATH 101', '数学系', '数学,微积分', 1, 'ON_SALE', '本书是微积分领域的经典教材，内容全面深入，配有大量例题和习题。'),

-- 生物类
(2, '坎贝尔生物学', 'Campbell Biology', 'Lisa A. Urry', '978-0134093413', '0134093410', 'https://images-na.ssl-images-amazon.com/images/I/51rJQE8K5gL._SX394_BO1,204,203,200_.jpg', 60.00, 150.00, 'LIKE_NEW', '几乎全新，仅翻阅过几次，无任何标记或损坏。', '第11版', 'Pearson', '2016-10-05', 'BIO 101', '生物系', '生物学,细胞生物学', 1, 'ON_SALE', '生物学领域的权威教材，涵盖细胞、遗传、进化等核心内容。'),

-- 计算机类
(3, '算法导论', 'Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', '026204630X', 'https://images-na.ssl-images-amazon.com/images/I/41T0iBxY8FL._SX440_BO1,204,203,200_.jpg', 298.00, 680.00, 'GOOD', '计算机系必备书籍，部分章节有笔记和批注，整体保存良好。', '第4版', 'MIT Press', '2022-04-05', 'CS 301', '计算机系', '计算机科学,算法,数据结构', 1, 'ON_SALE', '计算机科学领域的经典巨著，深入讲解各类算法的设计与分析。'),

-- 经济类
(4, '经济学原理', 'Principles of Economics', 'N. Gregory Mankiw', '978-1305585126', '1305585127', 'https://images-na.ssl-images-amazon.com/images/I/51cRZRW-pEL._SX396_BO1,204,203,200_.jpg', 30.00, 95.00, 'FAIR', '有一定使用痕迹，封面有折痕，内页整洁。', '第8版', 'Cengage Learning', '2017-02-17', 'ECON 101', '经济系', '经济学,宏观经济学,微观经济学', 1, 'ON_SALE', '经济学入门经典教材，适合初学者系统学习经济学原理。'),

-- 化学类
(5, '普通化学', 'Chemistry: The Central Science', 'Theodore L. Brown', '978-0134414232', '0134414233', 'https://images-na.ssl-images-amazon.com/images/I/51eY8vY8YbL._SX389_BO1,204,203,200_.jpg', 350.00, 800.00, 'GOOD', '化学专业核心教材，有少量笔记，整体良好。', '第14版', 'Pearson', '2017-01-13', 'CHEM 101', '化学系', '化学,无机化学,有机化学', 1, 'ON_SALE', '化学领域的权威教材，系统介绍化学基础知识和应用。'),

-- 物理类
(3, '大学物理（上册）', 'University Physics Volume 1', 'Samuel J. Ling', '978-1938168277', '1938168275', 'https://images-na.ssl-images-amazon.com/images/I/51K8zZ8K8PL._SX384_BO1,204,203,200_.jpg', 40.00, 98.00, 'GOOD', '物理系基础课程用书，有少量铅笔标记，可擦除。', '第1版', 'OpenStax', '2016-09-19', 'PHYS 101', '物理系', '物理学,力学,热学', 1, 'ON_SALE', '涵盖力学、振动和波动、热学等基础物理内容。'),

-- 人文类
(1, '心理学与生活', 'Psychology and Life', 'Richard Gerrig, Philip Zimbardo', '978-0205859139', '0205859135', 'https://images-na.ssl-images-amazon.com/images/I/51lKzZ8K8PL._SX384_BO1,204,203,200_.jpg', 55.00, 128.00, 'LIKE_NEW', '几乎全新，无标记无污损。', '第20版', 'Pearson', '2012-07-06', 'PSY 101', '心理学系', '心理学,认知心理学', 1, 'ON_SALE', '心理学领域的经典入门教材，理论与实践相结合。'),

-- 工程类
(2, '工程力学', 'Engineering Mechanics: Statics', 'Russell C. Hibbeler', '978-0134814971', '0134814975', 'https://images-na.ssl-images-amazon.com/images/I/51mKzZ8K8PL._SX384_BO1,204,203,200_.jpg', 80.00, 188.00, 'GOOD', '工程专业必修课教材，有笔记和习题解答。', '第14版', 'Pearson', '2015-01-08', 'ENGR 201', '工程系', '工程力学,静力学', 1, 'ON_SALE', '工程力学基础教材，适合机械、土木等专业学生。');

-- ========================================
-- 3. 插入测试订单（2个订单 + 订单项）
-- ========================================

-- 订单1: 用户5购买了3本书
INSERT INTO "order" (order_no, user_id, total_amount, status, building, room, phone, payment_type, payment_time) VALUES
('20231220103045001', 5, 126.00, 'COMPLETED', '北区宿舍楼', '304B', '13800138005', 'CAMPUS_CARD', datetime('now', '-5 days', 'localtime'));

-- 订单1的订单项
INSERT INTO order_item (order_id, book_id, book_title, book_author, book_isbn, book_cover, price, quantity, seller_id) VALUES
(1, 1, '微积分：早期超越函数', 'James Stewart', '978-1285741550', 'https://images-na.ssl-images-amazon.com/images/I/51E8VjvQ8PL._SX384_BO1,204,203,200_.jpg', 45.00, 1, 1),
(1, 4, '经济学原理', 'N. Gregory Mankiw', '978-1305585126', 'https://images-na.ssl-images-amazon.com/images/I/51cRZRW-pEL._SX396_BO1,204,203,200_.jpg', 30.00, 1, 4),
(1, 7, '心理学与生活', 'Richard Gerrig, Philip Zimbardo', '978-0205859139', 'https://images-na.ssl-images-amazon.com/images/I/51lKzZ8K8PL._SX384_BO1,204,203,200_.jpg', 55.00, 1, 1);

-- 订单2: 用户4购买了1本书（待支付状态）
INSERT INTO "order" (order_no, user_id, total_amount, status, building, room, phone, payment_type) VALUES
('20231223141522002', 4, 298.00, 'PENDING_PAYMENT', '东区宿舍楼', '508A', '13800138004', 'VIRTUAL_CARD');

-- 订单2的订单项
INSERT INTO order_item (order_id, book_id, book_title, book_author, book_isbn, book_cover, price, quantity, seller_id) VALUES
(2, 3, '算法导论', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', 'https://images-na.ssl-images-amazon.com/images/I/41T0iBxY8FL._SX440_BO1,204,203,200_.jpg', 298.00, 1, 3);
