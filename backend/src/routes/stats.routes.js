const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// สถิติส่วนตัวของอาจารย์
router.get('/my', statsController.getMyStats);

// สถิติภาพรวมสาขา (สำหรับอาจารย์, หัวหน้าสาขา, หัวหน้าหลักสูตร, แอดมิน)
router.get(
  '/department',
  authorizeRoles('department_head', 'curriculum_head', 'admin', 'lecturer'),
  statsController.getDepartmentStats
);

module.exports = router;
