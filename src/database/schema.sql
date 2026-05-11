-- ============================================
-- Database Schema - Web bán linh kiện máy tính
-- GearStation (Đồ án môn học)
-- ============================================

CREATE DATABASE IF NOT EXISTS cnweb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cnweb_db;

-- ============================================
-- 1. Users - Người dùng
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
-- 2. Brands - Thương hiệu
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    logo VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 3. Categories - Danh mục sản phẩm
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
-- 4. Products - Sản phẩm
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
    brand_id INT DEFAULT NULL,
    stock INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    specifications JSON DEFAULT NULL,
    is_featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_brand (brand_id),
    INDEX idx_slug (slug),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB;

-- ============================================
-- 5. Reviews - Đánh giá sản phẩm
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL COMMENT '1-5 sao',
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (product_id, user_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ============================================
-- 6. Cart Items - Giỏ hàng
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
-- 7. Coupons - Mã giảm giá
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
    discount_value DECIMAL(15, 0) NOT NULL,
    min_order_amount DECIMAL(15, 0) DEFAULT 0,
    max_discount DECIMAL(15, 0) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 8. Orders - Đơn hàng
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15, 0) DEFAULT 0,
    shipping_fee DECIMAL(15, 0) DEFAULT 0,
    final_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    shipping_name VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    note TEXT DEFAULT NULL,
    coupon_id INT DEFAULT NULL,
    payment_method ENUM('cod', 'bank_transfer') DEFAULT 'cod',
    status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- 9. Order Items - Chi tiết đơn hàng
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(255) DEFAULT '',
    price DECIMAL(15, 0) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- DỮ LIỆU MẪU
-- ============================================

-- Admin (password: admin123)
INSERT INTO users (username, email, password, fullname, role) VALUES
('admin', 'admin@cnweb.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên', 'admin');

-- User mẫu (password: user123)
INSERT INTO users (username, email, password, fullname, phone, address, role) VALUES
('user1', 'user1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn A', '0901234567', '123 Lê Lợi, Q1, TP.HCM', 'customer');

-- Thương hiệu
INSERT INTO brands (name, slug) VALUES
('Intel', 'intel'), ('AMD', 'amd'), ('NVIDIA', 'nvidia'),
('Corsair', 'corsair'), ('Samsung', 'samsung'), ('ASUS', 'asus'),
('MSI', 'msi'), ('Gigabyte', 'gigabyte'), ('Kingston', 'kingston'),
('Logitech', 'logitech');

-- Danh mục
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

-- Mã giảm giá mẫu
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, start_date, end_date) VALUES
('WELCOME10', 'percent', 10, 500000, 500000, 100, '2026-01-01 00:00:00', '2026-12-31 23:59:59'),
('GIAM50K', 'fixed', 50000, 2000000, NULL, 50, '2026-01-01 00:00:00', '2026-12-31 23:59:59');
