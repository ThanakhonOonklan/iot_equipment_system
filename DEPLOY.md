# คู่มือการ Deploy บน Vercel

## 📋 สิ่งที่ต้องเตรียม

### 1. ข้อมูลจาก TiDB Cloud
- **DB_HOST**: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
- **DB_PORT**: `4000`
- **DB_NAME**: `iot_equipment_system`
- **DB_USER**: `TmRDCm5EFLEKiwu.root`
- **DB_PASS**: (password ที่ generate จาก TiDB Cloud)

## 🚀 ขั้นตอนการ Deploy

### 1. ติดตั้ง Vercel CLI

```bash
npm install -g vercel
```

### 2. Login เข้า Vercel

```bash
vercel login
```

### 3. Deploy โปรเจกต์

```bash
# Deploy ครั้งแรก (preview)
vercel

# Deploy ไป production
vercel --prod
```

### 4. ตั้งค่า Environment Variables

หลังจาก deploy แล้ว ไปที่ Vercel Dashboard:

1. ไปที่ **Project Settings** → **Environment Variables**
2. เพิ่มตัวแปรต่อไปนี้:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` | Production, Preview, Development |
| `DB_PORT` | `4000` | Production, Preview, Development |
| `DB_NAME` | `iot_equipment_system` | Production, Preview, Development |
| `DB_USER` | `TmRDCm5EFLEKiwu.root` | Production, Preview, Development |
| `DB_PASS` | `(password จาก TiDB Cloud)` | Production, Preview, Development |
| `VITE_API_URL` | `https://your-project.vercel.app/api` | Production, Preview |

**หมายเหตุ:** 
- แทนที่ `your-project.vercel.app` ด้วย domain ที่ Vercel ให้คุณ
- หลังจากตั้งค่า Environment Variables แล้ว ต้อง **Redeploy** โปรเจกต์

### 5. Redeploy หลังจากตั้งค่า Environment Variables

```bash
vercel --prod
```

หรือไปที่ Vercel Dashboard → Deployments → คลิก "..." → "Redeploy"

## 📁 โครงสร้างไฟล์สำหรับ Vercel

```
iot_equipment_system/
├── api/              # PHP API endpoints (deploy เป็น serverless functions)
├── dist/             # Build output จาก Vite (generated)
├── src/              # React source code
├── public/           # Static assets
├── vercel.json       # Vercel configuration
├── package.json      # Dependencies และ build scripts
└── vite.config.ts    # Vite configuration
```

## ⚙️ การทำงานของ Vercel

1. **Frontend (React)**: 
   - Build ด้วย `npm run build`
   - Output ไปที่ `dist/`
   - Serve จาก `dist/index.html`

2. **Backend (PHP API)**:
   - Deploy เป็น serverless functions
   - Routes `/api/*` จะไปที่ `api/*.php`

## 🔍 ตรวจสอบการ Deploy

### 1. ตรวจสอบ Frontend
เปิด URL ที่ Vercel ให้ (เช่น `https://your-project.vercel.app`)

### 2. ตรวจสอบ API
ทดสอบ API endpoint:
```
https://your-project.vercel.app/api/equipment.php
```

ควรได้ JSON response กลับมา

### 3. ตรวจสอบ Logs
ไปที่ Vercel Dashboard → **Deployments** → เลือก deployment → **Functions** → ดู logs

## 🐛 แก้ไขปัญหา

### ปัญหา: API ไม่ทำงาน
- ตรวจสอบว่า Environment Variables ถูกตั้งค่าแล้ว
- ตรวจสอบว่า PHP files อยู่ในโฟลเดอร์ `api/`
- ดู logs ใน Vercel Dashboard

### ปัญหา: Frontend ไม่แสดง
- ตรวจสอบว่า build สำเร็จ (`dist/` folder มีไฟล์)
- ตรวจสอบ routes ใน `vercel.json`

### ปัญหา: Database Connection Error
- ตรวจสอบ Environment Variables (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS)
- ตรวจสอบว่า IP ของ Vercel ถูก whitelist ใน TiDB Cloud (หรือใช้ public endpoint)
- ตรวจสอบ logs ใน Vercel Dashboard

## 📝 หมายเหตุ

- ไฟล์ `config.php` จะไม่ถูก deploy (อยู่ใน `.vercelignore`)
- ใช้ Environment Variables แทน `config.php` ใน production
- `test_tidb_connection.php` จะไม่ถูก deploy (อยู่ใน `.vercelignore`)

## 🔗 Links ที่เกี่ยวข้อง

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel PHP Runtime](https://vercel.com/docs/runtimes/php)
- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud/)

