CREATE DATABASE IF NOT EXISTS auth_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON auth_db.* TO 'root'@'%';
FLUSH PRIVILEGES;

USE auth_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial users (passwords are BCrypt encoded for 'password')
-- Admin: admin / password
-- Student: student / password
INSERT INTO users (username, email, password, role, created_at, updated_at) 
VALUES 
('admin', 'admin@college.edu', '$2a$10$tZ2cK.2w8.i.iR2n/9cEseX0DtbC1M8dK6L0/8Gv3o02r7YEq8k8G', 'ADMIN', NOW(6), NOW(6)),
('student', 'student@college.edu', '$2a$10$tZ2cK.2w8.i.iR2n/9cEseX0DtbC1M8dK6L0/8Gv3o02r7YEq8k8G', 'STUDENT', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE username=username;
