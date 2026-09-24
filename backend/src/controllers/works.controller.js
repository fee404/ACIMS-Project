const db = require('../db');
const path = require('path');
const fs = require('fs');

/**
 * ดึงผลงานของอาจารย์ผู้เข้าสู่ระบบ (My Works)
 * สอดคล้องกับกรณีใช้งาน 3.2, 3.3 และ TC001, TC005, TC007 ในตาราง 3.10
 */
const getMyWorks = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const query = `
      SELECT w.work_id, w.title_th, w.title_en, w.work_type, w.abstract,
             w.publication_year, w.submission_date, w.current_status,
             c.curriculum_name, c.curriculum_code,
             json_agg(
               DISTINCT jsonb_build_object(
                 'file_id', f.file_id,
                 'file_name', f.file_name,
                 'file_path', f.file_path,
                 'file_size_mb', f.file_size_mb,
                 'file_type', f.file_type
               )
             ) FILTER (WHERE f.file_id IS NOT NULL) as files,
             json_agg(
               DISTINCT jsonb_build_object(
                 'review_id', r.review_id,
                 'reviewer_id', r.reviewer_id,
                 'reviewer_name', ru.full_name,
                 'new_status', r.new_status,
                 'comments', r.comments,
                 'reviewed_at', r.reviewed_at
               )
             ) FILTER (WHERE r.review_id IS NOT NULL) as reviews
      FROM academic_works w
      JOIN curriculums c ON w.curriculum_id = c.curriculum_id
      LEFT JOIN file_attachments f ON w.work_id = f.work_id
      LEFT JOIN work_reviews r ON w.work_id = r.work_id
      LEFT JOIN users ru ON r.reviewer_id = ru.user_id
      WHERE w.author_id = $1
      GROUP BY w.work_id, c.curriculum_name, c.curriculum_code
      ORDER BY w.submission_date DESC;
    `;

    const result = await db.query(query, [userId]);
    res.json({
      success: true,
      works: result.rows,
    });
  } catch (error) {
    console.error('getMyWorks error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงรายการผลงาน' });
  }
};

/**
 * ดึงผลงานวิชาการระดับหลักสูตร (สำหรับหัวหน้าหลักสูตรตรวจสอบ)
 * สอดคล้องกับกรณีใช้งาน 3.5, 3.6 และตารางทดสอบ 3.12, 3.13
 */
const getCurriculumWorks = async (req, res) => {
  const { status, curriculum_id } = req.query;

  try {
    let query = `
      SELECT w.work_id, w.title_th, w.title_en, w.work_type, w.abstract,
             w.publication_year, w.submission_date, w.current_status,
             u.user_id as author_id, u.full_name as author_name, u.academic_rank,
             c.curriculum_id, c.curriculum_name, c.curriculum_code,
             json_agg(
               DISTINCT jsonb_build_object(
                 'file_id', f.file_id,
                 'file_name', f.file_name,
                 'file_path', f.file_path,
                 'file_size_mb', f.file_size_mb
               )
             ) FILTER (WHERE f.file_id IS NOT NULL) as files,
             json_agg(
               DISTINCT jsonb_build_object(
                 'review_id', r.review_id,
                 'new_status', r.new_status,
                 'comments', r.comments,
                 'reviewed_at', r.reviewed_at
               )
             ) FILTER (WHERE r.review_id IS NOT NULL) as reviews
      FROM academic_works w
      JOIN users u ON w.author_id = u.user_id
      JOIN curriculums c ON w.curriculum_id = c.curriculum_id
      LEFT JOIN file_attachments f ON w.work_id = f.work_id
      LEFT JOIN work_reviews r ON w.work_id = r.work_id
    `;

    const params = [];
    const whereConditions = [];

    if (status) {
      params.push(status);
      whereConditions.push(`w.current_status = $${params.length}`);
    }

    if (curriculum_id) {
      params.push(curriculum_id);
      whereConditions.push(`w.curriculum_id = $${params.length}`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }

    query += `
      GROUP BY w.work_id, u.user_id, u.full_name, u.academic_rank, c.curriculum_id, c.curriculum_name, c.curriculum_code
      ORDER BY w.submission_date DESC;
    `;

    const result = await db.query(query, params);
    res.json({ success: true, works: result.rows });
  } catch (error) {
    console.error('getCurriculumWorks error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงรายการผลงานของหลักสูตร' });
  }
};

/**
 * ดึงผลงานวิชาการทั้งหมด (สำหรับหัวหน้าสาขา / ผู้ดูแลระบบ / ค้นหาผลงาน)
 * สอดคล้องกับแดชบอร์ดภาพรวมและแบบฟอร์มค้นหา ภาพที่ 3.7 และ 3.10
 */
const getAllWorks = async (req, res) => {
  const { search, year, work_type, status, curriculum_id } = req.query;

  try {
    let query = `
      SELECT w.work_id, w.title_th, w.title_en, w.work_type, w.abstract,
             w.publication_year, w.submission_date, w.current_status,
             u.user_id as author_id, u.full_name as author_name, u.academic_rank,
             c.curriculum_id, c.curriculum_name, c.curriculum_code,
             json_agg(
               DISTINCT jsonb_build_object(
                 'file_id', f.file_id,
                 'file_name', f.file_name,
                 'file_path', f.file_path,
                 'file_size_mb', f.file_size_mb
               )
             ) FILTER (WHERE f.file_id IS NOT NULL) as files
      FROM academic_works w
      JOIN users u ON w.author_id = u.user_id
      JOIN curriculums c ON w.curriculum_id = c.curriculum_id
      LEFT JOIN file_attachments f ON w.work_id = f.work_id
    `;

    const params = [];
    const whereConditions = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      whereConditions.push(`(w.title_th ILIKE $${params.length} OR w.title_en ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
    }

    if (year) {
      params.push(parseInt(year, 10));
      whereConditions.push(`w.publication_year = $${params.length}`);
    }

    if (work_type) {
      params.push(work_type);
      whereConditions.push(`w.work_type = $${params.length}`);
    }

    if (status) {
      params.push(status);
      whereConditions.push(`w.current_status = $${params.length}`);
    }

    if (curriculum_id) {
      params.push(parseInt(curriculum_id, 10));
      whereConditions.push(`w.curriculum_id = $${params.length}`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }

    query += `
      GROUP BY w.work_id, u.user_id, u.full_name, u.academic_rank, c.curriculum_id, c.curriculum_name, c.curriculum_code
      ORDER BY w.submission_date DESC;
    `;

    const result = await db.query(query, params);
    res.json({ success: true, works: result.rows });
  } catch (error) {
    console.error('getAllWorks error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการค้นหาผลงาน' });
  }
};

/**
 * ดึงรายละเอียดผลงานตาม ID
 */
const getWorkById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT w.*, u.full_name as author_name, u.email as author_email, u.academic_rank,
             c.curriculum_name, c.curriculum_code
      FROM academic_works w
      JOIN users u ON w.author_id = u.user_id
      JOIN curriculums c ON w.curriculum_id = c.curriculum_id
      WHERE w.work_id = $1;
    `;
    const workRes = await db.query(query, [id]);

    if (workRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผลงานวิชาการ' });
    }

    const filesRes = await db.query('SELECT * FROM file_attachments WHERE work_id = $1', [id]);
    const reviewsRes = await db.query(
      `SELECT r.*, u.full_name as reviewer_name 
       FROM work_reviews r 
       JOIN users u ON r.reviewer_id = u.user_id 
       WHERE r.work_id = $1 
       ORDER BY r.reviewed_at DESC`,
      [id]
    );

    res.json({
      success: true,
      work: {
        ...workRes.rows[0],
        files: filesRes.rows,
        reviews: reviewsRes.rows,
      },
    });
  } catch (error) {
    console.error('getWorkById error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผลงาน' });
  }
};

/**
 * เพิ่มผลงานวิชาการใหม่ (TC001, TC006 ในตาราง 3.9)
 */
const createWork = async (req, res) => {
  const { title_th, title_en, work_type, abstract, publication_year, curriculum_id } = req.body;
  const authorId = req.user.user_id;

  // ตรวจสอบความครบถ้วน (TC006)
  if (!title_th || !work_type || !publication_year || !curriculum_id) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อผลงาน, ประเภทผลงาน, ปีการศึกษา และหลักสูตร)',
    });
  }

  try {
    const insertQuery = `
      INSERT INTO academic_works (title_th, title_en, work_type, abstract, publication_year, current_status, author_id, curriculum_id)
      VALUES ($1, $2, $3, $4, $5, 'รอพิจารณา', $6, $7)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [
      title_th.trim(),
      title_en ? title_en.trim() : null,
      work_type,
      abstract || '',
      parseInt(publication_year, 10),
      authorId,
      parseInt(curriculum_id, 10),
    ]);

    const createdWork = result.rows[0];

    // หากมีการแนบไฟล์
    if (req.file) {
      const fileSizeMb = (req.file.size / (1024 * 1024)).toFixed(2);
      const relativePath = 'uploads/' + req.file.filename;

      const fileInsert = `
        INSERT INTO file_attachments (work_id, file_name, file_path, file_type, file_size_mb)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      await db.query(fileInsert, [
        createdWork.work_id,
        req.file.originalname,
        relativePath,
        req.file.mimetype,
        parseFloat(fileSizeMb),
      ]);
    }

    res.status(201).json({
      success: true,
      message: 'บันทึกข้อมูลผลงานวิชาการเรียบร้อยแล้ว',
      work: createdWork,
    });
  } catch (error) {
    console.error('createWork error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล ไม่สามารถบันทึกได้' });
  }
};

/**
 * แก้ไขผลงานวิชาการ (TC002, TC010 ในตาราง 3.9)
 */
const updateWork = async (req, res) => {
  const { id } = req.params;
  const { title_th, title_en, work_type, abstract, publication_year, curriculum_id } = req.body;
  const userId = req.user.user_id;

  try {
    const workCheck = await db.query('SELECT * FROM academic_works WHERE work_id = $1', [id]);
    if (workCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผลงานที่ต้องการแก้ไข' });
    }

    const currentWork = workCheck.rows[0];

    // ตรวจสอบสิทธิ์ความเป็นเจ้าของผลงาน
    if (currentWork.author_id !== userId && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์แก้ไขผลงานของผู้อื่น' });
    }

    // ล็อกการแก้ไขหากผลงานผ่านการอนุมัติแล้ว (TC008 ในตาราง 3.13)
    if (currentWork.current_status === 'อนุมัติแล้ว' && !req.user.roles.includes('admin')) {
      return res.status(400).json({
        success: false,
        message: 'ผลงานนี้ได้รับการอนุมัติแล้ว ไม่สามารถแก้ไขได้',
      });
    }

    // หากมีการแก้ไขหลังจากถูกส่งกลับ ให้รีเซ็ตสถานะกลับเป็น "รอพิจารณา"
    const newStatus = currentWork.current_status === 'ส่งกลับเพื่อแก้ไข' ? 'รอพิจารณา' : currentWork.current_status;

    const updateQuery = `
      UPDATE academic_works
      SET title_th = COALESCE($1, title_th),
          title_en = COALESCE($2, title_en),
          work_type = COALESCE($3, work_type),
          abstract = COALESCE($4, abstract),
          publication_year = COALESCE($5, publication_year),
          curriculum_id = COALESCE($6, curriculum_id),
          current_status = $7
      WHERE work_id = $8
      RETURNING *;
    `;
    const updatedResult = await db.query(updateQuery, [
      title_th,
      title_en,
      work_type,
      abstract,
      publication_year ? parseInt(publication_year, 10) : undefined,
      curriculum_id ? parseInt(curriculum_id, 10) : undefined,
      newStatus,
      id,
    ]);

    // หากมีการอัปโหลดไฟล์ใหม่แทนที่
    if (req.file) {
      const fileSizeMb = (req.file.size / (1024 * 1024)).toFixed(2);
      const relativePath = 'uploads/' + req.file.filename;

      await db.query(
        `INSERT INTO file_attachments (work_id, file_name, file_path, file_type, file_size_mb)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, req.file.originalname, relativePath, req.file.mimetype, parseFloat(fileSizeMb)]
      );
    }

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลผลงานวิชาการเรียบร้อยแล้ว',
      work: updatedResult.rows[0],
    });
  } catch (error) {
    console.error('updateWork error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขผลงาน' });
  }
};

/**
 * ลบผลงานวิชาการ (TC003 ในตาราง 3.9)
 */
const deleteWork = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const workCheck = await db.query('SELECT * FROM academic_works WHERE work_id = $1', [id]);
    if (workCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผลงานที่ต้องการลบ' });
    }

    const currentWork = workCheck.rows[0];

    // ตรวจสอบสิทธิ์เจ้าของ
    if (currentWork.author_id !== userId && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์ลบผลงานของผู้อื่น' });
    }

    await db.query('DELETE FROM academic_works WHERE work_id = $1', [id]);

    res.json({
      success: true,
      message: 'ลบรายการผลงานเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('deleteWork error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบผลงาน' });
  }
};

/**
 * อนุมัติหรือส่งกลับผลงานวิชาการ (Approve or Return Work)
 * สอดคล้องกับตารางที่ 3.6 และกรณีทดสอบตารางที่ 3.13 (TC001 - TC010)
 */
const reviewWork = async (req, res) => {
  const { id } = req.params;
  const { action, comments } = req.body;
  const reviewerId = req.user.user_id;

  // ตรวจสอบการเลือกสถานะ (TC003 ในตาราง 3.13: ไม่เลือกสถานะแล้วกดบันทึก)
  if (!action || !['approve', 'return', 'อนุมัติ', 'ส่งกลับ'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาเลือกผลการพิจารณา (อนุมัติ หรือ ส่งกลับ)',
    });
  }

  const isApproved = action === 'approve' || action === 'อนุมัติ';
  const targetStatus = isApproved ? 'อนุมัติแล้ว' : 'ส่งกลับเพื่อแก้ไข';

  // หากส่งกลับแต่ไม่กรอกเหตุผล (TC004 ในตาราง 3.13)
  if (!isApproved && (!comments || comments.trim() === '')) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุเหตุผลในการส่งกลับผลงาน เพื่อให้อาจารย์นำไปปรับปรุงแก้ไข',
    });
  }

  try {
    const workRes = await db.query('SELECT current_status FROM academic_works WHERE work_id = $1', [id]);
    if (workRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผลงานที่ต้องการพิจารณา' });
    }

    const previousStatus = workRes.rows[0].current_status;

    // อัปเดตสถานะในตาราง academic_works
    await db.query('UPDATE academic_works SET current_status = $1 WHERE work_id = $2', [targetStatus, id]);

    // บันทึกประวัติการพิจารณาใน work_reviews (TC005)
    await db.query(
      `INSERT INTO work_reviews (work_id, reviewer_id, previous_status, new_status, comments)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, reviewerId, previousStatus, targetStatus, comments || null]
    );

    res.json({
      success: true,
      message: isApproved ? 'อนุมัติผลงานวิชาการเรียบร้อยแล้ว' : 'ส่งกลับผลงานเพื่อแก้ไขเรียบร้อยแล้ว',
      status: targetStatus,
    });
  } catch (error) {
    console.error('reviewWork error:', error);
    res.status(500).json({ success: false, message: 'ไม่สามารถบันทึกผลได้ กรุณาลองใหม่' });
  }
};

/**
 * ดึงรายการหลักสูตรทั้งหมดในสาขาวิชา (สำหรับแสดงใน Dropdown)
 */
const getCurriculums = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM curriculums ORDER BY curriculum_id ASC');
    res.json({ success: true, curriculums: result.rows });
  } catch (error) {
    console.error('getCurriculums error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร' });
  }
};

module.exports = {
  getMyWorks,
  getCurriculumWorks,
  getAllWorks,
  getWorkById,
  createWork,
  updateWork,
  deleteWork,
  reviewWork,
  getCurriculums,
};
