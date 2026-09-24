const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

/**
 * เข้าสู่ระบบ (Login)
 */
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน',
    });
  }

  try {
    const userQuery = `
      SELECT u.user_id, u.username, u.password_hash, u.full_name, u.email, u.academic_rank,
             u.department_id, d.department_name,
             COALESCE(ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), '{}') as roles
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE u.username = $1 OR u.email = $1
      GROUP BY u.user_id, d.department_name;
    `;

    const result = await db.query(userQuery, [username.trim()]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
      });
    }

    const user = result.rows[0];

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
      });
    }

    // สร้าง JWT Token
    const payload = {
      userId: user.user_id,
      username: user.username,
      roles: user.roles,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'acims_secret_jwt_key_2026_super_secure',
      { expiresIn: '7d' }
    );

    // ตัด password_hash ออกก่อนส่งกลับ
    delete user.password_hash;

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง',
    });
  }
};

/**
 * ดึงข้อมูลผู้ใช้งานปัจจุบัน (Get current logged in user profile)
 */
const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

/**
 * เปลี่ยนรหัสผ่าน (Change password)
 */
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.user_id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่',
    });
  }

  try {
    const userRes = await db.query('SELECT password_hash FROM users WHERE user_id = $1', [userId]);
    const isMatch = await bcrypt.compare(oldPassword, userRes.rows[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านเดิมไม่ถูกต้อง',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [newHash, userId]);

    res.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
    });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
};
