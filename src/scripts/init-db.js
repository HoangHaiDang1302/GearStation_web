/**
 * Script khởi tạo lại Database từ schema.sql
 * Chạy: node src/scripts/init-db.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initDatabase() {
    console.log('🗄️  Đang kết nối MySQL...');

    // Kết nối không chọn database (vì có thể chưa tồn tại)
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        // Drop DB cũ
        console.log('🗑️  Xóa database cũ (nếu có)...');
        await db.query('DROP DATABASE IF EXISTS cnweb_db');

        // Đọc và chạy schema.sql
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        console.log('📝 Đang chạy schema.sql...');
        await db.query(schema);

        console.log('✅ Khởi tạo database thành công!');
        
        // Kiểm tra kết quả
        await db.query('USE cnweb_db');
        const [tables] = await db.query('SHOW TABLES');
        console.log(`\n📊 Có ${tables.length} bảng:`);
        tables.forEach(t => {
            const name = Object.values(t)[0];
            console.log(`   • ${name}`);
        });

        const [products] = await db.query('SELECT COUNT(*) as c FROM products');
        const [users] = await db.query('SELECT COUNT(*) as c FROM users');
        const [categories] = await db.query('SELECT COUNT(*) as c FROM categories');
        const [brands] = await db.query('SELECT COUNT(*) as c FROM brands');
        console.log(`\n📦 Dữ liệu mẫu: ${users[0].c} users, ${categories[0].c} danh mục, ${brands[0].c} thương hiệu, ${products[0].c} sản phẩm`);

    } catch (err) {
        console.error('❌ Lỗi:', err.message);
    } finally {
        await db.end();
    }
}

initDatabase().then(() => process.exit(0));
