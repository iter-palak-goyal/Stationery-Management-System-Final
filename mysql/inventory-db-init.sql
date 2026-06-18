CREATE DATABASE IF NOT EXISTS inventory_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON inventory_db.* TO 'root'@'%';
FLUSH PRIVILEGES;

USE inventory_db;

CREATE TABLE IF NOT EXISTS stationery_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    available_quantity INT NOT NULL,
    minimum_quantity INT NOT NULL,
    description TEXT DEFAULT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial sample items for testing
INSERT INTO stationery_items (name, category, unit, available_quantity, minimum_quantity, description, created_at, updated_at)
VALUES
('Blue Ballpoint Pen', 'Writing Materials', 'BOX', 120, 15, 'Standard blue ink pens, 10 per box', NOW(6), NOW(6)),
('A4 Printer Paper', 'Paper Products', 'REAM', 8, 10, '80gsm white printing paper, 500 sheets', NOW(6), NOW(6)),
('Sticky Notes', 'Desk Accessories', 'PACK', 45, 5, '3x3 inch yellow sticky notes', NOW(6), NOW(6)),
('Black Marker', 'Writing Materials', 'BOX', 3, 5, 'Permanent black ink markers, 12 per box', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE name=name;
