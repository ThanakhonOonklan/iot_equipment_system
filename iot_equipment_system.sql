-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2025 at 03:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `iot_equipment_system`
--

-- สร้างฐานข้อมูลถ้ายังไม่มี
CREATE DATABASE IF NOT EXISTS `iot_equipment_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- เลือกฐานข้อมูล
USE `iot_equipment_system`;

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `BorrowEquipment` (IN `p_user_id` INT, IN `p_equipment_id` INT, IN `p_due_date` DATETIME, IN `p_notes` TEXT)   BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ReturnEquipment` (IN `p_borrowing_id` INT, IN `p_notes` TEXT)   BEGIN
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_borrowing`
-- (See below for the actual view)
--
CREATE TABLE `active_borrowing` (
`id` int(11)
,`user_id` int(11)
,`student_id` varchar(14)
,`fullname` varchar(100)
,`email` varchar(50)
,`equipment_id` int(11)
,`equipment_name` varchar(100)
,`borrow_date` datetime
,`due_date` datetime
,`status` enum('borrowed','returned','overdue','lost')
,`current_status` varchar(8)
);

-- --------------------------------------------------------

--
-- Table structure for table `borrowing`
--

CREATE TABLE `borrowing` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'ID ผู้ใช้',
  `equipment_id` int(11) NOT NULL COMMENT 'ID อุปกรณ์',
  `borrow_date` datetime NOT NULL COMMENT 'วันที่ยืม',
  `return_date` datetime DEFAULT NULL COMMENT 'วันที่คืน',
  `due_date` datetime NOT NULL COMMENT 'วันที่ครบกำหนดคืน',
  `status` enum('borrowed','returned','overdue','lost') DEFAULT 'borrowed' COMMENT 'สถานะการยืม',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางการยืม-คืน';

-- --------------------------------------------------------

--
-- Table structure for table `borrowing_history`
--

CREATE TABLE `borrowing_history` (
  `id` int(11) NOT NULL,
  `borrowing_id` int(11) NOT NULL COMMENT 'ID การยืม',
  `user_id` int(11) NOT NULL COMMENT 'ID ผู้ใช้',
  `equipment_id` int(11) NOT NULL COMMENT 'ID อุปกรณ์',
  `action` enum('borrow','return','extend','lost') NOT NULL COMMENT 'การกระทำ',
  `action_date` datetime NOT NULL COMMENT 'วันที่กระทำ',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางประวัติการยืม-คืน';

-- --------------------------------------------------------

--
-- Table structure for table `borrow_requests`
--

CREATE TABLE `borrow_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'ID ผู้ใช้ที่ยืม',
  `request_date` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันที่ส่งคำขอ',
  `borrow_date` date NOT NULL COMMENT 'วันที่ต้องการยืม',
  `return_date` date NOT NULL COMMENT 'วันที่ต้องการคืน',
  `status` enum('pending','approved','rejected','completed') DEFAULT 'pending' COMMENT 'สถานะคำขอ',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุเพิ่มเติม',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางคำขอยืมอุปกรณ์';

-- --------------------------------------------------------

--
-- Table structure for table `borrow_request_items`
--

CREATE TABLE `borrow_request_items` (
  `id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL COMMENT 'ID คำขอยืม',
  `equipment_id` int(11) NOT NULL COMMENT 'ID อุปกรณ์',
  `quantity_requested` int(11) NOT NULL COMMENT 'จำนวนที่ขอยืม',
  `quantity_approved` int(11) DEFAULT 0 COMMENT 'จำนวนที่อนุมัติ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางรายละเอียดคำขอยืม';

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'ชื่ออุปกรณ์',
  `description` text DEFAULT NULL COMMENT 'รายละเอียดอุปกรณ์',
  `category` varchar(50) DEFAULT NULL COMMENT 'หมวดหมู่อุปกรณ์',
  `image_url` varchar(255) DEFAULT NULL COMMENT 'ลิงก์รูปภาพอุปกรณ์',
  `quantity_total` int(11) NOT NULL DEFAULT 0 COMMENT 'จำนวนที่มีทั้งหมด',
  `quantity_available` int(11) NOT NULL DEFAULT 0 COMMENT 'จำนวนที่คงเหลือ',
  `status` enum('available','limited','unavailable','maintenance','borrowed','lost') DEFAULT 'available' COMMENT 'สถานะอุปกรณ์',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางอุปกรณ์';

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`id`, `name`, `description`, `category`, `image_url`, `quantity_total`, `quantity_available`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ESP32 Development Board', 'บอร์ดพัฒนา ESP32 สำหรับโปรเจ็ค IoT', 'Microcontroller', 'https://www.az-delivery.de/cdn/shop/products/esp32-nodemcu-module-wlan-wifi-development-board-mit-cp2102-nachfolgermodell-zum-esp8266-kompatibel-mit-arduino-872375.jpg?v=1679400491', 10, 10, 'available', '2025-09-28 06:15:58', '2025-09-28 10:31:38'),
(2, 'DHT22 Temperature Sensor', 'เซ็นเซอร์วัดอุณหภูมิและความชื้น', 'Sensor', 'https://static.cytron.io/image/cache/catalog/products/SN-DHT22-MOD/dht22-sensor-module-breakout-a4872-800x800.jpg', 20, 18, 'available', '2025-09-28 06:15:58', '2025-09-28 09:17:55'),
(3, 'OLED 128x64 Display', 'จอแสดงผล OLED ขนาด 128x64 พิกเซล', 'Display', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHCVQEXvULOa5LAR-VAw6X9x4J3IFymz2iQg&amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;s', 100, 10, 'limited', '2025-09-28 06:15:58', '2025-09-28 12:39:54'),
(4, 'USB Cable Type-C', 'สาย USB Type-C สำหรับเชื่อมต่อ', 'Cable', 'https://res.cloudinary.com/rsc/image/upload/b_rgb:FFFFFF,c_pad,dpr_2.625,f_auto,h_214,q_auto,w_380/c_pad,h_214,w_380/R2133133-01?pgw=1', 30, 30, 'available', '2025-09-28 06:15:58', '2025-09-28 09:18:35'),
(5, 'Breadboard 830 Points', 'บอร์ดทดลอง 830 จุด', 'Prototyping', 'https://inwfile.com/s-f/k4b3j9.png', 15, 15, 'available', '2025-09-28 06:15:58', '2025-09-28 09:18:49'),
(6, 'd', 'd', 'dd', 'https://inwfile.com/s-o/z6yfkr.jpg', 12, 12, 'available', '2025-09-28 09:15:34', '2025-09-28 09:15:34'),
(7, 'ESP32 Development Board', 'บอร์ดพัฒนา ESP32 Wi‑Fi + Bluetooth', 'Microcontroller', 'https://inwfile.com/s-fp/38yybb.png', 12, 10, 'available', '2025-09-28 09:43:02', '2025-09-28 12:39:41'),
(8, 'DHT22 Temperature Sensor', 'เซ็นเซอร์วัดอุณหภูมิและความชื้น', 'Sensor', 'https://www.waveshare.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/d/h/dht22-temperature-humidity-sensor-1.jpg', 20, 18, 'available', '2025-09-28 09:43:02', '2025-09-28 12:41:46'),
(9, 'OLED 128x64 Display', 'จอแสดงผล OLED ขนาด 128x64 พิกเซล', 'Display', 'https://th.enrichlcddisplay.com/uploads/16158/1-3-inch-128x64-display-module-i2c-oled9fb16.jpg', 8, 6, 'available', '2025-09-28 09:43:02', '2025-09-28 12:38:53'),
(10, 'USB Cable Type‑C', 'สาย USB Type‑C สำหรับชาร์จ/ถ่ายโอนข้อมูล', 'Cable', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8dxFRsfMrmQbCOvwVYs1GDVkge_grjdSq6w&amp;s', 35, 30, 'available', '2025-09-28 09:43:02', '2025-09-28 12:38:42'),
(11, 'Raspberry Pi 4 Model B', 'คอมพิวเตอร์จิ๋วสำหรับงาน IoT', 'Computer', 'https://media.rs-online.com/image/upload/bo_1.5px_solid_white,b_auto,c_pad,dpr_2,f_auto,h_399,q_auto,w_710/c_pad,h_399,w_710/R1822096-01?pgw=1', 5, 1, 'limited', '2025-09-28 09:43:02', '2025-09-28 12:42:15'),
(12, 'Breadboard 830 Points', 'เบรดบอร์ดสำหรับทดลองวงจร 830 จุด', 'Prototyping', 'https://cdn-shop.adafruit.com/970x728/239-03.jpg', 20, 15, 'available', '2025-09-28 09:43:02', '2025-09-28 12:38:13'),
(13, 'Multimeter', 'มัลติมิเตอร์ดิจิทัล', 'Tool', 'https://media.fluke.com/9308ee59-4d6d-4702-848f-b108002ad3f0_product_slideshow_main.jpg', 5, 2, 'unavailable', '2025-09-28 09:43:02', '2025-09-28 12:51:08'),
(14, 'Soldering Station', 'ชุดหัวแร้งบัดกรีพร้อมสถานี', 'Tool', 'https://images.toolworld.in/product/1638463669.jpg', 3, 1, 'maintenance', '2025-09-28 09:43:02', '2025-09-28 12:51:13'),
(15, 'Jumper Wires Set', 'สายจัมเปอร์ ผู้‑ผู้ / ผู้‑เมีย / เมีย‑เมีย', 'Accessory', 'https://m.media-amazon.com/images/I/71u8UW9FDeL._UF1000,1000_QL80_.jpg', 100, 80, 'available', '2025-09-28 09:43:02', '2025-09-28 12:41:58'),
(16, 'HC‑SR04 Ultrasonic Sensor', 'เซ็นเซอร์วัดระยะ Ultrasonic', 'Sensor', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwuaFhyqxiFDAvQJBRvwyTP-1NL0J4VkmY-Q&amp;amp;amp;s', 25, 22, 'available', '2025-09-28 09:43:02', '2025-09-28 12:43:44');

-- --------------------------------------------------------

--
-- Dumping data for table `borrow_requests`
--

INSERT INTO `borrow_requests` (`id`, `user_id`, `request_date`, `borrow_date`, `return_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 9, '2025-09-28 10:00:00', '2025-09-30', '2025-10-05', 'pending', 'สำหรับโปรเจ็ค IoT วัดอุณหภูมิ', '2025-09-28 10:00:00', '2025-09-28 10:00:00'),
(2, 10, '2025-09-28 11:30:00', '2025-10-01', '2025-10-08', 'approved', 'ใช้งานในห้องปฏิบัติการ', '2025-09-28 11:30:00', '2025-09-28 12:00:00'),
(3, 11, '2025-09-28 14:15:00', '2025-10-02', '2025-10-10', 'pending', 'สำหรับการทดลอง Arduino', '2025-09-28 14:15:00', '2025-09-28 14:15:00');

-- --------------------------------------------------------

--
-- Dumping data for table `borrow_request_items`
--

INSERT INTO `borrow_request_items` (`id`, `request_id`, `equipment_id`, `quantity_requested`, `quantity_approved`, `created_at`) VALUES
(1, 1, 2, 2, 0, '2025-09-28 10:00:00'),
(2, 1, 9, 1, 0, '2025-09-28 10:00:00'),
(3, 2, 1, 1, 1, '2025-09-28 11:30:00'),
(4, 2, 5, 1, 1, '2025-09-28 11:30:00'),
(5, 3, 7, 2, 0, '2025-09-28 14:15:00'),
(6, 3, 15, 10, 0, '2025-09-28 14:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `student_id` varchar(14) NOT NULL COMMENT 'รหัสนักศึกษา (s + 13 หลัก)',
  `email` varchar(50) NOT NULL COMMENT 'อีเมล (s + 13 หลัก + @kmutnb.ac.th)',
  `fullname` varchar(100) NOT NULL COMMENT 'ชื่อ-นามสกุล',
  `password` varchar(255) NOT NULL COMMENT 'รหัสผ่าน (hashed)',
  `role` enum('admin','staff','user','guest') DEFAULT 'user' COMMENT 'บทบาทผู้ใช้',
  `status` enum('active','inactive','suspended') DEFAULT 'active' COMMENT 'สถานะบัญชี',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'วันที่สร้าง',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันที่อัปเดต'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางผู้ใช้';

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `student_id`, `email`, `fullname`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(9, 's6706021410195', 's6706021410195@kmutnb.ac.th', 'นาย กิตติพงศ์ ใจดี', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(10, 's6706021410196', 's6706021410196@kmutnb.ac.th', 'นางสาว พิมพ์ชนก แสงทอง', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(11, 's6706021410197', 's6706021410197@kmutnb.ac.th', 'นาย ธนากร ศรีสวัสดิ์', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(12, 's6706021410198', 's6706021410198@kmutnb.ac.th', 'นางสาว วราภรณ์ จิตอาสา', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(13, 's6706021410199', 's6706021410199@kmutnb.ac.th', 'นาย ปวิช ผดุงไทย', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(14, 's6706021410200', 's6706021410200@kmutnb.ac.th', 'นางสาว ชนกานต์ บุญมาก', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(15, 's6706021410201', 's6706021410201@kmutnb.ac.th', 'นาย ภูริวัจน์ รุ่งเรือง', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(16, 's6706021410202', 's6706021410202@kmutnb.ac.th', 'นางสาว สุชาดา ทองแท้', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(17, 's6706021410203', 's6706021410203@kmutnb.ac.th', 'นาย ชยุตม์ กิตติคุณ', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(18, 's6706021410204', 's6706021410204@kmutnb.ac.th', 'นางสาว ศศิธร มีชัย', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2025-09-28 08:13:36', '2025-09-28 08:13:36'),
(20, 's6706021410192', 's6706021410192@kmutnb.ac.th', 'ธนกรณ์ อ่อนกลั่น', '$2y$10$FVCbLlt0vZyw4R8oC6FwG.s2aqJpRC/./l2Qg6lJYxVeRNDCnkjpu', 'admin', 'active', '2025-09-28 08:40:30', '2025-09-28 12:30:01');

-- --------------------------------------------------------

--
-- Dumping data for table `borrowing`
--

INSERT INTO `borrowing` (`id`, `user_id`, `equipment_id`, `borrow_date`, `return_date`, `due_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 9, 1, '2025-09-25 09:00:00', NULL, '2025-10-02 17:00:00', 'borrowed', 'สำหรับโปรเจ็ค IoT', '2025-09-25 09:00:00', '2025-09-25 09:00:00'),
(2, 10, 2, '2025-09-26 10:30:00', '2025-09-28 16:00:00', '2025-10-03 17:00:00', 'returned', 'ใช้งานเสร็จแล้ว', '2025-09-26 10:30:00', '2025-09-28 16:00:00'),
(3, 11, 7, '2025-09-27 14:15:00', NULL, '2025-10-04 17:00:00', 'borrowed', 'ทดลอง Arduino', '2025-09-27 14:15:00', '2025-09-27 14:15:00');

-- --------------------------------------------------------

--
-- Dumping data for table `borrowing_history`
--

INSERT INTO `borrowing_history` (`id`, `borrowing_id`, `user_id`, `equipment_id`, `action`, `action_date`, `notes`, `created_at`) VALUES
(1, 1, 9, 1, 'borrow', '2025-09-25 09:00:00', 'สำหรับโปรเจ็ค IoT', '2025-09-25 09:00:00'),
(2, 2, 10, 2, 'borrow', '2025-09-26 10:30:00', 'ใช้งานในห้องปฏิบัติการ', '2025-09-26 10:30:00'),
(3, 2, 10, 2, 'return', '2025-09-28 16:00:00', 'ใช้งานเสร็จแล้ว', '2025-09-28 16:00:00'),
(4, 3, 11, 7, 'borrow', '2025-09-27 14:15:00', 'ทดลอง Arduino', '2025-09-27 14:15:00');

-- --------------------------------------------------------

--
-- Structure for view `active_borrowing`
--
DROP TABLE IF EXISTS `active_borrowing`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_borrowing`  AS SELECT `b`.`id` AS `id`, `b`.`user_id` AS `user_id`, `u`.`student_id` AS `student_id`, `u`.`fullname` AS `fullname`, `u`.`email` AS `email`, `b`.`equipment_id` AS `equipment_id`, `e`.`name` AS `equipment_name`, `b`.`borrow_date` AS `borrow_date`, `b`.`due_date` AS `due_date`, `b`.`status` AS `status`, CASE WHEN `b`.`due_date` < current_timestamp() AND `b`.`status` = 'borrowed' THEN 'overdue' ELSE `b`.`status` END AS `current_status` FROM ((`borrowing` `b` join `users` `u` on(`b`.`user_id` = `u`.`id`)) join `equipment` `e` on(`b`.`equipment_id` = `e`.`id`)) WHERE `b`.`status` in ('borrowed','overdue') ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `borrowing`
--
ALTER TABLE `borrowing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_equipment_id` (`equipment_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_borrow_date` (`borrow_date`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Indexes for table `borrowing_history`
--
ALTER TABLE `borrowing_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_borrowing_id` (`borrowing_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_equipment_id` (`equipment_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_action_date` (`action_date`);

--
-- Indexes for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_request_date` (`request_date`),
  ADD KEY `idx_borrow_date` (`borrow_date`);

--
-- Indexes for table `borrow_request_items`
--
ALTER TABLE `borrow_request_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_request_id` (`request_id`),
  ADD KEY `idx_equipment_id` (`equipment_id`);

--
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `borrowing`
--
ALTER TABLE `borrowing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `borrowing_history`
--
ALTER TABLE `borrowing_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `borrow_request_items`
--
ALTER TABLE `borrow_request_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrowing`
--
ALTER TABLE `borrowing`
  ADD CONSTRAINT `borrowing_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrowing_history`
--
ALTER TABLE `borrowing_history`
  ADD CONSTRAINT `borrowing_history_ibfk_1` FOREIGN KEY (`borrowing_id`) REFERENCES `borrowing` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_history_ibfk_3` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD CONSTRAINT `borrow_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrow_request_items`
--
ALTER TABLE `borrow_request_items`
  ADD CONSTRAINT `borrow_request_items_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `borrow_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrow_request_items_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
