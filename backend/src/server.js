const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const worksRoutes = require('./routes/works.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static route สำหรับไฟล์เอกสารที่อัปโหลด
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Academic Work Management System (ACIMS) API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/stats', statsRoutes);

// Central Error Handler (รวมถึง Multer Error)
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);

  // ตรวจสอบข้อผิดพลาดจากการอัปโหลดไฟล์
  if (err.message && err.message.includes('ระบบรองรับเฉพาะไฟล์เอกสารประเภท')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'ขนาดไฟล์เกินขีดจำกัดที่ระบบอนุญาต (ไม่เกิน 25MB)',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`ACIMS Backend Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});
