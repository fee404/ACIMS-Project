const express = require('express');
const router = express.Router();
const worksController = require('../controllers/works.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ดึงรายชื่อหลักสูตร (เปิดให้ใช้งานฟอร์ม)
router.get('/curriculums', worksController.getCurriculums);

// เส้นทางสำหรับอาจารย์ดูผลงานตนเอง
router.get('/my-works', authenticateToken, worksController.getMyWorks);

// เส้นทางสำหรับหัวหน้าหลักสูตรดูผลงานรอตรวจสอบ
router.get(
  '/curriculum-works',
  authenticateToken,
  authorizeRoles('curriculum_head', 'department_head', 'admin'),
  worksController.getCurriculumWorks
);

// เส้นทางสำหรับหัวหน้าสาขา / แอดมิน / ค้นหาผลงานทั้งหมด
router.get('/all', authenticateToken, worksController.getAllWorks);

// ดูรายละเอียดผลงานตาม ID
router.get('/:id', authenticateToken, worksController.getWorkById);

// เพิ่มผลงานใหม่ (รองรับการแนบไฟล์ PDF ผ่าน Multer)
router.post('/', authenticateToken, upload.single('file'), worksController.createWork);

// แก้ไขผลงาน
router.put('/:id', authenticateToken, upload.single('file'), worksController.updateWork);

// ลบผลงาน
router.delete('/:id', authenticateToken, worksController.deleteWork);

// อนุมัติหรือส่งกลับผลงาน (เฉพาะหัวหน้าหลักสูตร หรือ Admin)
router.post(
  '/:id/review',
  authenticateToken,
  authorizeRoles('curriculum_head', 'admin'),
  worksController.reviewWork
);

module.exports = router;
