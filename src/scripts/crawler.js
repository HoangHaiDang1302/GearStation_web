const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

function parsePrice(priceText) {
    if (!priceText) return 0;
    const cleanStr = priceText.replace(/[^0-9]/g, '');
    return parseInt(cleanStr, 10) || 0;
}

function generateSlug(text) {
    return text.toString().toLowerCase()
        .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        .replace(/đ/gi, 'd')
        .replace(/[^a-z0-9 ]/gi, '')
        .trim()
        .replace(/\s+/g, '-');
}

async function scrapeAnPhat() {
    console.log('🚀 Bắt đầu quá trình Crawl dữ liệu từ AnPhatPC...');
    let products = [];
    
    // Quét 3 trang đầu
    for (let page = 1; page <= 3; page++) {
        const url = `https://www.anphatpc.com.vn/linh-kien-may-tinh.html?page=${page}`;
        console.log(`\nĐang lấy dữ liệu từ trang: ${url}`);
        
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);
            
            // Ở AnPhatPC, class thường là .p-item
            $('.p-item').each((index, element) => {
                const name = $(element).find('.p-name').text().trim();
                const priceText = $(element).find('.p-price').text().trim() || $(element).find('.p-current').text().trim(); 
                const oldPriceText = $(element).find('.p-oldprice').text().trim() || $(element).find('.p-market').text().trim();
                let imgUrl = $(element).find('.p-img img').attr('data-src') || $(element).find('.p-img img').attr('src');
                
                if (name && priceText) {
                    products.push({
                        name: name,
                        slug: generateSlug(name) + '-' + Math.floor(Math.random() * 1000),
                        price: parsePrice(oldPriceText) || parsePrice(priceText),
                        sale_price: parsePrice(oldPriceText) ? parsePrice(priceText) : null,
                        image: imgUrl,
                        description: 'Sản phẩm linh kiện chính hãng, bảo hành toàn quốc.',
                        category_id: 1 
                    });
                }
            });
            console.log(`✅ Lấy thành công trang ${page}`);
        } catch (error) {
            console.error(`❌ Lỗi khi lấy trang ${page}:`, error.message);
        }
    }
    
    return products;
}

async function saveToDatabase(products) {
    if (products.length === 0) {
        console.log('Không có sản phẩm nào để lưu.');
        return;
    }

    console.log(`\n💾 Đang lưu ${products.length} sản phẩm vào Database MySQL...`);
    
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gearstation'
    });

    try {
        const [categories] = await db.query('SELECT id FROM categories LIMIT 1');
        const defaultCatId = categories.length > 0 ? categories[0].id : null;

        let successCount = 0;
        for (let p of products) {
            const [rows] = await db.query('SELECT id FROM products WHERE name = ?', [p.name]);
            if (rows.length === 0) {
                await db.query(
                    'INSERT INTO products (name, slug, description, price, sale_price, image, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [p.name, p.slug, p.description, p.price, p.sale_price, p.image, defaultCatId]
                );
                successCount++;
            }
        }
        
        console.log(`🎉 HOÀN TẤT! Đã thêm mới thành công ${successCount} sản phẩm.`);
        
    } catch (err) {
        console.error('Lỗi Database:', err);
    } finally {
        await db.end();
    }
}

async function run() {
    const products = await scrapeAnPhat();
    await saveToDatabase(products);
    process.exit(0);
}

run();
