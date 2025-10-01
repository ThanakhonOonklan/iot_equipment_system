# ระบบบริการยืม-คืนอุปกรณ์วิชา IoT

ระบบจัดการการยืม-คืนอุปกรณ์สำหรับวิชา IoT ที่พัฒนาด้วย React + TypeScript และ PHP API

## 🎯 เกี่ยวกับโปรเจ็ค

ระบบนี้ถูกออกแบบมาเพื่อจัดการการยืม-คืนอุปกรณ์ IoT ในสถาบันการศึกษา โดยมีฟีเจอร์ครบครันสำหรับการจัดการอุปกรณ์, ผู้ใช้, และการติดตามประวัติการยืม-คืน

## ✨ ฟีเจอร์หลัก

### 🔐 ระบบผู้ใช้
- **การสมัครสมาชิก** - ระบบสมัครสมาชิกพร้อมการอนุมัติ
- **การเข้าสู่ระบบ** - ระบบล็อกอินด้วยรหัสนักศึกษา
- **การจัดการบทบาท** - Admin, Staff, User, Guest
- **การอนุมัติสมาชิก** - ระบบรอการอนุมัติจาก Admin

### 📦 การจัดการอุปกรณ์
- **เพิ่ม/แก้ไข/ลบอุปกรณ์** - จัดการข้อมูลอุปกรณ์ครบถ้วน
- **หมวดหมู่อุปกรณ์** - จัดกลุ่มอุปกรณ์ตามประเภท
- **ติดตามจำนวน** - จำนวนทั้งหมดและจำนวนคงเหลือ
- **สถานะอุปกรณ์** - Available, Borrowed, Maintenance, etc.

### 🔄 ระบบยืม-คืน
- **ยืมอุปกรณ์** - เลือกอุปกรณ์และส่งคำขอ
- **อนุมัติคำขอ** - ระบบอนุมัติคำขอยืม
- **ประวัติการยืม** - ติดตามประวัติการยืม-คืน
- **การแจ้งเตือน** - แจ้งเตือนอุปกรณ์เกินกำหนด

### 📊 Dashboard & Analytics
- **สถิติภาพรวม** - จำนวนผู้ใช้, อุปกรณ์, การใช้งาน
- **กิจกรรมล่าสุด** - ติดตามกิจกรรมในระบบ
- **รายงานการใช้งาน** - วิเคราะห์การใช้งานอุปกรณ์

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **Lucide React** - Icons
- **SweetAlert2** - Notifications
- **Radix UI** - UI Components

### Backend
- **PHP 8.0+** - Server-side Language
- **MySQL/MariaDB** - Database
- **PDO** - Database Connection
- **Stored Procedures** - Complex Operations

### Development Tools
- **Node.js** - Runtime Environment
- **npm** - Package Manager
- **Git** - Version Control

## 📋 ข้อกำหนดระบบ

### Frontend Requirements
- **Node.js** 16.0+ 
- **npm** 7.0+
- **Modern Browser** (Chrome, Firefox, Safari, Edge)

### Backend Requirements
- **PHP** 8.0+
- **MySQL** 5.7+ หรือ **MariaDB** 10.3+
- **Web Server** (Apache/Nginx)
- **PHP Extensions**: PDO, PDO_MySQL, JSON

## 🚀 การติดตั้งและใช้งาน

### 1. Clone โปรเจ็ค
```bash
git clone <repository-url>
cd iot_equipment_system
```

### 2. ติดตั้ง Frontend Dependencies
```bash
npm install
```

### 3. ตั้งค่าฐานข้อมูล
1. สร้างฐานข้อมูล MySQL:
```sql
CREATE DATABASE iot_equipment_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import ไฟล์ SQL:
```bash
mysql -u root -p iot_equipment_system < iot_equipment_system.sql
```

### 4. ตั้งค่า Backend
1. แก้ไขการเชื่อมต่อฐานข้อมูลใน `Connect.php`:
```php
private $host = 'localhost';
private $db_name = 'iot_equipment_system';
private $username = 'root'; // เปลี่ยนตามการตั้งค่าของคุณ
private $password = ''; // เปลี่ยนตามการตั้งค่าของคุณ
```

2. ตั้งค่า Web Server ให้ชี้ไปที่โฟลเดอร์โปรเจ็ค

### 5. ตั้งค่า Frontend
แก้ไข API URL ใน `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost/iot_equipment_system/api';
```

### 6. รันโปรเจ็ค
```bash
# Development
npm run dev

# Production Build
npm run build
```

## 📁 โครงสร้างโปรเจ็ค

```
iot_equipment_system/
├── api/                    # PHP API Endpoints
│   ├── login.php
│   ├── register.php
│   ├── users.php
│   ├── equipment.php
│   ├── borrow_requests.php
│   ├── pending_registrations.php
│   └── borrowing_history.php
├── src/                    # React Source Code
│   ├── components/         # Reusable Components
│   ├── screens/           # Page Components
│   ├── contexts/          # React Contexts
│   ├── services/          # API Services
│   └── lib/               # Utilities
├── public/                 # Static Assets
├── Connect.php            # Database Connection
├── iot_equipment_system.sql # Database Schema
└── package.json           # Dependencies
```

## 🔧 การตั้งค่าสำหรับ Development

### 1. ตั้งค่า Database
- ใช้ XAMPP, WAMP, หรือ MAMP สำหรับ local development
- สร้างฐานข้อมูล `iot_equipment_system`
- Import ไฟล์ SQL

### 2. ตั้งค่า API
- วางไฟล์ PHP ในโฟลเดอร์ `api/`
- ตั้งค่า CORS headers (มีอยู่แล้วในโค้ด)
- ทดสอบ API ด้วย `test_api.html` (ถ้ามี)

### 3. ตั้งค่า Frontend
- รัน `npm install` เพื่อติดตั้ง dependencies
- รัน `npm run dev` เพื่อเริ่ม development server
- เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

## 👥 บทบาทผู้ใช้

### Admin
- จัดการผู้ใช้ทั้งหมด
- อนุมัติคำขอสมัครสมาชิก
- อนุมัติคำขอยืมอุปกรณ์
- ดูประวัติการยืม-คืนทั้งหมด

### Staff
- จัดการอุปกรณ์
- อนุมัติคำขอยืม
- ดูรายงานการใช้งาน

### User
- ยืมอุปกรณ์
- ดูประวัติการยืมของตัวเอง
- จัดการข้อมูลส่วนตัว

## 🐛 การแก้ไขปัญหา

### ปัญหาการเชื่อมต่อฐานข้อมูล
- ตรวจสอบการตั้งค่าใน `Connect.php`
- ตรวจสอบว่า MySQL service ทำงานอยู่
- ตรวจสอบ username/password

### ปัญหา CORS
- ตรวจสอบ CORS headers ในไฟล์ PHP
- ตรวจสอบ API URL ใน frontend

### ปัญหา Build
- ลบ `node_modules` และรัน `npm install` ใหม่
- ตรวจสอบ Node.js version

## 📞 การสนับสนุน

หากมีปัญหาหรือข้อสงสัย สามารถติดต่อได้ที่:
- Email: [your-email@domain.com]
- GitHub Issues: [repository-url]/issues

## 📄 License

โปรเจ็คนี้เป็น Open Source และสามารถใช้งานได้ฟรี

---

**พัฒนาโดย:** [Your Name]  
**เวอร์ชัน:** 1.0.0  
**อัปเดตล่าสุด:** 2024
