CREATE DATABASE IF NOT EXISTS request_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON request_db.* TO 'root'@'%';
FLUSH PRIVILEGES;

USE request_db;

CREATE TABLE IF NOT EXISTS stationery_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(255) NOT NULL UNIQUE,
    student_username VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    rejection_reason VARCHAR(255) DEFAULT NULL,
    admin_username VARCHAR(255) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS request_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    request_id BIGINT NOT NULL,
    CONSTRAINT fk_request FOREIGN KEY (request_id) REFERENCES stationery_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
