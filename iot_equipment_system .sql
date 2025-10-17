-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 06, 2025 at 05:53 PM
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
,`student_id` varchar(12)
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

--
-- Dumping data for table `borrowing`
--

INSERT INTO `borrowing` (`id`, `user_id`, `equipment_id`, `borrow_date`, `return_date`, `due_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, 2, '2025-10-05 00:00:00', NULL, '2025-10-06 00:00:00', 'borrowed', 'อนุมัติโดย: ทดสอบ', '2025-10-05 06:38:02', '2025-10-05 06:38:02'),
(2, 3, 3, '2025-10-05 00:00:00', NULL, '2025-10-06 00:00:00', 'borrowed', 'อนุมัติโดย: ทดสอบ', '2025-10-05 06:38:02', '2025-10-05 06:38:02'),
(3, 3, 4, '2025-10-05 00:00:00', NULL, '2025-10-06 00:00:00', 'borrowed', 'อนุมัติโดย: ทดสอบ', '2025-10-05 06:38:02', '2025-10-05 06:38:02'),
(4, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(5, 2, 2, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(6, 2, 3, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(7, 2, 4, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(8, 2, 5, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(9, 2, 10, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(10, 2, 7, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(11, 2, 6, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(12, 2, 11, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(13, 2, 12, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(14, 2, 14, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(15, 2, 15, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(16, 2, 16, '2025-10-06 00:00:00', NULL, '2025-10-07 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31', '2025-10-06 15:39:31'),
(17, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-09 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:40:01', '2025-10-06 15:40:01'),
(18, 2, 2, '2025-10-06 00:00:00', NULL, '2025-10-09 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:40:01', '2025-10-06 15:40:01'),
(19, 2, 3, '2025-10-06 00:00:00', NULL, '2025-10-09 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:40:01', '2025-10-06 15:40:01'),
(20, 2, 4, '2025-10-06 00:00:00', NULL, '2025-10-09 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:40:01', '2025-10-06 15:40:01'),
(21, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-08 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22', '2025-10-06 15:43:22'),
(22, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-08 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22', '2025-10-06 15:43:22'),
(23, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-08 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22', '2025-10-06 15:43:22'),
(24, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-08 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22', '2025-10-06 15:43:22'),
(25, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-08 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22', '2025-10-06 15:43:22'),
(26, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-08 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22', '2025-10-06 15:43:22'),
(27, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-08 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22', '2025-10-06 15:43:22'),
(28, 2, 1, '2025-10-06 00:00:00', NULL, '2025-10-08 00:00:00', 'borrowed', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22', '2025-10-06 15:43:22');

-- --------------------------------------------------------

--
-- Table structure for table `borrowing_history`
--

CREATE TABLE `borrowing_history` (
  `id` int(11) NOT NULL,
  `borrowing_id` int(11) NOT NULL COMMENT 'ID การยืม',
  `user_id` int(11) NOT NULL COMMENT 'ID ผู้ใช้',
  `equipment_id` int(11) NOT NULL COMMENT 'ID อุปกรณ์',
  `approver_id` int(11) DEFAULT NULL COMMENT 'ID ผู้อนุมัติ',
  `approver_name` varchar(100) DEFAULT NULL COMMENT 'ชื่อผู้อนุมัติ',
  `equipment_names` text DEFAULT NULL COMMENT 'รายชื่ออุปกรณ์',
  `action` enum('borrow','return','extend','lost','approve') NOT NULL COMMENT 'การกระทำ',
  `action_date` datetime NOT NULL COMMENT 'วันที่กระทำ',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางประวัติการยืม-คืน';

--
-- Dumping data for table `borrowing_history`
--

INSERT INTO `borrowing_history` (`id`, `borrowing_id`, `user_id`, `equipment_id`, `approver_id`, `approver_name`, `equipment_names`, `action`, `action_date`, `notes`, `created_at`) VALUES
(1, 1, 3, 2, 3, 'ทดสอบ', NULL, 'borrow', '2025-10-05 13:38:02', 'อนุมัติโดย: ทดสอบ', '2025-10-05 06:38:02'),
(2, 2, 3, 3, 3, 'ทดสอบ', NULL, 'borrow', '2025-10-05 13:38:02', 'อนุมัติโดย: ทดสอบ', '2025-10-05 06:38:02'),
(3, 3, 3, 4, 3, 'ทดสอบ', NULL, 'borrow', '2025-10-05 13:38:02', 'อนุมัติโดย: ทดสอบ', '2025-10-05 06:38:02'),
(4, 4, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(5, 5, 2, 2, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(6, 6, 2, 3, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(7, 7, 2, 4, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(8, 8, 2, 5, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(9, 9, 2, 10, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(10, 10, 2, 7, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(11, 11, 2, 6, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(12, 12, 2, 11, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(13, 13, 2, 12, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(14, 14, 2, 14, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(15, 15, 2, 15, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(16, 16, 2, 16, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:39:31', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:39:31'),
(17, 17, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:40:01', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:40:01'),
(18, 18, 2, 2, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:40:01', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:40:01'),
(19, 19, 2, 3, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:40:01', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:40:01'),
(20, 20, 2, 4, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:40:01', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:40:01'),
(21, 21, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:43:22', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22'),
(22, 22, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:43:22', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22'),
(23, 23, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:43:22', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22'),
(24, 24, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:43:22', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22'),
(25, 25, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:43:22', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22'),
(26, 26, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:43:22', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22'),
(27, 27, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:43:22', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22'),
(28, 28, 2, 1, 2, 'นาย ธนกรณ์ อ่อนกลั่น', NULL, 'borrow', '2025-10-06 22:43:22', 'อนุมัติโดย: นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 15:43:22');

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
  `approver_id` int(11) DEFAULT NULL COMMENT 'ID ผู้อนุมัติ',
  `approver_name` varchar(100) DEFAULT NULL COMMENT 'ชื่อผู้อนุมัติ',
  `approved_at` datetime DEFAULT NULL COMMENT 'วันที่อนุมัติ',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุเพิ่มเติม',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางคำขอยืมอุปกรณ์';

--
-- Dumping data for table `borrow_requests`
--

INSERT INTO `borrow_requests` (`id`, `user_id`, `request_date`, `borrow_date`, `return_date`, `status`, `approver_id`, `approver_name`, `approved_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, '2025-10-05 13:37:55', '2025-10-05', '2025-10-06', 'approved', 3, 'ทดสอบ', '2025-10-05 13:38:02', '', '2025-10-05 06:37:55', '2025-10-05 06:38:02'),
(2, 2, '2025-10-06 22:38:07', '2025-10-06', '2025-10-07', 'approved', 2, 'นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 22:39:31', 'qaqaq', '2025-10-06 15:38:07', '2025-10-06 15:39:31'),
(3, 2, '2025-10-06 22:39:48', '2025-10-06', '2025-10-09', 'approved', 2, 'นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 22:40:01', '', '2025-10-06 15:39:48', '2025-10-06 15:40:01'),
(4, 2, '2025-10-06 22:41:30', '2025-10-06', '2025-10-08', 'pending', NULL, NULL, NULL, '', '2025-10-06 15:41:30', '2025-10-06 15:41:30'),
(5, 2, '2025-10-06 22:43:16', '2025-10-06', '2025-10-08', 'approved', 2, 'นาย ธนกรณ์ อ่อนกลั่น', '2025-10-06 22:43:22', '', '2025-10-06 15:43:16', '2025-10-06 15:43:22');

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

--
-- Dumping data for table `borrow_request_items`
--

INSERT INTO `borrow_request_items` (`id`, `request_id`, `equipment_id`, `quantity_requested`, `quantity_approved`, `created_at`) VALUES
(1, 1, 2, 1, 1, '2025-10-05 06:37:55'),
(2, 1, 3, 1, 1, '2025-10-05 06:37:55'),
(3, 1, 4, 1, 1, '2025-10-05 06:37:55'),
(4, 2, 1, 1, 1, '2025-10-06 15:38:07'),
(5, 2, 2, 1, 1, '2025-10-06 15:38:07'),
(6, 2, 3, 1, 1, '2025-10-06 15:38:07'),
(7, 2, 4, 1, 1, '2025-10-06 15:38:07'),
(8, 2, 5, 1, 1, '2025-10-06 15:38:07'),
(9, 2, 10, 1, 1, '2025-10-06 15:38:07'),
(10, 2, 7, 1, 1, '2025-10-06 15:38:07'),
(11, 2, 6, 1, 1, '2025-10-06 15:38:07'),
(12, 2, 11, 1, 1, '2025-10-06 15:38:07'),
(13, 2, 12, 1, 1, '2025-10-06 15:38:07'),
(14, 2, 14, 1, 1, '2025-10-06 15:38:07'),
(15, 2, 15, 1, 1, '2025-10-06 15:38:07'),
(16, 2, 16, 1, 1, '2025-10-06 15:38:07'),
(17, 3, 1, 1, 1, '2025-10-06 15:39:48'),
(18, 3, 2, 1, 1, '2025-10-06 15:39:48'),
(19, 3, 3, 1, 1, '2025-10-06 15:39:48'),
(20, 3, 4, 1, 1, '2025-10-06 15:39:48'),
(21, 4, 1, 1, 0, '2025-10-06 15:41:30'),
(22, 4, 2, 1, 0, '2025-10-06 15:41:30'),
(23, 4, 5, 1, 0, '2025-10-06 15:41:30'),
(24, 5, 1, 8, 8, '2025-10-06 15:43:16');

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
(1, 'Arduino Uno R3', '-', 'Arduino', 'https://o.lnwfile.com/_/o/_raw/pa/g2/f9.jpg', 30, 30, 'available', '2025-10-05 06:23:07', '2025-10-06 15:49:35'),
(2, 'Raspberry Pi 4 Model B', '', 'Raspberry', 'https://inex.co.th/home/wp-content/uploads/2020/07/raspberry-pi-4b-4gb-top.jpg', 10, 7, 'available', '2025-10-05 06:23:39', '2025-10-06 15:40:01'),
(3, 'ESP32 Development Board', '-', 'ESP32', 'https://www.imiconsystem.com/wp-content/uploads/2023/01/esp32-devkit-v1-1-3.jpg', 10, 7, 'available', '2025-10-05 06:24:15', '2025-10-06 15:40:01'),
(4, 'NodeMCU ESP8266', '-', 'ESP8266', 'https://gh.lnwfile.com/_/gh/_raw/6z/2m/7m.jpg', 10, 7, 'available', '2025-10-05 06:24:57', '2025-10-06 15:40:01'),
(5, 'DHT22 Temperature Sensor', '-', 'Sensor', 'https://static.cytron.io/image/cache/catalog/products/SN-DHT22-MOD/dht22-sensor-module-breakout-a4872-800x800.jpg', 10, 9, 'available', '2025-10-05 06:25:25', '2025-10-06 15:39:31'),
(6, 'Ultrasonic Sensor', '-', 'Sensor', 'https://media.rs-online.com/Y2153181-01.jpg', 10, 9, 'available', '2025-10-05 06:25:59', '2025-10-06 15:39:31'),
(7, 'PIR Motion Sensor', '-', 'Sensor', 'https://s1145.lnwfile.com/_c/fp/_webp_max/1024/1024/1c/2q/wm.webp', 10, 9, 'available', '2025-10-05 06:26:23', '2025-10-06 15:39:31'),
(8, 'MQ-135 Air Quality Sensor', '-', 'Sensor', 'https://inwfile.com/s-dm/ys0mnt.jpg', 10, 10, 'available', '2025-10-05 06:27:01', '2025-10-05 06:27:01'),
(9, 'Servo Motor SG90', '-', 'Servo', 'https://inwfile.com/s-dm/orj0a7.jpg', 10, 10, 'available', '2025-10-05 06:27:47', '2025-10-05 06:27:47'),
(10, 'LED Strip WS2812B', '-', 'LED', 'https://quartzcomponents.com/cdn/shop/products/LED_Strip_2_1200x1200.jpg?v=1681122790', 10, 9, 'available', '2025-10-05 06:28:27', '2025-10-06 15:39:31'),
(11, 'BME280 Environmental Sensor', '-', 'Sensor', 'https://static.cytron.io/image/cache/catalog/products/SN-BME280/BME280-Environmental-Sensor-800x800.png', 100, 99, 'available', '2025-10-05 06:30:14', '2025-10-06 15:39:31'),
(12, 'RFID Reader RC522', '-', 'RFID', 'https://dw.lnwfile.com/_/dw/_raw/iw/q6/5y.jpg', 30, 14, 'available', '2025-10-05 06:30:51', '2025-10-06 15:39:31'),
(13, 'Relay Module 5V', '-', 'Relay', 'https://inwfile.com/s-dx/f0ig0y.png', 10, 5, 'available', '2025-10-05 06:32:10', '2025-10-05 06:32:19'),
(14, '16x2 LCD Display', '-', 'Display', 'https://soldered.com/productdata/2023/01/DSC_8573-1024x678-1.jpg', 10, 7, 'available', '2025-10-05 06:32:57', '2025-10-06 15:39:31'),
(15, 'Bluetooth Module HC-05', '-', 'Bluetooth', 'https://gh.lnwfile.com/_/gh/_raw/ik/k3/9d.jpg', 40, 19, 'available', '2025-10-05 06:33:30', '2025-10-06 15:39:31'),
(16, 'WiFi Module ESP-01', '-', 'WiFi', 'https://o.lnwfile.com/_/o/_raw/ol/fp/z0.jpg', 20, 14, 'available', '2025-10-05 06:34:07', '2025-10-06 15:39:31');

-- --------------------------------------------------------

--
-- Table structure for table `pending_registrations`
--

CREATE TABLE `pending_registrations` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `student_id` varchar(12) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','staff','user') NOT NULL DEFAULT 'user',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `student_id` varchar(12) NOT NULL COMMENT 'รหัสนักศึกษา (12 หลัก)',
  `email` varchar(50) NOT NULL COMMENT 'อีเมล (รหัส 12 หลัก + st@rmutsb.ac.th)',
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
(2, '111111111111', '111111111111-st@rmutsb.ac.th', 'นาย ธนกรณ์ อ่อนกลั่น', '$2y$10$r5/6MF4INO09CBR1O184je0CFonHRdC6/5EGPUlCg5ur.Jqe1CW.O', 'admin', 'active', '2025-10-05 06:19:15', '2025-10-06 15:22:43'),
(3, '000000000000', '000000000000-st@rmutsb.ac.th', 'ทดสอบ', '$2y$10$j2TKtXR4S1/fK1LVW2r.9OlLBVDP/Azj/OaFOdTZj9eTeSKA3KGM2', 'admin', 'active', '2025-10-05 06:36:08', '2025-10-06 15:24:22'),
(4, '999999999999', '999999999999-st@rmutsb.ac.th', '999999999999', '999999999999', 'admin', 'active', '2025-10-06 15:25:23', '2025-10-06 15:27:35'),
(5, '670602141011', '670602141011-st@rmutsb.ac.th', 'สมดี กีหอม', '$2y$10$ffmICQtOVB1YOJ4VDtg34.F5LWcUAK8mdYi9ZIj.UvBFQW9cjY1wm', 'user', 'active', '2025-10-06 15:30:04', '2025-10-06 15:30:04');

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
-- Indexes for table `pending_registrations`
--
ALTER TABLE `pending_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_student_id` (`student_id`),
  ADD UNIQUE KEY `uniq_email` (`email`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `borrowing_history`
--
ALTER TABLE `borrowing_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `borrow_request_items`
--
ALTER TABLE `borrow_request_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `pending_registrations`
--
ALTER TABLE `pending_registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
