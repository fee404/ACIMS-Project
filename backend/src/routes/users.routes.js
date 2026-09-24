const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// ทุกเส้นทางในส่วนนี้ต้องเข้าสู่ระบบและมีสิทธิ์เป็น admin
router.use(authenticateToken);

// ดึงบทบาททั้งหมด (สามารถให้ role อื่นดูเพื่อการตั้งค่าได้)
router.get('/roles', usersController.getAllRoles);

// เส้นทางจัดการผู้ใช้เฉพาะ Admin
router.get('/', authorizeRoles('admin'), usersController.getAllUsers);
router.post('/', authorizeRoles('admin'), usersController.createUser);
router.put('/:id', authorizeRoles('admin'), usersController.updateUser);
router.put('/:id/roles', authorizeRoles('admin'), usersController.updateUserRoles);
router.delete('/:id', authorizeRoles('admin'), usersController.deleteUser);

module.exports = router;
