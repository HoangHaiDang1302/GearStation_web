const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// ============================================
// Tiện ích
// ============================================
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

// Tự phát hiện danh mục từ tên sản phẩm
function detectCategory(name) {
    const n = name.toLowerCase();
    if (n.includes('cpu') || n.includes('ryzen') || n.includes('core i') || n.includes('xeon')) return 'cpu-bo-vi-xu-ly';
    if (n.includes('vga') || n.includes('rtx') || n.includes('gtx') || n.includes('radeon') || n.includes('geforce')) return 'vga-card-do-hoa';
    if (n.includes('ram') || n.includes('ddr4') || n.includes('ddr5')) return 'ram-bo-nho';
    if (n.includes('mainboard') || n.includes('main ') || n.includes('bo mạch')) return 'mainboard-bo-mach-chu';
    if (n.includes('ssd') || n.includes('hdd') || n.includes('ổ cứng') || n.includes('nvme')) return 'ssd-hdd-o-cung';
    if (n.includes('psu') || n.includes('nguồn') || n.includes('power supply')) return 'psu-nguon-may-tinh';
    if (n.includes('case') || n.includes('vỏ máy')) return 'case-vo-may-tinh';
    if (n.includes('tản nhiệt') || n.includes('fan') || n.includes('cooler') || n.includes('aio')) return 'tan-nhiet';
    if (n.includes('màn hình') || n.includes('monitor')) return 'man-hinh';
    if (n.includes('bàn phím') || n.includes('chuột') || n.includes('keyboard') || n.includes('mouse')) return 'ban-phim-chuot';
    return null;
}

// Tự phát hiện thương hiệu từ tên sản phẩm
function detectBrand(name) {
    const n = name.toLowerCase();
    const brands = [
        'intel', 'amd', 'nvidia', 'corsair', 'samsung',
        'asus', 'msi', 'gigabyte', 'kingston', 'logitech',
        'western digital', 'wd', 'crucial', 'thermaltake', 'cooler master',
        'nzxt', 'evga', 'zotac', 'sapphire', 'asrock',
        'g.skill', 'gskill', 'razer', 'steelseries', 'hyperx',
        'deepcool', 'be quiet', 'seasonic', 'phanteks', 'lian li',
        'acer', 'dell', 'lg', 'viewsonic', 'benq'
    ];
    for (const b of brands) {
        if (n.includes(b)) return b;
    }
    return null;
}

// ============================================
// Crawl từ AnPhatPC (Nguồn chính)
// ============================================
async function scrapeAnPhat() {
    console.log('\n🚀 Bắt đầu crawl dữ liệu từ AnPhatPC...');
    let products = [];

    // Tăng số trang lên 10 để lấy nhiều sản phẩm hơn
    for (let page = 1; page <= 10; page++) {
        const url = `https://www.anphatpc.com.vn/linh-kien-may-tinh.html?page=${page}`;
        console.log(`\n📄 Đang crawl trang ${page}: ${url}`);

        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 15000
            });
            const $ = cheerio.load(data);

            $('.p-item').each((index, element) => {
                const name = $(element).find('.p-name').text().trim();
                const priceText = $(element).find('.p-price').text().trim() || $(element).find('.p-current').text().trim();
                const oldPriceText = $(element).find('.p-oldprice').text().trim() || $(element).find('.p-market').text().trim();
                let imgUrl = $(element).find('.p-img img').attr('data-src') || $(element).find('.p-img img').attr('src') || '';

                if (name && parsePrice(priceText) > 0) {
                    products.push({
                        name,
                        slug: generateSlug(name) + '-' + Math.floor(Math.random() * 9000 + 1000),
                        price: parsePrice(oldPriceText) || parsePrice(priceText),
                        sale_price: parsePrice(oldPriceText) ? parsePrice(priceText) : null,
                        image: imgUrl,
                        description: `${name} - Sản phẩm linh kiện máy tính chất lượng cao. Bảo hành chính hãng.`,
                    });
                }
            });

            console.log(`   ✅ Trang ${page} OK - tổng ${products.length} SP (tích luỹ)`);
            await new Promise(r => setTimeout(r, 1500));
        } catch (error) {
            console.error(`   ❌ Lỗi trang ${page}:`, error.message);
        }
    }

    return products;
}

// ============================================
// Lưu vào Database
// ============================================
async function saveToDatabase(products) {
    if (products.length === 0) {
        console.log('\n⚠️  Không có sản phẩm nào để lưu.');
        return;
    }

    console.log(`\n💾 Đang lưu ${products.length} sản phẩm vào Database MySQL...`);

    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cnweb_db'
    });

    try {
        // Load bảng categories & brands để map
        const [categories] = await db.query('SELECT id, slug FROM categories');
        const [brands] = await db.query('SELECT id, slug, name FROM brands');

        const catMap = {};
        categories.forEach(c => catMap[c.slug] = c.id);

        const brandMap = {};
        brands.forEach(b => {
            brandMap[b.slug.toLowerCase()] = b.id;
            brandMap[b.name.toLowerCase()] = b.id;
        });

        let added = 0, skipped = 0;

        for (const p of products) {
            // Kiểm tra trùng tên
            const [existing] = await db.query('SELECT id FROM products WHERE name = ?', [p.name]);
            if (existing.length > 0) {
                skipped++;
                continue;
            }

            // Tự detect category & brand từ tên
            const catSlug = detectCategory(p.name);
            const categoryId = catSlug ? (catMap[catSlug] || null) : null;

            const brandName = detectBrand(p.name);
            let brandId = null;
            if (brandName) {
                brandId = brandMap[brandName] || null;
                // Nếu brand chưa có trong DB → tự tạo
                if (!brandId) {
                    const brandSlug = generateSlug(brandName);
                    const [result] = await db.query(
                        'INSERT INTO brands (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
                        [brandName.charAt(0).toUpperCase() + brandName.slice(1), brandSlug]
                    );
                    brandId = result.insertId;
                    brandMap[brandName] = brandId;
                    console.log(`   🏷️  Tạo brand mới: ${brandName}`);
                }
            }

            // Insert sản phẩm
            await db.query(
                `INSERT INTO products 
                 (name, slug, description, price, sale_price, image, category_id, brand_id, stock, is_featured) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    p.name, p.slug, p.description || '',
                    p.price, p.sale_price,
                    p.image || '', categoryId, brandId,
                    Math.floor(Math.random() * 100) + 10,  // stock ngẫu nhiên 10-110
                    Math.random() > 0.7 ? 1 : 0            // 30% là featured
                ]
            );
            added++;
        }

        console.log(`\n🎉 HOÀN TẤT!`);
        console.log(`   ✅ Thêm mới: ${added} sản phẩm`);
        console.log(`   ⏭️  Bỏ qua (trùng): ${skipped} sản phẩm`);

    } catch (err) {
        console.error('\n❌ Lỗi Database:', err.message);
    } finally {
        await db.end();
    }
}

// ============================================
// Chạy crawler
// ============================================
async function run() {
    console.log('='.repeat(50));
    console.log('   GEARSTATION - PRODUCT CRAWLER');
    console.log('='.repeat(50));

    // Crawl từ nguồn AnPhat
    const anPhatProducts = await scrapeAnPhat();

    // Gộp lại, loại trùng theo tên
    const seen = new Set();
    const allProducts = [];
    for (const p of anPhatProducts) {
        if (!seen.has(p.name)) {
            seen.add(p.name);
            allProducts.push(p);
        }
    }

    console.log(`\n📊 Tổng kết crawl: ${allProducts.length} sản phẩm (không trùng)`);

    await saveToDatabase(allProducts);
    process.exit(0);
}

run();
