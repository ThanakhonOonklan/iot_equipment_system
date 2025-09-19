-- สร้างฐานข้อมูลสำหรับระบบยืม-คืนอุปกรณ์วิชา IoT
CREATE DATABASE IF NOT EXISTS iot_equipment_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ใช้ฐานข้อมูล
USE iot_equipment_system;

-- ตารางผู้ใช้ (Users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(14) NOT NULL UNIQUE COMMENT 'รหัสนักศึกษา (s + 13 หลัก)',
    email VARCHAR(50) NOT NULL UNIQUE COMMENT 'อีเมล (s + 13 หลัก + @kmutnb.ac.th)',
    fullname VARCHAR(100) NOT NULL COMMENT 'ชื่อ-นามสกุล',
    password VARCHAR(255) NOT NULL COMMENT 'รหัสผ่าน (hashed)',
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student' COMMENT 'บทบาทผู้ใช้',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT 'สถานะบัญชี',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่อัปเดต',
    
    -- Indexes
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางผู้ใช้';

-- ตารางอุปกรณ์ (Equipment)
CREATE TABLE IF NOT EXISTS equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'รหัสอุปกรณ์',
    name VARCHAR(100) NOT NULL COMMENT 'ชื่ออุปกรณ์',
    description TEXT COMMENT 'รายละเอียดอุปกรณ์',
    category VARCHAR(50) COMMENT 'หมวดหมู่อุปกรณ์',
    status ENUM('available', 'borrowed', 'maintenance', 'lost') DEFAULT 'available' COMMENT 'สถานะอุปกรณ์',
    location VARCHAR(100) COMMENT 'ตำแหน่งที่เก็บ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_equipment_code (equipment_code),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางอุปกรณ์';

-- ตารางการยืม-คืน (Borrowing)
CREATE TABLE IF NOT EXISTS borrowing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'ID ผู้ใช้',
    equipment_id INT NOT NULL COMMENT 'ID อุปกรณ์',
    borrow_date DATETIME NOT NULL COMMENT 'วันที่ยืม',
    return_date DATETIME COMMENT 'วันที่คืน',
    due_date DATETIME NOT NULL COMMENT 'วันที่ครบกำหนดคืน',
    status ENUM('borrowed', 'returned', 'overdue', 'lost') DEFAULT 'borrowed' COMMENT 'สถานะการยืม',
    notes TEXT COMMENT 'หมายเหตุ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_status (status),
    INDEX idx_borrow_date (borrow_date),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางการยืม-คืน';

-- ตารางประวัติการยืม-คืน (Borrowing History)
CREATE TABLE IF NOT EXISTS borrowing_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrowing_id INT NOT NULL COMMENT 'ID การยืม',
    user_id INT NOT NULL COMMENT 'ID ผู้ใช้',
    equipment_id INT NOT NULL COMMENT 'ID อุปกรณ์',
    action ENUM('borrow', 'return', 'extend', 'lost') NOT NULL COMMENT 'การกระทำ',
    action_date DATETIME NOT NULL COMMENT 'วันที่กระทำ',
    notes TEXT COMMENT 'หมายเหตุ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (borrowing_id) REFERENCES borrowing(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    INDEX idx_borrowing_id (borrowing_id),
    INDEX idx_user_id (user_id),
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_action (action),
    INDEX idx_action_date (action_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางประวัติการยืม-คืน';

-- เพิ่มข้อมูลตัวอย่างผู้ใช้
INSERT INTO users (student_id, email, fullname, password, role) VALUES
('s6706021410192', 's6706021410192@kmutnb.ac.th', 'นาย สมชาย ใจดี', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('s6706021410193', 's6706021410193@kmutnb.ac.th', 'นางสาว สมหญิง รักเรียน', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('s6706021410194', 's6706021410194@kmutnb.ac.th', 'อาจารย์ ดร.สมศักดิ์ สอนดี', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher'),
('admin001', 'admin@kmutnb.ac.th', 'ผู้ดูแลระบบ', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- เพิ่มข้อมูลตัวอย่างอุปกรณ์
INSERT INTO equipment (equipment_code, name, description, category, location) VALUES
('ESP32-001', 'ESP32 Development Board', 'บอร์ดพัฒนา ESP32 สำหรับโปรเจ็ค IoT', 'Microcontroller', 'ห้อง Lab A1'),
('SENSOR-001', 'DHT22 Temperature Sensor', 'เซ็นเซอร์วัดอุณหภูมิและความชื้น', 'Sensor', 'ห้อง Lab A1'),
('DISPLAY-001', 'OLED 128x64 Display', 'จอแสดงผล OLED ขนาด 128x64 พิกเซล', 'Display', 'ห้อง Lab A1'),
('CABLE-001', 'USB Cable Type-C', 'สาย USB Type-C สำหรับเชื่อมต่อ', 'Cable', 'ห้อง Lab A1'),
('BREAD-001', 'Breadboard 830 Points', 'บอร์ดทดลอง 830 จุด', 'Prototyping', 'ห้อง Lab A1');

-- สร้าง View สำหรับดูข้อมูลการยืมที่ยังไม่คืน
CREATE VIEW active_borrowing AS
SELECT 
    b.id,
    b.user_id,
    u.student_id,
    u.fullname,
    u.email,
    b.equipment_id,
    e.equipment_code,
    e.name as equipment_name,
    b.borrow_date,
    b.due_date,
    b.status,
    CASE 
        WHEN b.due_date < NOW() AND b.status = 'borrowed' THEN 'overdue'
        ELSE b.status
    END as current_status
FROM borrowing b
JOIN users u ON b.user_id = u.id
JOIN equipment e ON b.equipment_id = e.id
WHERE b.status IN ('borrowed', 'overdue');

-- สร้าง Stored Procedure สำหรับการยืมอุปกรณ์
DELIMITER //
CREATE PROCEDURE BorrowEquipment(
    IN p_user_id INT,
    IN p_equipment_id INT,
    IN p_due_date DATETIME,
    IN p_notes TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- ตรวจสอบว่าอุปกรณ์พร้อมใช้งาน
    IF (SELECT status FROM equipment WHERE id = p_equipment_id) != 'available' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'อุปกรณ์ไม่พร้อมใช้งาน';
    END IF;
    
    -- เพิ่มข้อมูลการยืม
    INSERT INTO borrowing (user_id, equipment_id, borrow_date, due_date, notes)
    VALUES (p_user_id, p_equipment_id, NOW(), p_due_date, p_notes);
    
    -- อัปเดตสถานะอุปกรณ์
    UPDATE equipment SET status = 'borrowed' WHERE id = p_equipment_id;
    
    -- เพิ่มประวัติ
    INSERT INTO borrowing_history (borrowing_id, user_id, equipment_id, action, action_date, notes)
    VALUES (LAST_INSERT_ID(), p_user_id, p_equipment_id, 'borrow', NOW(), p_notes);
    
    COMMIT;
END //
DELIMITER ;

-- สร้าง Stored Procedure สำหรับการคืนอุปกรณ์
DELIMITER //
CREATE PROCEDURE ReturnEquipment(
    IN p_borrowing_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_equipment_id INT;
    DECLARE v_user_id INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- ดึงข้อมูลการยืม
    SELECT equipment_id, user_id INTO v_equipment_id, v_user_id
    FROM borrowing WHERE id = p_borrowing_id AND status = 'borrowed';
    
    IF v_equipment_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ไม่พบข้อมูลการยืมหรืออุปกรณ์ถูกคืนแล้ว';
    END IF;
    
    -- อัปเดตสถานะการยืม
    UPDATE borrowing 
    SET status = 'returned', return_date = NOW(), notes = CONCAT(IFNULL(notes, ''), ' | ', IFNULL(p_notes, ''))
    WHERE id = p_borrowing_id;
    
    -- อัปเดตสถานะอุปกรณ์
    UPDATE equipment SET status = 'available' WHERE id = v_equipment_id;
    
    -- เพิ่มประวัติ
    INSERT INTO borrowing_history (borrowing_id, user_id, equipment_id, action, action_date, notes)
    VALUES (p_borrowing_id, v_user_id, v_equipment_id, 'return', NOW(), p_notes);
    
    COMMIT;
END //
DELIMITER ;
