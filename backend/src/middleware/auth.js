const jwt = require('jsonwebtoken');
const db = require('../db');

/**
 * Middleware ตรวจสอบ JWT Token และดึงข้อมูลสิทธิ์ผู้ใช้งาน
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบโทเค็น กรุณาเข้าสู่ระบบก่อนใช้งาน',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'acims_secret_jwt_key_2026_super_secure');

    // ดึงข้อมูลผู้ใช้งานและบทบาทปัจจุบันจากฐานข้อมูล
    const userQuery = `
      SELECT u.user_id, u.username, u.full_name, u.email, u.academic_rank, u.department_id,
             d.department_name,
             COALESCE(ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), '{}') as roles
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, d.department_name;
    `;
    const result = await db.query(userQuery, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบบัญชีผู้ใช้งานในระบบ หรือบัญชีถูกปิดการใช้งาน',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'โทเค็นหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
    });
  }
};

/**
 * Middleware ตรวจสอบสิทธิ์การเข้าถึงตามบทบาท (Role-based access control)
 * @param {string[]} allowedRoles - บทบาทที่อนุญาตให้เข้าถึง เช่น ['admin', 'curriculum_head']
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
    }

    const userRoles = req.user.roles || [];
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันหรือข้อมูลในส่วนนี้',
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
