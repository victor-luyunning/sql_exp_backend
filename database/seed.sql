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
(1, '微积分：早期超越函数', 'Calculus: Early Transcendentals', 'James Stewart', '978-1285741550', '1285741552', 'https://covers.openlibrary.org/b/isbn/1285741552-L.jpg', 45.00, 120.00, 'GOOD', '这本书在 MATH 101 课程中使用了一个学期。封面边角有轻微磨损,但装订依然完好紧实。第3章有少量黄色高亮标记。', '第8版', 'Cengage Learning', '2015-01-01', 'MATH 101', '数学系', '数学,微积分', 1, 'ON_SALE', '本书是微积分领域的经典教材,内容全面深入,配有大量例题和习题。'),

-- 生物类
(2, '坎贝尔生物学', 'Campbell Biology', 'Lisa A. Urry', '978-0134093413', '0134093410', 'https://covers.openlibrary.org/b/isbn/0134093410-L.jpg', 60.00, 150.00, 'LIKE_NEW', '几乎全新,仅翻阅过几次,无任何标记或损坏。', '第11版', 'Pearson', '2016-10-05', 'BIO 101', '生物系', '生物学,细胞生物学', 1, 'ON_SALE', '生物学领域的权威教材,涵盖细胞、遗传、进化等核心内容。'),

-- 计算机类
(3, '算法导论', 'Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', '026204630X', 'https://covers.openlibrary.org/b/isbn/026204630X-L.jpg', 298.00, 680.00, 'GOOD', '计算机系必备书籍,部分章节有笔记和批注,整体保存良好。', '第4版', 'MIT Press', '2022-04-05', 'CS 301', '计算机系', '计算机科学,算法,数据结构', 1, 'ON_SALE', '计算机科学领域的经典巨著,深入讲解各类算法的设计与分析。'),

-- 经济类
(4, '经济学原理', 'Principles of Economics', 'N. Gregory Mankiw', '978-1305585126', '1305585127', 'https://covers.openlibrary.org/b/isbn/1305585127-L.jpg', 30.00, 95.00, 'FAIR', '有一定使用痕迹,封面有折痕,内页整洁。', '第8版', 'Cengage Learning', '2017-02-17', 'ECON 101', '经济系', '经济学,宏观经济学,微观经济学', 1, 'ON_SALE', '经济学入门经典教材,适合初学者系统学习经济学原理。'),

-- 化学类
(5, '普通化学', 'Chemistry: The Central Science', 'Theodore L. Brown', '978-0134414232', '0134414233', 'https://covers.openlibrary.org/b/isbn/0134414233-L.jpg', 350.00, 800.00, 'GOOD', '化学专业核心教材,有少量笔记,整体良好。', '第14版', 'Pearson', '2017-01-13', 'CHEM 101', '化学系', '化学,无机化学,有机化学', 1, 'ON_SALE', '化学领域的权威教材,系统介绍化学基础知识和应用。'),

-- 物理类
(3, '大学物理（上册）', 'University Physics Volume 1', 'Samuel J. Ling', '978-1938168277', '1938168275', 'https://covers.openlibrary.org/b/isbn/1938168275-L.jpg', 40.00, 98.00, 'GOOD', '物理系基础课程用书,有少量铅笔标记,可擦除。', '第1版', 'OpenStax', '2016-09-19', 'PHYS 101', '物理系', '物理学,力学,热学', 1, 'ON_SALE', '涵盖力学、振动和波动、热学等基础物理内容。'),

-- 人文类
(1, '心理学与生活', 'Psychology and Life', 'Richard Gerrig, Philip Zimbardo', '978-0205859139', '0205859135', 'https://covers.openlibrary.org/b/isbn/0205859135-L.jpg', 55.00, 128.00, 'LIKE_NEW', '几乎全新,无标记无污损。', '第20版', 'Pearson', '2012-07-06', 'PSY 101', '心理学系', '心理学,认知心理学', 1, 'ON_SALE', '心理学领域的经典入门教材,理论与实践相结合。'),

-- 工程类
(2, '理论力学', 'Theoretical Mechanics', '哈尔滨工业大学理论力学教研室', '978-7040447798', '7040447797', 'https://covers.openlibrary.org/b/isbn/9787040447798-L.jpg', 80.00, 188.00, 'GOOD', '工程专业必修课教材,有笔记和习题解答。', '第8版', '高等教育出版社', '2016-01-01', 'ENGR 201', '工程系', '工程力学,理论力学', 1, 'ON_SALE', '工程力学基础教材,适合机械、土木等专业学生。'),

-- 计算机专业核心教材
(2, '计算机系统要素', 'The Elements of Computing Systems', 'Noam Nisan', '978-0262640688', '0262640686', 'https://covers.openlibrary.org/b/isbn/9780262640688-L.jpg', 35.00, 68.00, 'GOOD', '计算机专业必修课教材,有少量笔记,整体良好。', '第1版', 'MIT Press', '2005-08-01', 'CS 201', '计算机系', '计算机科学,计算机组成', 1, 'ON_SALE', '从与非门到操作系统,深入浅出讲解计算机系统构建原理。'),

(3, '数据库系统概论', 'Database System Concepts', '王珊,萨师煊', '978-7040406641', '7040406640', 'https://covers.openlibrary.org/b/isbn/7040406640-L.jpg', 42.00, 78.00, 'LIKE_NEW', '几乎全新,仅翻阅过几次,无任何标记。', '第5版', '高等教育出版社', '2014-09-01', 'CS 302', '计算机系', '计算机科学,数据库', 1, 'ON_SALE', '数据库领域的经典教材,全面介绍数据库系统原理、设计与应用。'),

(1, '软件工程', 'Software Engineering', 'Ian Sommerville', '978-7111585978', '7111585976', 'https://covers.openlibrary.org/b/isbn/9780133943030-L.jpg', 38.00, 65.00, 'GOOD', '软件工程专业核心课程用书,有标注和笔记。', '第10版', '机械工业出版社', '2018-03-01', 'SE 201', '计算机系', '软件工程', 1, 'ON_SALE', '软件工程领域的经典教材,全面介绍软件开发过程和项目管理。'),

(2, '算法(第4版)', 'Algorithms', 'Robert Sedgewick', '978-7115293800', '7115293805', 'https://covers.openlibrary.org/b/isbn/9780321573513-L.jpg', 45.00, 89.00, 'GOOD', '算法课程必备教材,部分章节有批注。', '第4版', '人民邮电出版社', '2012-10-01', 'CS 303', '计算机系', '计算机科学,算法设计', 1, 'ON_SALE', '算法领域的经典红宝书,深入讲解各类基础算法及其Java实现。'),

(3, '现代操作系统', 'Modern Operating Systems', 'Andrew S. Tanenbaum', '978-7111544937', '7111544935', 'https://covers.openlibrary.org/b/isbn/9780133591620-L.jpg', 40.00, 72.00, 'FAIR', '有一定使用痕迹,内页整洁,有重点标记。', '第4版', '机械工业出版社', '2017-07-01', 'CS 202', '计算机系', '计算机科学,操作系统', 1, 'ON_SALE', '操作系统领域的权威教材,系统讲解进程、内存、文件系统等核心概念。'),

(1, '编译原理', 'Compilers: Principles, Techniques, and Tools', 'Alfred V. Aho', '978-0321486813', '0321486811', 'https://covers.openlibrary.org/b/isbn/0321486811-L.jpg', 55.00, 128.00, 'GOOD', '编译原理经典龙书,有少量笔记和标注。', '第2版', 'Pearson', '2006-08-31', 'CS 304', '计算机系', '计算机科学,编译原理', 1, 'ON_SALE', '编译器设计领域的经典教材,系统讲解词法分析、语法分析、语义分析等。'),

(2, '计算机网络', 'Computer Networks', 'Andrew S. Tanenbaum', '978-7115477989', '7115477981', 'https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg', 48.00, 89.00, 'LIKE_NEW', '几乎全新,无标记无污损,保存完好。', '第5版', '人民邮电出版社', '2018-03-01', 'CS 305', '计算机系', '计算机科学,计算机网络', 1, 'ON_SALE', '计算机网络领域的经典教材,系统讲解网络体系结构和协议。'),

(3, 'C++ Primer中文版', 'C++ Primer', 'Stanley B. Lippman', '978-7121155352', '7121155354', 'https://covers.openlibrary.org/b/isbn/9780321714114-L.jpg', 52.00, 118.00, 'GOOD', 'C++编程入门经典,有代码标注和练习笔记。', '第5版', '电子工业出版社', '2013-09-01', 'CS 102', '计算机系', '计算机科学,C++,编程语言', 1, 'ON_SALE', 'C++学习的经典教材,由语言设计者编写,全面深入讲解C++11新特性。');

-- ========================================
-- 3. 插入测试订单（2个订单 + 订单项）
-- ========================================

-- 订单1: 用户5购买了3本书
INSERT INTO "order" (order_no, user_id, total_amount, status, building, room, phone, payment_type, payment_time) VALUES
('20231220103045001', 5, 126.00, 'COMPLETED', '北区宿舍楼', '304B', '13800138005', 'CAMPUS_CARD', datetime('now', '-5 days', 'localtime'));

-- 订单1的订单项
INSERT INTO order_item (order_id, book_id, book_title, book_author, book_isbn, book_cover, price, quantity, seller_id) VALUES
(1, 1, '微积分：早期超越函数', 'James Stewart', '978-1285741550', 'https://covers.openlibrary.org/b/isbn/1285741552-L.jpg', 45.00, 1, 1),
(1, 4, '经济学原理', 'N. Gregory Mankiw', '978-1305585126', 'https://covers.openlibrary.org/b/isbn/1305585127-L.jpg', 30.00, 1, 4),
(1, 7, '心理学与生活', 'Richard Gerrig, Philip Zimbardo', '978-0205859139', 'https://covers.openlibrary.org/b/isbn/0205859135-L.jpg', 55.00, 1, 1);

-- 订单2: 用户4购买了1本书（待支付状态）
INSERT INTO "order" (order_no, user_id, total_amount, status, building, room, phone, payment_type) VALUES
('20231223141522002', 4, 298.00, 'PENDING_PAYMENT', '东区宿舍楼', '508A', '13800138004', 'VIRTUAL_CARD');

-- 订单2的订单项
INSERT INTO order_item (order_id, book_id, book_title, book_author, book_isbn, book_cover, price, quantity, seller_id) VALUES
(2, 3, '算法导论', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', 'https://covers.openlibrary.org/b/isbn/026204630X-L.jpg', 298.00, 1, 3);
