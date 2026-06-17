CREATE DATABASE IF NOT EXISTS request_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON request_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
