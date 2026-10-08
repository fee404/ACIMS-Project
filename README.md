# ระบบบริหารจัดการข้อมูลผลงานวิชาการ (ACIMS)
### Academic Information Management System (ACIMS)
> เพื่อสนับสนุนการประกันคุณภาพการศึกษาตามเกณฑ์ AUN-QA (Criterion 6: Academic Staff Quality)  
> สาขาวิชาเทคโนโลยีสารสนเทศ ภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์  
> คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ  
> **อัปเดตสถานะโครงการล่าสุด:** วันที่ 8 ตุลาคม 2569 (8 October 2026 เวลา 13:35 น.)

---

## 📌 1. สถานะความคืบหน้าของโครงการ (Project Phase Status)

ณ วันที่ **8 ตุลาคม 2569** โครงการได้ดำเนินการมาถึง **Phase 4 เสร็จสมบูรณ์ (100%)** และกำลังอยู่ใน **Phase 5 (95%)** โดยมีรายละเอียดของแต่ละ Phase ดังนี้:

| ลำดับ Phase | รายละเอียดงาน / ขั้นตอนการพัฒนา | สถานะ (Status) | ความคืบหน้า | วันที่ดำเนินการ |
| :--- | :--- | :---: | :---: | :---: |
| **Phase 1** | **การวิเคราะห์และออกแบบระบบ (Analysis & Design)**<br>- วิเคราะห์ความต้องการตามเกณฑ์ AUN-QA Criterion 6<br>- ออกแบบ Use Case และ Data Dictionary<br>- ออกแบบโครงสร้างฐานข้อมูลเชิงสัมพันธ์ 8 ตาราง (ER Diagram)<br>- ออกแบบสถาปัตยกรรมระบบ (Client-Server, JWT, RBAC) | ✅ เสร็จสมบูรณ์ | 100% | กันยายน 2569 |
| **Phase 2** | **การพัฒนาฐานข้อมูลและ API หลังบ้าน (Database & Backend API)**<br>- ติดตั้ง PostgreSQL Schema (`schema.sql`) และ Mock Data (`seed.sql`)<br>- พัฒนาระบบยืนยันตัวตนด้วย JWT Authentication<br>- พัฒนา RESTful APIs (Works, Users, Roles, Stats)<br>- ระบบอัปโหลดและตรวจสอบไฟล์เอกสาร (Multer: PDF, DOC, DOCX สูงสุด 25MB)<br>- เวิร์กโฟลว์การพิจารณาผลงาน (Approve / Return with Feedback Audit Log) | ✅ เสร็จสมบูรณ์ | 100% | กันยายน - ตุลาคม 2569 |
| **Phase 3** | **การพัฒนาระบบหน้าบ้าน (Frontend Client Development)**<br>- พัฒนา Single Page Application (SPA) ด้วย React + Vite + Tailwind CSS<br>- ระบบ Auth Context และ Protected Routing ตามบทบาทผู้ใช้<br>- หน้า Dashboard สรุปภาพรวมสถิติตามเกณฑ์ AUN-QA<br>- หน้า ยื่นส่งผลงานวิชาการ (พร้อม File Drag & Drop)<br>- หน้า รายการผลงานของอาจารย์ (My Works Portfolio)<br>- หน้า ตรวจสอบและพิจารณาผลงาน (Review Console สำหรับหัวหน้าหลักสูตร)<br>- หน้า ค้นหาและสืบค้นผลงานวิชาการ (Academic Archive & Search)<br>- หน้า จัดการผู้ใช้และกำหนดบทบาท (Role Management สำหรับ Admin) | ✅ เสร็จสมบูรณ์ | 100% | ตุลาคม 2569 |
| **Phase 4** | **การรวมระบบและการทดสอบระบบ (Integration & Testing)**<br>- พัฒนาและรันชุดทดสอบอัตโนมัติ `backend/test_api.js`<br>- ทดสอบครอบคลุม Test Cases ตามบทที่ 3 (ตารางที่ 3.9, 3.10, 3.12, 3.13, 3.14, 3.15)<br>- ตรวจสอบความถูกต้องของสิทธิ์การเข้าถึง (Negative Test Cases & Permission Guards)<br>- ทดสอบการรับ-ส่งข้อมูลระหว่าง Frontend และ Backend แบบครบวงจร | ✅ เสร็จสมบูรณ์ | 100% | 7 ตุลาคม 2569 |
| **Phase 5** | **การจัดทำเอกสารและเตรียมนำขึ้นระบบจริง (Documentation & Delivery)**<br>- จัดทำคู่มือ README, สรุปสถาปัตยกรรม และคำอธิบาย API<br>- จัดเตรียม Environment Configuration (.env.example, .gitignore)<br>- อัปเดตและสำรองข้อมูลขึ้น GitHub Repository (7 - 8 ตุลาคม 2569)<br>- พัฒนาระบบ Single Terminal Runner และ Smart Role-based Landing Routing<br>- เพิ่มฟังก์ชันแก้ไขผลงานวิชาการ (Edit Work Modal) สำหรับผลงานที่ถูกส่งกลับ<br>- จัดทำคู่มือการใช้งานสำหรับผู้ใช้แต่ละกลุ่มบทบาท (User Manual)<br>- เตรียมการขึ้นระบบ Production Staging | 🟡 กำลังดำเนินการ | 95% | 7 - 8 ตุลาคม 2569 |

---

## 🛠️ 2. เทคโนโลยีที่ใช้ในโครงการ (Technology Stack)

### **Backend (ระบบบริการฝั่งเซิร์ฟเวอร์)**
- **Runtime Environment:** Node.js
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL (ผ่านไดรเวอร์ `pg` Connection Pool)
- **Authentication & Security:** JSON Web Token (`jsonwebtoken`), Password Hashing (`bcryptjs`), Cross-Origin Resource Sharing (`cors`)
- **File Upload & Validation:** Multer (จำกัดขนาดไฟล์ไม่เกิน 25MB และตรวจสอบ MIME Type / นามสกุลไฟล์)

### **Frontend (ระบบส่วนติดต่อผู้ใช้งาน)**
- **Framework & Build Tool:** React 18, Vite
- **Styling:** Tailwind CSS, PostCSS
- **Icons:** Lucide React
- **HTTP Client:** Axios (พร้อม Interceptor ดักจับ JWT Token และ Handle 401 Auto Logout)
- **Routing:** React Router DOM (พร้อม Protected Route ตามบทบาท RBAC)

---

## 🗄️ 3. โครงสร้างฐานข้อมูล (Database Schema Overview)

ระบบจัดเก็บข้อมูลใน PostgreSQL ประกอบด้วย 8 ตารางหลัก:
1. `departments` - ข้อมูลภาควิชา
2. `curriculums` - ข้อมูลหลักสูตร (วิทยาการคอมพิวเตอร์ CS, เทคโนโลยีสารสนเทศ IT)
3. `roles` - บทบาทผู้ใช้งาน (admin, department_head, curriculum_head, lecturer)
4. `users` - บัญชีผู้ใช้งาน ข้อมูลตำแหน่งทางวิชาการ และรหัสผ่านที่ผ่านการเข้ารหัส
5. `user_roles` - ตารางความสัมพันธ์แบบกลุ่มผู้ใช้กับบทบาท (รองรับผู้ใช้ 1 คนมีหลายบทบาท)
6. `academic_works` - ข้อมูลผลงานวิชาการ (ชื่อผลงาน, ประเภท, บทคัดย่อ, ปีที่เผยแพร่, สถานะ)
7. `file_attachments` - ข้อมูลไฟล์เอกสารแนบของผลงานวิชาการ
8. `work_reviews` - ประวัติการตรวจสอบผลงาน บันทึกความเห็น และ Audit Log การเปลี่ยนสถานะ

---

## 👥 4. บัญชีผู้ใช้สำหรับการทดสอบ (Demo User Accounts)

| ชื่อผู้ใช้ (Username) | รหัสผ่าน (Password) | บทบาทในระบบ (Roles) | ตำแหน่ง / คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `admin` | `password123` | **admin** | ผู้ดูแลระบบ จัดการผู้ใช้และสิทธิ์ |
| `anupong` | `password123` | **department_head, lecturer** | ศ.ดร.อนุพงษ์ (หัวหน้าภาควิชา) |
| `somchai` | `password123` | **curriculum_head, lecturer** | ผศ.ดร.สมชาย (หัวหน้าหลักสูตร วท.บ. CS) |
| `porntip` | `password123` | **curriculum_head, lecturer** | รศ.ดร.พรทิพย์ (หัวหน้าหลักสูตร วท.บ. IT) |
| `thanawat` | `password123` | **lecturer** | อ.ธนวัฒน์ (อาจารย์ประจำหลักสูตร IT) |
| `thammathat` | `password123` | **lecturer** | อ.ธรรมธัช (อาจารย์ประจำหลักสูตร IT) |

---

## 🚀 5. วิธีการติดตั้งและรันระบบ (Setup & Running Guide)

### 1) การตั้งค่าฐานข้อมูล PostgreSQL
1. สร้างฐานข้อมูลชื่อ `acims_db` ใน PostgreSQL
2. รันคำสั่ง SQL เพื่อสร้าง Schema และข้อมูลจำลอง:
```bash
psql -U postgres -d acims_db -f backend/schema.sql
psql -U postgres -d acims_db -f backend/seed.sql
```

### 2) การรันระบบพร้อมกันทั้ง Frontend และ Backend ใน Terminal เดียว (แนะนำ) ⚡
เปิด Terminal ที่โฟลเดอร์หลักของโปรเจกต์ (`ACIMS-Project`) แล้วรันคำสั่ง:
```bash
# ติดตั้ง dependencies (ทำครั้งแรกครั้งเดียว)
npm run install:all

# รันทั้งสองระบบพร้อมกันด้วย Terminal เดียว
npm run dev
```
ระบบจะเปิดทั้ง **Backend (`http://localhost:5000`)** และ **Frontend (`http://localhost:5173`)** พร้อมแยกแท็กสี `[BACKEND]` และ `[FRONTEND]` ให้โดยอัตโนมัติ

---

### 3) การแยกรันทีละระบบ (ทางเลือกเดิม)
**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 4) การรันชุดทดสอบ API อัตโนมัติ (Automated API Test Suite)
```bash
cd backend
node test_api.js
```

---

## 📅 6. ประวัติการปรับปรุง (Changelog)

- **7 ตุลาคม 2569 (07/10/2026):**
  - สรุปความคืบหน้าของโครงการถึง **Phase 4 เสร็จสมบูรณ์ (Integration & Testing Pass 100%)**
  - ดำเนินการงานใน **Phase 5 (Documentation & GitHub Synchronization)**
  - เพิ่มการกำหนดค่าความปลอดภัย `.gitignore` ป้องกันการ Commit ไฟล์สำคัญ (`.env`, `node_modules`)
  - อัปเดตโครงสร้างคู่มือและสถานะขึ้นสู่ GitHub Repository

- **8 ตุลาคม 2569 (08/10/2026 เวลา 13:35 น.):**
  - **Single Terminal Fullstack Runner:** เพิ่มการรันแบบ Concurrently สั่งรันทั้ง Frontend (Vite) และ Backend (Express) พร้อมกันใน Terminal เดียวด้วยคำสั่ง `npm run dev` พร้อมสร้างไฟล์รันอัตโนมัติ `run-all.bat` และแฟลก `-k` ป้องกัน Process ตกค้างใน Windows
  - **Smart Role-Based Landing Routing:** ปรับปรุงระบบนำทางหน้าแรก (`/`) และ Wildcard (`*`) ใน `App.jsx` ให้นำทางเข้าหน้าทำงานหลักตรงตามบทบาทของผู้ใช้โดยอัตโนมัติ (อาจารย์ ➔ My Works, หัวหน้าหลักสูตร ➔ Review Works, หัวหน้าสาขา ➔ Dashboard, Admin ➔ Role Management)
  - **ฟังก์ชันแก้ไขผลงานวิชาการ (Edit Work Modal):** เพิ่มปุ่มและ Modal ฟอร์มแก้ไขข้อมูลผลงานในหน้า `MyWorksPage.jsx` สำหรับผลงานที่ถูกส่งกลับแก้ไข พร้อมรองรับการอัปโหลดไฟล์ฉบับปรับปรุงใหม่ และรีเซ็ตสถานะกลับเป็น "รอพิจารณา" ให้อัตโนมัติ
  - **Network Error Handling ในหน้า Login:** ปรับปรุงข้อความแจ้งเตือนเมื่อเซิร์ฟเวอร์หลังบ้านไม่ได้ทำงานให้ชัดเจน ถูกต้อง ไม่ขึ้นหลอกว่าเป็นรหัสผ่านผิด
  - **Dynamic Year Filter:** ปรับตัวกรองปีการศึกษาในหน้า `SearchPage.jsx` ให้คำนวณและแสดงผลปีตามปีปัจจุบันโดยอัตโนมัติ
  - **การเข้าถึงสถิติแดชบอร์ด:** ปรับปรุงสิทธิ์ใน `stats.routes.js` ให้อาจารย์ประจำหลักสูตรสามารถเปิดดูภาพรวมสถิติ AUN-QA ของภาควิชาได้
  - สำรองและ Sync ซอร์สโค้ดฉบับปรับปรุงล่าสุดขึ้น GitHub Repository