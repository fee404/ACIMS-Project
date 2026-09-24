const bcrypt = require('bcryptjs');
const db = require('../db');

/**
 * ดึงรายชื่อผู้ใช้งานทั้งหมด พร้อมบทบาทที่ได้รับมอบหมาย
 */
const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.user_id, u.username, u.full_name, u.email, u.academic_rank,
             u.department_id, d.department_name, u.created_at,
             COALESCE(ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), '{}') as roles,
             COALESCE(ARRAY_AGG(r.role_id) FILTER (WHERE r.role_id IS NOT NULL), '{}') as role_ids
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      GROUP BY u.user_id, d.department_name
      ORDER BY u.user_id ASC;
    `;
    const result = await db.query(query);
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
};

/**
 * เพิ่มผู้ใช้งานใหม่ (TC001, TC004, TC005 ในตาราง 3.14)
 */
const createUser = async (req, res) => {
  const { username, password, full_name, email, academic_rank, department_id, role_ids } = req.body;

  // ตรวจสอบความครบถ้วนของข้อมูล (TC004)
  if (!username || !password || !full_name || !email) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อผู้ใช้, รหัสผ่าน, ชื่อ-นามสกุล, อีเมล)',
    });
  }

  try {
    // ตรวจสอบชื่อผู้ใช้หรืออีเมลซ้ำ (TC005)
    const checkUser = await db.query(
      'SELECT user_id, username, email FROM users WHERE username = $1 OR email = $2',
      [username.trim(), email.trim()]
    );

    if (checkUser.rows.length > 0) {
      const existing = checkUser.rows[0];
      const field = existing.username === username.trim() ? 'ชื่อผู้ใช้นี้' : 'อีเมลนี้';
      return res.status(400).json({
        success: false,
        message: `${field}มีอยู่ในระบบแล้ว กรุณาใช้ข้อมูลอื่น`,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // บันทึกผู้ใช้งาน
    const insertUserQuery = `
      INSERT INTO users (username, password_hash, full_name, email, academic_rank, department_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, username, full_name, email, academic_rank, department_id;
    `;
    const newUserRes = await db.query(insertUserQuery, [
      username.trim(),
      password_hash,
      full_name.trim(),
      email.trim(),
      academic_rank || 'อาจารย์',
      department_id || 1,
    ]);

    const newUserId = newUserRes.rows[0].user_id;

    // มอบหมายบทบาทเริ่มต้น (หากไม่ระบุ ให้เป็น lecturer: role_id = 4)
    const targetRoles = Array.isArray(role_ids) && role_ids.length > 0 ? role_ids : [4];
    for (const rId of targetRoles) {
      await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [newUserId, rId]);
    }

    res.status(201).json({
      success: true,
      message: 'สร้างบัญชีผู้ใช้งานสำเร็จเรียบร้อยแล้ว',
      user: newUserRes.rows[0],
    });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้' });
  }
};

/**
 * แก้ไขข้อมูลผู้ใช้ (TC002 ตาราง 3.14)
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, academic_rank, department_id } = req.body;

  try {
    const updateQuery = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          email = COALESCE($2, email),
          academic_rank = COALESCE($3, academic_rank),
          department_id = COALESCE($4, department_id)
      WHERE user_id = $5
      RETURNING user_id, username, full_name, email, academic_rank;
    `;
    const result = await db.query(updateQuery, [full_name, email, academic_rank, department_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานที่ต้องการแก้ไข' });
    }

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้' });
  }
};

/**
 * ปรับบทบาทผู้ใช้งานในระบบ (Change User Role) (ตาราง 3.8 และตาราง 3.15 TC001-TC004)
 */
const updateUserRoles = async (req, res) => {
  const { id } = req.params;
  const { role_ids } = req.body;

  // ตรวจสอบว่าเลือกบทบาทหรือไม่ (TC003 ในตาราง 3.15)
  if (!Array.isArray(role_ids) || role_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาเลือกบทบาทใหม่อย่างน้อย 1 บทบาทก่อนดำเนินการ',
    });
  }

  try {
    // ป้องกันแอดมินปลดสิทธิ์ตนเองโดยไม่ตั้งใจ (ข้อยกเว้นตาราง 3.8)
    if (parseInt(id, 10) === req.user.user_id && !role_ids.includes(1)) {
      return res.status(400).json({
        success: false,
        message: 'ไม่อนุญาตให้ผู้ดูแลระบบปลดบทบาท Admin ของตนเองเพื่อความปลอดภัย',
      });
    }

    // ลบบทบาทเดิมและใส่บทบาทใหม่
    await db.query('DELETE FROM user_roles WHERE user_id = $1', [id]);

    for (const rId of role_ids) {
      await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [id, rId]);
    }

    // ดึงบทบาทใหม่ที่อัปเดตแล้ว
    const roleQuery = `
      SELECT r.role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = $1;
    `;
    const updatedRoles = await db.query(roleQuery, [id]);

    res.json({
      success: true,
      message: 'ปรับเปลี่ยนบทบาทผู้ใช้งานสำเร็จเรียบร้อยแล้ว',
      roles: updatedRoles.rows.map((r) => r.role_name),
    });
  } catch (error) {
    console.error('updateUserRoles error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการปรับเปลี่ยนบทบาทผู้ใช้' });
  }
};

/**
 * ลบบัญชีผู้ใช้งาน (TC003, TC006 ในตาราง 3.14)
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const userCheck = await db.query('SELECT user_id, username FROM users WHERE user_id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้งานที่ต้องการลบ' });
    }

    // ป้องกันการลบบัญชีแอดมินหลัก (TC006)
    if (userCheck.rows[0].username === 'admin' || parseInt(id, 10) === 1) {
      return res.status(403).json({
        success: false,
        message: 'ระบบป้องกันไม่อนุญาตให้ลบบัญชีผู้ดูแลระบบหลัก (Master Admin)',
      });
    }

    await db.query('DELETE FROM users WHERE user_id = $1', [id]);

    res.json({
      success: true,
      message: 'ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้งาน' });
  }
};

/**
 * ดึงรายการบทบาททั้งหมดในระบบ
 */
const getAllRoles = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM roles ORDER BY role_id ASC');
    res.json({ success: true, roles: result.rows });
  } catch (error) {
    console.error('getAllRoles error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบทบาท' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRoles,
  deleteUser,
  getAllRoles,
};
