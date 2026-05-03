-- ============================================
-- Database Schema - Web bán linh kiện máy tính
-- ============================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS cnweb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cnweb_db;

-- ============================================
-- Bảng Users - Người dùng
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    address TEXT DEFAULT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Bảng Categories - Danh mục sản phẩm
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    image VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Bảng Products - Sản phẩm
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    price DECIMAL(15, 0) NOT NULL DEFAULT 0,
    sale_price DECIMAL(15, 0) DEFAULT NULL,
    image VARCHAR(255) DEFAULT '',
    images JSON DEFAULT NULL,
    category_id INT DEFAULT NULL,
    brand VARCHAR(100) DEFAULT '',
    stock INT DEFAULT 0,
    specifications JSON DEFAULT NULL,
    is_featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB;

-- ============================================
-- Bảng Cart Items - Giỏ hàng
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
) ENGINE=InnoDB;

-- ============================================
-- Bảng Orders - Đơn hàng
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    shipping_name VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    note TEXT DEFAULT NULL,
    status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- Bảng Order Items - Chi tiết đơn hàng
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 0) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- Dữ liệu mẫu
-- ============================================

-- Tạo tài khoản admin (password: admin123)
INSERT INTO users (username, email, password, fullname, role) VALUES
('admin', 'admin@cnweb.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên', 'admin');

-- Danh mục linh kiện
INSERT INTO categories (name, slug, description) VALUES
('CPU - Bộ vi xử lý', 'cpu-bo-vi-xu-ly', 'Bộ vi xử lý Intel, AMD'),
('VGA - Card đồ họa', 'vga-card-do-hoa', 'Card màn hình NVIDIA, AMD'),
('RAM - Bộ nhớ', 'ram-bo-nho', 'RAM DDR4, DDR5'),
('Mainboard - Bo mạch chủ', 'mainboard-bo-mach-chu', 'Bo mạch chủ các loại'),
('SSD / HDD - Ổ cứng', 'ssd-hdd-o-cung', 'Ổ cứng SSD, HDD'),
('PSU - Nguồn máy tính', 'psu-nguon-may-tinh', 'Nguồn máy tính các công suất'),
('Case - Vỏ máy tính', 'case-vo-may-tinh', 'Vỏ case máy tính'),
('Tản nhiệt', 'tan-nhiet', 'Tản nhiệt khí, tản nhiệt nước'),
('Màn hình', 'man-hinh', 'Màn hình máy tính gaming, đồ họa'),
('Bàn phím & Chuột', 'ban-phim-chuot', 'Bàn phím cơ, chuột gaming');

-- Sản phẩm mẫu
INSERT INTO products (name, slug, description, price, sale_price, category_id, brand, stock, specifications, is_featured) VALUES
('Intel Core i5-14600KF', 'intel-core-i5-14600kf', 'Bộ vi xử lý Intel Core i5 thế hệ 14, 14 nhân 20 luồng, xung nhịp tối đa 5.3GHz', 7490000, 6990000, 1, 'Intel', 50, '{"cores": "14", "threads": "20", "base_clock": "3.5GHz", "boost_clock": "5.3GHz", "tdp": "125W", "socket": "LGA 1700"}', 1),
('AMD Ryzen 7 7800X3D', 'amd-ryzen-7-7800x3d', 'CPU AMD Ryzen 7 7800X3D với công nghệ 3D V-Cache, tối ưu gaming', 9990000, NULL, 1, 'AMD', 30, '{"cores": "8", "threads": "16", "base_clock": "4.2GHz", "boost_clock": "5.0GHz", "tdp": "120W", "socket": "AM5"}', 1),
('NVIDIA RTX 4070 Super', 'nvidia-rtx-4070-super', 'Card đồ họa RTX 4070 Super 12GB GDDR6X', 15990000, 14990000, 2, 'NVIDIA', 20, '{"vram": "12GB GDDR6X", "cuda_cores": "7168", "boost_clock": "2475MHz", "tdp": "220W"}', 1),
('Corsair Vengeance DDR5 32GB', 'corsair-vengeance-ddr5-32gb', 'Kit RAM DDR5 32GB (2x16GB) bus 5600MHz', 2890000, NULL, 3, 'Corsair', 100, '{"capacity": "32GB (2x16GB)", "type": "DDR5", "speed": "5600MHz", "latency": "CL36"}', 0),
('Samsung 990 Pro 1TB', 'samsung-990-pro-1tb', 'Ổ cứng SSD NVMe M.2 PCIe Gen 4.0, tốc độ đọc 7450MB/s', 3290000, 2990000, 5, 'Samsung', 80, '{"capacity": "1TB", "interface": "PCIe Gen 4.0 x4", "read_speed": "7450MB/s", "write_speed": "6900MB/s"}', 1);
