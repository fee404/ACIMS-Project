const db = require('../db');

/**
 * ดึงสถิติภาพรวมระดับสาขาวิชา (สำหรับหัวหน้าสาขา - แดชบอร์ดภาพที่ 3.10)
 */
const getDepartmentStats = async (req, res) => {
  try {
    // 1. ตัวเลขนับรวมตามสถานะ (Summary Cards)
    const countsQuery = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN current_status = 'รอพิจารณา' THEN 1 END)::int as pending,
        COUNT(CASE WHEN current_status = 'อนุมัติแล้ว' THEN 1 END)::int as approved,
        COUNT(CASE WHEN current_status = 'ส่งกลับเพื่อแก้ไข' THEN 1 END)::int as returned
      FROM academic_works;
    `;
    const countsRes = await db.query(countsQuery);

    // 2. แยกตามประเภทผลงานวิชาการ (Work Types)
    const typesQuery = `
      SELECT work_type, COUNT(*)::int as count
      FROM academic_works
      GROUP BY work_type
      ORDER BY count DESC;
    `;
    const typesRes = await db.query(typesQuery);

    // 3. แยกตามหลักสูตร (Curriculums)
    const curriculumsQuery = `
      SELECT c.curriculum_name, c.curriculum_code, COUNT(w.work_id)::int as count
      FROM curriculums c
      LEFT JOIN academic_works w ON c.curriculum_id = w.curriculum_id
      GROUP BY c.curriculum_id, c.curriculum_name, c.curriculum_code
      ORDER BY c.curriculum_id ASC;
    `;
    const curriculumsRes = await db.query(curriculumsQuery);

    // 4. แยกตามปีการศึกษา (Years)
    const yearsQuery = `
      SELECT publication_year as year, COUNT(*)::int as count
      FROM academic_works
      GROUP BY publication_year
      ORDER BY publication_year DESC;
    `;
    const yearsRes = await db.query(yearsQuery);

    // 5. รายการผลงานล่าสุด 5 รายการ
    const recentQuery = `
      SELECT w.work_id, w.title_th, w.work_type, w.current_status, w.submission_date,
             u.full_name as author_name, c.curriculum_code
      FROM academic_works w
      JOIN users u ON w.author_id = u.user_id
      JOIN curriculums c ON w.curriculum_id = c.curriculum_id
      ORDER BY w.submission_date DESC
      LIMIT 5;
    `;
    const recentRes = await db.query(recentQuery);

    res.json({
      success: true,
      summary: countsRes.rows[0],
      byType: typesRes.rows,
      byCurriculum: curriculumsRes.rows,
      byYear: yearsRes.rows,
      recentWorks: recentRes.rows,
    });
  } catch (error) {
    console.error('getDepartmentStats error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติสาขาวิชา' });
  }
};

/**
 * ดึงสถิติส่วนบุคคลของอาจารย์ผู้ใช้งาน (My Stats)
 */
const getMyStats = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const query = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN current_status = 'รอพิจารณา' THEN 1 END)::int as pending,
        COUNT(CASE WHEN current_status = 'อนุมัติแล้ว' THEN 1 END)::int as approved,
        COUNT(CASE WHEN current_status = 'ส่งกลับเพื่อแก้ไข' THEN 1 END)::int as returned
      FROM academic_works
      WHERE author_id = $1;
    `;
    const result = await db.query(query, [userId]);

    res.json({
      success: true,
      summary: result.rows[0],
    });
  } catch (error) {
    console.error('getMyStats error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติของตนเอง' });
  }
};

module.exports = {
  getDepartmentStats,
  getMyStats,
};
