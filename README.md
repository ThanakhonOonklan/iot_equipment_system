# IoT Equipment Borrowing System

ระบบบริหารจัดการและยืม-คืนอุปกรณ์ IoT และฮาร์ดแวร์อิเล็กทรอนิกส์แบบ Full-stack พัฒนาด้วย React (Vite + TypeScript + Tailwind CSS) เชื่อมต่อ RESTful API ด้วย PHP รองรับทั้งฐานข้อมูล MySQL และ PostgreSQL (Supabase) ออกแบบมาสำหรับบริหารจัดการคลังอุปกรณ์ การส่งและอนุมัติคำขอยืม การตรวจรับคืน และตรวจสอบประวัติการใช้งาน พร้อมระบบจัดการสิทธิ์ผู้ใช้งาน (Role-Based Access Control)

---

## Features

| ฟีเจอร์ | รายละเอียด |
|---|---|
| **Authentication & RBAC** | ระบบเข้าสู่ระบบและสมัครสมาชิก แบ่งสิทธิ์ 3 ระดับ (`admin`, `staff`, `user`) ตรวจสอบรูปแบบรหัสนักศึกษา 12 หลัก และอีเมลมหาวิทยาลัย |
| **Pending Registrations** | ระบบกลั่นกรองและอนุมัติคำขอสมัครสมาชิกใหม่โดยเจ้าหน้าที่/ผู้ดูแลก่อนเปิดใช้งานบัญชีจริง |
| **Dashboard & Analytics** | แดชบอร์ดสรุปสถิติภาพรวม (จำนวนผู้ใช้, อุปกรณ์ทั้งหมด, อุปกรณ์พร้อมใช้งาน, อุปกรณ์ที่ถูกยืม) พร้อมปฏิทินและรายการกิจกรรมล่าสุด |
| **Equipment Management** | ระบบจัดการสต็อกอุปกรณ์ IoT (เพิ่ม, แก้ไข, ลบ, จัดการหมวดหมู่, รูปภาพ, จำนวนทั้งหมด และจำนวนคงเหลือ) |
| **Borrow Equipment** | หน้าสำหรับค้นหา เลือกอุปกรณ์ ระบุจำนวน และส่งคำขอยืมอุปกรณ์พร้อมเลือกช่วงเวลาและระบุเหตุผลการยืม |
| **Borrow Requests Approval** | ระบบตรวจสอบ อนุมัติ หรือปฏิเสธคำขอยืมอุปกรณ์สำหรับเจ้าหน้าที่และผู้ดูแลระบบ |
| **My Requests** | หน้าตรวจสอบสถานะคำขอยืมส่วนตัวสำหรับผู้ใช้งานทั่วไป (Pending, Approved, Rejected, Completed) |
| **Return Equipment** | ระบบตรวจรับคืนอุปกรณ์ ตรวจสอบรายการยืมที่ยังไม่คืน คำนวณวันคงเหลือ/เกินกำหนดส่งคืน (Overdue) และบันทึกการรับคืน |
| **Borrowing History** | ประวัติและบันทึก Log การทำรายการยืม-คืนทั้งหมด ค้นหาและดูรายละเอียดผู้อนุมัติ วันที่ยืม และวันที่คืน |
| **Equipment Statistics** | รายงานสถิติอุปกรณ์ที่ถูกยืมบ่อยที่สุด (Most Borrowed) และอุปกรณ์ที่เกิดความชำรุดเสียหาย (Most Damaged) |

---

## Project Structure

```
iot_equipment_system/
├── api/                           # PHP Backend RESTful API Endpoints
│   ├── borrow_requests.php        # จัดการคำขอยืม (ส่งคำขอ, อนุมัติ, ปฏิเสธ)
│   ├── borrowing.php              # ข้อมูลรายการที่กำลังถูกยืม
│   ├── borrowing_history.php      # ประวัติและ Log การทำรายการยืม-คืน
│   ├── equipment.php              # CRUD ข้อมูลอุปกรณ์และสต็อก
│   ├── equipment_stats.php        # สถิติอุปกรณ์ที่ยืมบ่อย / เสียหาย
│   ├── login.php                  # ตรวจสอบสิทธิ์เข้าสู่ระบบ & Session
│   ├── pending_registrations.php  # จัดการคำขอสมัครสมาชิกที่รออนุมัติ
│   ├── register.php               # ระบบสมัครสมาชิกใหม่
│   ├── return_equipment.php       # โฟลว์การตรวจรับคืนอุปกรณ์
│   └── users.php                  # CRUD ข้อมูลผู้ใช้งานและปรับเปลี่ยนสิทธิ์
├── src/                           # Frontend Source Code (React + TypeScript)
│   ├── components/                # Reusable UI & Layout Components
│   │   ├── Layout/                # Navbar, Sidebar, Footer และ Main Layout
│   │   ├── auth/                  # Route Guards (ProtectedRoute, AuthGuard, RoleBasedRedirect)
│   │   ├── borrow-requests/       # Components จัดการคำขอยืม
│   │   ├── equipment/             # Components และ Modal จัดการอุปกรณ์
│   │   ├── users/                 # Components จัดการผู้ใช้
│   │   └── ui/                    # UI Elements (Button, Card, Input, Label, StatsCard ฯลฯ)
│   ├── contexts/                  # React Contexts (AuthContext, LoadingContext)
│   ├── screens/                   # หน้าจอแต่ละโมดูลของระบบ
│   │   ├── Home/ / Dashboard/     # หน้าหลัก แดชบอร์ดสรุปข้อมูลและปฏิทิน
│   │   ├── Login/                 # หน้าเข้าสู่ระบบ
│   │   ├── Register/              # หน้าสมัครสมาชิกใหม่
│   │   ├── Equipment/             # หน้ารายการและจัดการสต็อกอุปกรณ์
│   │   ├── BorrowEquipment/       # หน้าส่งคำขอยืมอุปกรณ์
│   │   ├── BorrowRequests/        # หน้าพิจารณาและอนุมัติคำขอยืม
│   │   ├── MyRequests/            # หน้าติดตามคำขอยืมของผู้ใช้
│   │   ├── ReturnEquipment/       # หน้าตรวจรับคืนอุปกรณ์
│   │   ├── History/               # หน้าดูประวัติการยืม-คืน
│   │   ├── ManageUsers/           # หน้าจัดการผู้ใช้งานในระบบ
│   │   ├── PendingRegistrations/  # หน้าอนุมัติการสมัครสมาชิกใหม่
│   │   ├── MostBorrowedEquipment/ # หน้าสถิติอุปกรณ์ยืมบ่อยสุด
│   │   └── MostDamagedEquipment/  # หน้าสถิติอุปกรณ์เสียหายบ่อยสุด
│   ├── services/
│   │   └── api.ts                 # API Client (Fetch Wrapper & Type Definitions)
│   ├── App.tsx                    # Route Map และการป้องกันสิทธิ์ตามบทบาท (Role)
│   └── index.tsx                  # Application Entry Point
├── public/                        # Static Assets (รูปภาพ, โลโก้)
├── storage/                       # Backend Runtime Storage
├── Connect.php                    # Database Helper, Security, Response & Session Classes
├── Dockerfile                     # Dockerfile สำหรับรัน PHP 8.2 Backend
├── iot_equipment_system.sql       # Database Schema & Initial Data (MySQL)
├── iot_equipment_system_postgres.sql # Database Schema (PostgreSQL / Supabase)
├── package.json                   # Frontend Dependencies & NPM Scripts
├── tailwind.config.js             # การตั้งค่า Tailwind CSS
├── tsconfig.json                  # การตั้งค่า TypeScript
├── vercel.json                    # การตั้งค่า Deploy Frontend บน Vercel
└── vite.config.ts                 # การตั้งค่า Vite
```

---

## Database Schema

ระบบรองรับทั้ง **MySQL / MariaDB** และ **PostgreSQL (Supabase)** ฐานข้อมูลชื่อ `iot_equipment_system` ประกอบด้วย 7 ตารางหลัก และ 1 View:

| ตาราง / View | รายละเอียด |
|---|---|
| `users` | ข้อมูลผู้ใช้งาน (รหัสนักศึกษา 12 หลัก, อีเมล, ชื่อ-นามสกุล, รหัสผ่าน Hash, บทบาท `admin`/`staff`/`user`, สถานะ `active`/`inactive`/`suspended`) |
| `equipment` | รายการอุปกรณ์ IoT (ชื่อ, รายละเอียด, หมวดหมู่, รูปภาพ, จำนวนทั้งหมด, จำนวนคงเหลือ, สถานะ เช่น `available`, `limited`, `maintenance`) |
| `borrow_requests` | คำขอยืมอุปกรณ์ (ผู้ยืม, วันที่ขอ, วันที่ยืม, วันที่ต้องคืน, สถานะ `pending`/`approved`/`rejected`/`completed`, ผู้อนุมัติ, หมายเหตุ) |
| `borrow_request_items` | รายการอุปกรณ์และจำนวนที่ขอยืมในแต่ละคำขอ (`request_id`, `equipment_id`, `quantity_requested`, `quantity_approved`) |
| `borrowing` | ข้อมูลการยืมอุปกรณ์ปัจจุบัน (ผู้ยืม, อุปกรณ์, วันที่ยืม, กำหนดคืน, วันที่คืนจริง, สถานะ `borrowed`/`returned`/`overdue`/`lost`) |
| `borrowing_history` | บันทึกประวัติและ Log การทำรายการยืม-คืน (`borrow`, `return`, `extend`, `lost`, `approve`) พร้อมบันทึกผู้อนุมัติ |
| `pending_registrations` | รายชื่อผู้สมัครสมาชิกใหม่ที่รอการตรวจสอบและอนุมัติจากเจ้าหน้าที่ก่อนเปิดใช้งาน |
| `active_borrowing` *(View)* | View สรุปรายการยืมที่ยังไม่คืน พร้อมคำนวณสถานะ `overdue` ให้อัตโนมัติเมื่อเลยกำหนดส่งคืน |

---

## Getting Started

### Prerequisites

- **Node.js 18+** และ **npm**
- **PHP 8.0+** พร้อมโมดูล PDO (`pdo_mysql` หรือ `pdo_pgsql`) หรือใช้งานผ่าน XAMPP / Docker
- **MySQL 8.0+** หรือ **PostgreSQL 14+** (Supabase)

---

### 1. ติดตั้งฐานข้อมูล

#### กรณีใช้งาน MySQL:
สร้างฐานข้อมูลและนำเข้าข้อมูลเริ่มต้นผ่าน MySQL CLI หรือ phpMyAdmin:

```sql
CREATE DATABASE iot_equipment_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
mysql -u root -p iot_equipment_system < iot_equipment_system.sql
```

#### กรณีใช้งาน PostgreSQL / Supabase:
คัดลอกคำสั่งในไฟล์ `iot_equipment_system_postgres.sql` ไปรันใน SQL Editor ของ Supabase หรือรันผ่าน psql:

```bash
psql -U postgres -d iot_equipment_system -f iot_equipment_system_postgres.sql
```

---

### 2. ตั้งค่าการเชื่อมต่อฐานข้อมูล

สามารถตั้งค่าผ่าน Environment Variables หรือสร้างไฟล์ `config.php` ไว้ที่ Root โปรเจ็ค:

```php
<?php
// config.php
define('DB_DRIVER', 'mysql');        // 'mysql' หรือ 'pgsql'
define('DB_HOST', 'localhost');
define('DB_NAME', 'iot_equipment_system');
define('DB_USER', 'root');           // Username ของฐานข้อมูล
define('DB_PASS', '');               // Password ของฐานข้อมูล
define('DB_PORT', '3306');           // 3306 สำหรับ MySQL, 5432 หรือ 6543 สำหรับ PostgreSQL
define('DB_SSLMODE', 'prefer');      // สำหรับ PostgreSQL
```

หรือส่งผ่าน Environment Variables ของเซิร์ฟเวอร์:
`DB_DRIVER`, `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_PORT`, `DB_SSLMODE`

---

### 3. ติดตั้งและเริ่มทำงาน Frontend

เปิด Terminal ในโฟลเดอร์โปรเจ็คและติดตั้ง Dependencies:

```bash
# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env (กรณีต้องการระบุ Backend API URL)
# VITE_API_URL=http://localhost/iot_equipment_system/api

# เริ่มต้น Local Development Server
npm run dev
```

---

### 4. Run Backend API

เลือกรูปแบบการรัน Backend ตามความสะดวก:

- **ผ่าน PHP Built-in Server**:
  ```bash
  php -S 0.0.0.0:8000
  ```
- **ผ่าน Docker**:
  ```bash
  docker build -t iot-backend .
  docker run -d -p 10000:10000 iot-backend
  ```
- **ผ่าน XAMPP / Apache**:
  วางโฟลเดอร์โปรเจ็คไว้ในไดเรกทอรี `htdocs` และเปิด Service Apache และ MySQL

---

### 5. เข้าสู่ระบบและสิทธิ์การใช้งาน

| สิทธิ์ (Role) | รหัสนักศึกษา (Username) | สิทธิ์การเข้าถึงเมนู |
|---|---|---|
| **Admin** | `000000000000` | เข้าถึงได้ทุกหน้า (Dashboard, สต็อกอุปกรณ์, คำขอยืม, รับคืน, ผู้ใช้, สถิติ) |
| **Staff** | *(กำหนดในระบบ)* | เข้าถึง Dashboard, จัดการอุปกรณ์, อนุมัติคำขอยืม, ตรวจรับคืน, สถิติ |
| **User** | *(สมัครสมาชิกใหม่)* | เข้าถึงหน้าขอยืมอุปกรณ์ (Borrow), ติดตามสถานะ (My Requests), ประวัติ (History) |

> **ข้อกำหนดสำหรับการสมัครและเข้าสู่ระบบ**:
> - **รหัสนักศึกษา**: ต้องเป็นตัวเลข 12 หลัก
> - **อีเมล**: ต้องใช้อีเมลรูปแบบ `[รหัสนักศึกษา12หลัก]-st@rmutsb.ac.th`
> - **รหัสผ่าน**: ต้องมีความยาวอย่างน้อย 6 ตัวอักษร
> - สมาชิกที่สมัครใหม่จะต้องได้รับการอนุมัติจากผู้ดูแลผ่านหน้า **Pending Registrations** ก่อนจึงจะเข้าสู่ระบบได้ (หรือผู้ดูแลสามารถเพิ่มผู้ใช้โดยตรงในระบบ)

---

## Tech Stack

| Technology | รายละเอียด |
|---|---|
| **React 18** | Frontend Library สำหรับสร้าง User Interface |
| **TypeScript** | Static Typing ช่วยเพิ่มความถูกต้อง ปลอดภัย และบำรุงรักษาง่าย |
| **Vite 6** | Build tool และ Development Server ความเร็วสูง |
| **Tailwind CSS 3** | Utility-First CSS Framework สำหรับออกแบบหน้าจอ |
| **React Router 7** | จัดการ Client-side Routing และ Role Guards |
| **Radix UI / Lucide React** | Headless UI Components และ Icon Library |
| **SweetAlert2** | แจ้งเตือน Pop-up และกล่องยืนยันการทำรายการ |
| **PHP 8.2 (RESTful API)** | Backend API จัดการตรรกะทางธุรกิจและรับ-ส่งข้อมูล JSON |
| **MySQL / PostgreSQL** | ระบบจัดการฐานข้อมูล รองรับทั้ง MySQL Local และ PostgreSQL / Supabase |
| **Docker** | Containerization สำหรับ Backend Service |
| **Vercel** | แพลตฟอร์มสำหรับ Deploy Frontend พร้อม Client-side routing rewrite |

---

## License

โปรเจ็คนี้พัฒนาขึ้นเพื่อใช้เป็นระบบบริหารจัดการอุปกรณ์ IoT และบริการยืม-คืนอุปกรณ์สำหรับการศึกษา (Rajamangala University of Technology Suvarnabhumi - RMUTSB)
