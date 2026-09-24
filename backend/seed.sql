-- Seed data for ACIMS
-- 1. Insert Department
INSERT INTO departments (department_name) VALUES 
('ภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์');

-- 2. Insert Curriculums
INSERT INTO curriculums (curriculum_code, curriculum_name, department_id) VALUES 
('CS', 'หลักสูตรวิทยาการคอมพิวเตอร์', 1),
('IT', 'หลักสูตรเทคโนโลยีสารสนเทศ', 1);

-- 3. Insert Roles
INSERT INTO roles (role_id, role_name, description) VALUES 
(1, 'admin', 'ผู้ดูแลระบบ มีสิทธิ์จัดการบัญชีและปรับบทบาทผู้ใช้'),
(2, 'department_head', 'หัวหน้าสาขาวิชา ดูภาพรวมและสถิติระดับสาขา'),
(3, 'curriculum_head', 'หัวหน้าหลักสูตร ตรวจสอบ อนุมัติ และส่งกลับผลงานในหลักสูตร'),
(4, 'lecturer', 'อาจารย์ประจำหลักสูตร ส่งและจัดการผลงานวิชาการของตนเอง');

-- 4. Insert Users (Password: password123)
-- Hash: $2b$10$nwB7d7lUMgvPFiwVsM9Ns.YZJHq1ZDH43WTwsR9puayCwe5wsgC9y
INSERT INTO users (username, password_hash, full_name, email, academic_rank, department_id) VALUES 
('admin', '$2b$10$nwB7d7lUMgvPFiwVsM9Ns.YZJHq1ZDH43WTwsR9puayCwe5wsgC9y', 'ผู้ดูแลระบบ สารสนเทศ', 'admin@rmutk.ac.th', 'เจ้าหน้าที่', 1),
('anupong', '$2b$10$nwB7d7lUMgvPFiwVsM9Ns.YZJHq1ZDH43WTwsR9puayCwe5wsgC9y', 'ศ.ดร.อนุพงษ์ เกียรติสกุล', 'anupong@rmutk.ac.th', 'ศาสตราจารย์ ดร.', 1),
('somchai', '$2b$10$nwB7d7lUMgvPFiwVsM9Ns.YZJHq1ZDH43WTwsR9puayCwe5wsgC9y', 'ผศ.ดร.สมชาย แสงดี', 'somchai@rmutk.ac.th', 'ผู้ช่วยศาสตราจารย์ ดร.', 1),
('porntip', '$2b$10$nwB7d7lUMgvPFiwVsM9Ns.YZJHq1ZDH43WTwsR9puayCwe5wsgC9y', 'รศ.ดร.พรทิพย์ วิจิตร', 'porntip@rmutk.ac.th', 'รองศาสตราจารย์ ดร.', 1),
('thanawat', '$2b$10$nwB7d7lUMgvPFiwVsM9Ns.YZJHq1ZDH43WTwsR9puayCwe5wsgC9y', 'อาจารย์ธนวัฒน์ แสงชมภู', 'thanawat@rmutk.ac.th', 'อาจารย์', 1),
('thammathat', '$2b$10$nwB7d7lUMgvPFiwVsM9Ns.YZJHq1ZDH43WTwsR9puayCwe5wsgC9y', 'อาจารย์ธรรมธัช ชัยชวลิต', 'thammathat@rmutk.ac.th', 'อาจารย์', 1);

-- 5. Assign Roles (user_roles)
-- admin -> admin (1)
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- anupong -> department_head (2), lecturer (4)
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2), (2, 4);

-- somchai -> curriculum_head (3), lecturer (4) (Head of CS)
INSERT INTO user_roles (user_id, role_id) VALUES (3, 3), (3, 4);

-- porntip -> curriculum_head (3), lecturer (4) (Head of IT)
INSERT INTO user_roles (user_id, role_id) VALUES (4, 3), (4, 4);

-- thanawat -> lecturer (4)
INSERT INTO user_roles (user_id, role_id) VALUES (5, 4);

-- thammathat -> lecturer (4)
INSERT INTO user_roles (user_id, role_id) VALUES (6, 4);

-- 6. Insert Sample Academic Works
INSERT INTO academic_works (work_id, title_th, title_en, work_type, abstract, publication_year, current_status, author_id, curriculum_id) VALUES 
(1, 'ระบบสารสนเทศเพื่อการศึกษา', 'Information System for Education', 'ตำรา/หนังสือ', 'การนำเทคโนโลยีสารสนเทศมาใช้ในกระบวนการจัดการเรียนการสอนระดับอุดมศึกษา', 2567, 'อนุมัติแล้ว', 5, 2),
(2, 'การจัดการเรียนการสอนแบบออนไลน์', 'Online Teaching and Learning Management', 'บทความวิจัย', 'การศึกษาเปรียบเทียบประสิทธิผลของการจัดการเรียนรู้ผ่านระบบออนไลน์และในชั้นเรียนปกติ', 2567, 'รอพิจารณา', 3, 1),
(3, 'แนวทางการเรียนรู้ด้วยตนเอง', 'Self-directed Learning Approaches', 'บทความวิชาการ', 'การส่งเสริมทักษะการเรียนรู้ด้วยตนเองในศตวรรษที่ 21 สำหรับนักศึกษาเทคโนโลยีสารสนเทศ', 2566, 'ส่งกลับเพื่อแก้ไข', 6, 2),
(4, 'ตำราคณิตศาสตร์ขั้นสูง', 'Advanced Mathematics for Computer Science', 'ตำรา/หนังสือ', 'ตำราประกอบการสอนรายวิชาคณิตศาสตร์สำหรับวิทยาการคอมพิวเตอร์', 2567, 'รอพิจารณา', 4, 1),
(5, 'พื้นฐานของวิทยาการคอมพิวเตอร์', 'Fundamentals of Computer Science', 'ตำรา/หนังสือ', 'การวิเคราะห์โครงสร้างข้อมูลและขั้นตอนวิธีเบื้องต้น', 2566, 'ส่งกลับเพื่อแก้ไข', 3, 1);

-- Sync serial sequence for academic_works
SELECT setval('academic_works_work_id_seq', (SELECT MAX(work_id) FROM academic_works));

-- 7. Insert File Attachments
INSERT INTO file_attachments (work_id, file_name, file_path, file_type, file_size_mb) VALUES 
(1, 'academic_work_01.pdf', 'uploads/sample_01.pdf', 'application/pdf', 2.45),
(2, 'online_learning_research.pdf', 'uploads/sample_02.pdf', 'application/pdf', 1.80),
(3, 'self_directed_learning.pdf', 'uploads/sample_03.pdf', 'application/pdf', 0.95),
(4, 'advanced_math.pdf', 'uploads/sample_04.pdf', 'application/pdf', 5.20),
(5, 'cs_fundamentals.pdf', 'uploads/sample_05.pdf', 'application/pdf', 3.10);

-- 8. Insert Sample Reviews
INSERT INTO work_reviews (work_id, reviewer_id, previous_status, new_status, comments) VALUES 
(1, 4, 'รอพิจารณา', 'อนุมัติแล้ว', 'เอกสารครบถ้วนสมบูรณ์ มีหนังสือตอบรับการตีพิมพ์ถูกต้อง'),
(3, 4, 'รอพิจารณา', 'ส่งกลับเพื่อแก้ไข', 'กรุณาแนบเอกสารหนังสือรับรองการเผยแพร่เพิ่มเติม และแก้ไขเลขหน้าในบทคัดย่อ'),
(5, 3, 'รอพิจารณา', 'ส่งกลับเพื่อแก้ไข', 'เนื้อหาในบทที่ 3 ขาดแผนภาพประกอบ และแบบฟอร์มการประเมินยังไม่ครบถ้วน');
