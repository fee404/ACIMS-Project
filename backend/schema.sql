-- Schema definition for Academic Work Management System (acims_db)
-- Drop tables if they exist in reverse dependency order
DROP TABLE IF EXISTS work_reviews CASCADE;
DROP TABLE IF EXISTS file_attachments CASCADE;
DROP TABLE IF EXISTS academic_works CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS curriculums CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 1. Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL
);

-- 2. Curriculums table
CREATE TABLE curriculums (
    curriculum_id SERIAL PRIMARY KEY,
    curriculum_code VARCHAR(50) NOT NULL,
    curriculum_name VARCHAR(255) NOT NULL,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE CASCADE
);

-- 3. Roles table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- 4. Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    academic_rank VARCHAR(100) DEFAULT 'อาจารย์',
    department_id INT REFERENCES departments(department_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Roles (Many-to-Many relation)
CREATE TABLE user_roles (
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 6. Academic Works table
CREATE TABLE academic_works (
    work_id SERIAL PRIMARY KEY,
    title_th VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    work_type VARCHAR(100) NOT NULL, -- เช่น 'บทความวิจัย', 'บทความวิชาการ', 'ตำรา/หนังสือ', 'รายงานวิจัย'
    abstract TEXT,
    publication_year INT NOT NULL,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_status VARCHAR(50) DEFAULT 'รอพิจารณา', -- 'รอพิจารณา', 'อนุมัติแล้ว', 'ส่งกลับเพื่อแก้ไข'
    author_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    curriculum_id INT NOT NULL REFERENCES curriculums(curriculum_id) ON DELETE CASCADE
);

-- 7. File Attachments table
CREATE TABLE file_attachments (
    file_id SERIAL PRIMARY KEY,
    work_id INT NOT NULL REFERENCES academic_works(work_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size_mb NUMERIC(8, 2),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Work Reviews / Audit Logs table
CREATE TABLE work_reviews (
    review_id SERIAL PRIMARY KEY,
    work_id INT NOT NULL REFERENCES academic_works(work_id) ON DELETE CASCADE,
    reviewer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    comments TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
