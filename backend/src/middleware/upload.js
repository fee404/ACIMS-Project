const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ตรวจสอบและสร้างโฟลเดอร์ uploads หากยังไม่มี
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ป้องกันชื่อไฟล์ภาษาไทยเพี้ยนและชื่อไฟล์ซ้ำ
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\u0E00-\u0E7F]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// กรองประเภทไฟล์ที่อนุญาต (รองรับเฉพาะ PDF, DOC, DOCX)
// สอดคล้องกับ TC007 ในตารางที่ 3.9: ปฏิเสธไฟล์ .exe หรือไฟล์อันตราย
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('ระบบรองรับเฉพาะไฟล์เอกสารประเภท .pdf, .doc, .docx เท่านั้น'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // จำกัดขนาด 25MB
  },
});

module.exports = upload;
