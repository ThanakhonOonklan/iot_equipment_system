-- SQL Script สำหรับ TiDB Cloud
-- รันทีละส่วนตามลำดับ

-- ============================================
-- ส่วนที่ 1: สร้างตารางทั้งหมด
-- ============================================

-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(12) NOT NULL COMMENT 'รหัสนักศึกษา (12 หลัก)',
  `email` varchar(50) NOT NULL COMMENT 'อีเมล (รหัส 12 หลัก + st@rmutsb.ac.th)',
  `fullname` varchar(100) NOT NULL COMMENT 'ชื่อ-นามสกุล',
  `password` varchar(255) NOT NULL COMMENT 'รหัสผ่าน (hashed)',
  `role` enum('admin','staff','user','guest') DEFAULT 'user' COMMENT 'บทบาทผู้ใช้',
  `status` enum('active','inactive','suspended') DEFAULT 'active' COMMENT 'สถานะบัญชี',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'วันที่สร้าง',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันที่อัปเดต',
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางผู้ใช้';

-- สร้างตาราง equipment
CREATE TABLE IF NOT EXISTS `equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'ชื่ออุปกรณ์',
  `description` text DEFAULT NULL COMMENT 'รายละเอียดอุปกรณ์',
  `category` varchar(50) DEFAULT NULL COMMENT 'หมวดหมู่อุปกรณ์',
  `image_url` varchar(255) DEFAULT NULL COMMENT 'ลิงก์รูปภาพอุปกรณ์',
  `quantity_total` int(11) NOT NULL DEFAULT 0 COMMENT 'จำนวนที่มีทั้งหมด',
  `quantity_available` int(11) NOT NULL DEFAULT 0 COMMENT 'จำนวนที่คงเหลือ',
  `status` enum('available','limited','unavailable','maintenance','borrowed','lost') DEFAULT 'available' COMMENT 'สถานะอุปกรณ์',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางอุปกรณ์';

-- สร้างตาราง borrow_requests
CREATE TABLE IF NOT EXISTS `borrow_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'ID ผู้ใช้ที่ยืม',
  `request_date` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันที่ส่งคำขอ',
  `borrow_date` date NOT NULL COMMENT 'วันที่ต้องการยืม',
  `return_date` date NOT NULL COMMENT 'วันที่ต้องการคืน',
  `status` enum('pending','approved','rejected','completed') DEFAULT 'pending' COMMENT 'สถานะคำขอ',
  `approver_id` int(11) DEFAULT NULL COMMENT 'ID ผู้อนุมัติ',
  `approver_name` varchar(100) DEFAULT NULL COMMENT 'ชื่อผู้อนุมัติ',
  `approved_at` datetime DEFAULT NULL COMMENT 'วันที่อนุมัติ',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุเพิ่มเติม',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_request_date` (`request_date`),
  KEY `idx_borrow_date` (`borrow_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางคำขอยืมอุปกรณ์';

-- สร้างตาราง borrow_request_items (สำคัญ! ต้องสร้างก่อน constraints)
CREATE TABLE IF NOT EXISTS `borrow_request_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL COMMENT 'ID คำขอยืม',
  `equipment_id` int(11) NOT NULL COMMENT 'ID อุปกรณ์',
  `quantity_requested` int(11) NOT NULL COMMENT 'จำนวนที่ขอยืม',
  `quantity_approved` int(11) DEFAULT 0 COMMENT 'จำนวนที่อนุมัติ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_request_id` (`request_id`),
  KEY `idx_equipment_id` (`equipment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางรายละเอียดคำขอยืม';

-- สร้างตาราง borrowing
CREATE TABLE IF NOT EXISTS `borrowing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'ID ผู้ใช้',
  `equipment_id` int(11) NOT NULL COMMENT 'ID อุปกรณ์',
  `borrow_date` datetime NOT NULL COMMENT 'วันที่ยืม',
  `return_date` datetime DEFAULT NULL COMMENT 'วันที่คืน',
  `due_date` datetime NOT NULL COMMENT 'วันที่ครบกำหนดคืน',
  `status` enum('borrowed','returned','overdue','lost') DEFAULT 'borrowed' COMMENT 'สถานะการยืม',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_equipment_id` (`equipment_id`),
  KEY `idx_status` (`status`),
  KEY `idx_borrow_date` (`borrow_date`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางการยืม-คืน';

-- สร้างตาราง borrowing_history
CREATE TABLE IF NOT EXISTS `borrowing_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `borrowing_id` int(11) NOT NULL COMMENT 'ID การยืม',
  `user_id` int(11) NOT NULL COMMENT 'ID ผู้ใช้',
  `equipment_id` int(11) NOT NULL COMMENT 'ID อุปกรณ์',
  `approver_id` int(11) DEFAULT NULL COMMENT 'ID ผู้อนุมัติ',
  `approver_name` varchar(100) DEFAULT NULL COMMENT 'ชื่อผู้อนุมัติ',
  `equipment_names` text DEFAULT NULL COMMENT 'รายชื่ออุปกรณ์',
  `action` enum('borrow','return','extend','lost','approve') NOT NULL COMMENT 'การกระทำ',
  `action_date` datetime NOT NULL COMMENT 'วันที่กระทำ',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_borrowing_id` (`borrowing_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_equipment_id` (`equipment_id`),
  KEY `idx_action` (`action`),
  KEY `idx_action_date` (`action_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางประวัติการยืม-คืน';

-- สร้างตาราง pending_registrations
CREATE TABLE IF NOT EXISTS `pending_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `student_id` varchar(12) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','staff','user') NOT NULL DEFAULT 'user',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_student_id` (`student_id`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ส่วนที่ 2: เพิ่ม Foreign Key Constraints
-- ============================================

-- Constraints for table `borrowing`
ALTER TABLE `borrowing`
  ADD CONSTRAINT `borrowing_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE;

-- Constraints for table `borrowing_history`
ALTER TABLE `borrowing_history`
  ADD CONSTRAINT `borrowing_history_ibfk_1` FOREIGN KEY (`borrowing_id`) REFERENCES `borrowing` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_history_ibfk_3` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE;

-- Constraints for table `borrow_requests`
ALTER TABLE `borrow_requests`
  ADD CONSTRAINT `borrow_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Constraints for table `borrow_request_items`
ALTER TABLE `borrow_request_items`
  ADD CONSTRAINT `borrow_request_items_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `borrow_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrow_request_items_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE;

-- ============================================
-- ส่วนที่ 3: Insert ข้อมูลเริ่มต้น
-- ============================================

-- Insert users
INSERT INTO `users` (`id`, `student_id`, `email`, `fullname`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, '000000000000', '000000000000-st@rmutsb.ac.th', 'Admin User', '$2y$10$j2TKtXR4S1/fK1LVW2r.9OlLBVDP/Azj/OaFOdTZj9eTeSKA3KGM2', 'admin', 'active', '2025-10-18 06:45:22', '2025-10-18 06:45:36'),
(2, '111111111111', '111111111111-st@rmutsb.ac.th', 'Admin', '$2y$10$aA.kuNF.p5pfw.ips8GCSuJid2UbgWDYA3LnbD5RomBkKr9Y1VCDO', 'user', 'suspended', '2025-10-18 06:48:37', '2025-10-18 07:26:31')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Insert equipment
INSERT INTO `equipment` (`id`, `name`, `description`, `category`, `image_url`, `quantity_total`, `quantity_available`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Arduino Uno R3', '-', 'Arduino', 'https://o.lnwfile.com/_/o/_raw/pa/g2/f9.jpg', 30, 30, 'available', '2025-10-05 06:23:07', '2025-10-18 07:10:33'),
(2, 'Raspberry Pi 4 Model B', '', 'Raspberry', 'https://inex.co.th/home/wp-content/uploads/2020/07/raspberry-pi-4b-4gb-top.jpg', 10, 10, 'available', '2025-10-05 06:23:39', '2025-10-18 07:10:34'),
(3, 'ESP32 Development Board', '-', 'ESP32', 'https://www.imiconsystem.com/wp-content/uploads/2023/01/esp32-devkit-v1-1-3.jpg', 10, 10, 'available', '2025-10-05 06:24:15', '2025-10-18 07:10:34'),
(4, 'NodeMCU ESP8266', '-', 'ESP8266', 'https://gh.lnwfile.com/_/gh/_raw/6z/2m/7m.jpg', 10, 10, 'available', '2025-10-05 06:24:57', '2025-10-18 06:53:00'),
(5, 'DHT22 Temperature Sensor', '-', 'Sensor', 'https://static.cytron.io/image/cache/catalog/products/SN-DHT22-MOD/dht22-sensor-module-breakout-a4872-800x800.jpg', 10, 10, 'available', '2025-10-05 06:25:25', '2025-10-18 07:10:33'),
(6, 'Ultrasonic Sensor', '-', 'Sensor', 'https://media.rs-online.com/Y2153181-01.jpg', 10, 10, 'available', '2025-10-05 06:25:59', '2025-10-18 07:15:02'),
(7, 'PIR Motion Sensor', '-', 'Sensor', 'https://s1145.lnwfile.com/_c/fp/_webp_max/1024/1024/1c/2q/wm.webp', 10, 10, 'available', '2025-10-05 06:26:23', '2025-10-18 07:15:02'),
(8, 'MQ-135 Air Quality Sensor', '-', 'Sensor', 'https://inwfile.com/s-dm/ys0mnt.jpg', 10, 10, 'available', '2025-10-05 06:27:01', '2025-10-18 07:15:02'),
(9, 'Servo Motor SG90', '-', 'Servo', 'https://inwfile.com/s-dm/orj0a7.jpg', 10, 10, 'available', '2025-10-05 06:27:47', '2025-10-18 07:15:02'),
(10, 'LED Strip WS2812B', '-', 'LED', 'https://quartzcomponents.com/cdn/shop/products/LED_Strip_2_1200x1200.jpg?v=1681122790', 10, 10, 'available', '2025-10-05 06:28:27', '2025-10-18 07:15:02'),
(11, 'BME280 Environmental Sensor', '-', 'Sensor', 'https://static.cytron.io/image/cache/catalog/products/SN-BME280/BME280-Environmental-Sensor-800x800.png', 30, 29, 'available', '2025-10-05 06:30:14', '2025-10-18 07:16:51'),
(12, 'RFID Reader RC522', '-', 'RFID', 'https://dw.lnwfile.com/_/dw/_raw/iw/q6/5y.jpg', 30, 29, 'available', '2025-10-05 06:30:51', '2025-10-18 07:16:51'),
(13, 'Relay Module 5V', '-', 'Relay', 'https://inwfile.com/s-dx/f0ig0y.png', 10, 9, 'available', '2025-10-05 06:32:10', '2025-10-18 07:16:51'),
(14, '16x2 LCD Display', '-', 'Display', 'https://soldered.com/productdata/2023/01/DSC_8573-1024x678-1.jpg', 10, 10, 'available', '2025-10-05 06:32:57', '2025-10-18 07:15:23'),
(15, 'Bluetooth Module HC-05', '-', 'Bluetooth', 'https://gh.lnwfile.com/_/gh/_raw/ik/k3/9d.jpg', 40, 39, 'available', '2025-10-05 06:33:30', '2025-10-18 07:16:51'),
(16, 'WiFi Module ESP-01', '-', 'WiFi', 'https://o.lnwfile.com/_/o/_raw/ol/fp/z0.jpg', 20, 15, 'available', '2025-10-05 06:34:07', '2025-10-18 07:09:09')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- ============================================
-- สร้าง View (ถ้าต้องการ)
-- ============================================

-- สร้าง view active_borrowing
CREATE OR REPLACE VIEW `active_borrowing` AS 
SELECT 
  `b`.`id` AS `id`, 
  `b`.`user_id` AS `user_id`, 
  `u`.`student_id` AS `student_id`, 
  `u`.`fullname` AS `fullname`, 
  `u`.`email` AS `email`, 
  `b`.`equipment_id` AS `equipment_id`, 
  `e`.`name` AS `equipment_name`, 
  `b`.`borrow_date` AS `borrow_date`, 
  `b`.`due_date` AS `due_date`, 
  `b`.`status` AS `status`, 
  CASE 
    WHEN `b`.`due_date` < current_timestamp() AND `b`.`status` = 'borrowed' THEN 'overdue' 
    ELSE `b`.`status` 
  END AS `current_status` 
FROM ((`borrowing` `b` 
  JOIN `users` `u` ON `b`.`user_id` = `u`.`id`) 
  JOIN `equipment` `e` ON `b`.`equipment_id` = `e`.`id`) 
WHERE `b`.`status` IN ('borrowed','overdue');

