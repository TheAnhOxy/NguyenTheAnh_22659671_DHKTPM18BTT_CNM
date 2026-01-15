CREATE DATABASE IF NOT EXISTS shopdb;
USE shopdb;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 0
);


INSERT INTO products (name, price, quantity) VALUES 
('Laptop Gaming', 25000000, 5),
('Bàn phím cơ RGB', 1200000, 15),
('Chuột không dây', 450000, 30),
('Màn hình 27 inch', 6500000, 8),
('Tai nghe gaming', 1800000, 20),
('Webcam Full HD', 950000, 12),
('Ổ cứng SSD 1TB', 3200000, 25),
('RAM DDR4 16GB', 1700000, 18),
('Bộ phát WiFi', 1100000, 10),
('Bàn di chuột XXL', 350000, 40),
('Loa Bluetooth', 900000, 22),
('USB 64GB', 250000, 50),
('Adapter sạc nhanh', 400000, 35);
