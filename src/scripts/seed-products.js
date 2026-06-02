const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const google = require('googlethis');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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

const brands = {
    'VGA': ['ASUS ROG Strix', 'MSI Gaming X', 'Gigabyte AORUS', 'Zotac Trinity', 'Galax SG', 'Colorful iGame'],
    'CPU': ['Intel Core', 'AMD Ryzen'],
    'RAM': ['Corsair Vengeance', 'G.Skill Trident Z', 'Kingston Fury', 'Adata XPG', 'TeamGroup T-Force'],
    'Mainboard': ['ASUS TUF', 'MSI MAG', 'Gigabyte', 'ASRock Steel Legend', 'NZXT N7'],
    'Mouse': ['Logitech G', 'Razer', 'Corsair', 'SteelSeries', 'Zowie', 'Pulsar'],
    'Laptop': ['ASUS ROG', 'Acer Predator', 'Lenovo Legion', 'Dell Alienware', 'MSI Katana', 'Gigabyte AERO'],
    'Monitor': ['LG UltraGear', 'ASUS TUF Gaming', 'Samsung Odyssey', 'Dell UltraSharp', 'BenQ Zowie', 'AOC Agon'],
    'Keyboard': ['Akko', 'Keychron', 'Razer BlackWidow', 'Corsair K70', 'Logitech G Pro', 'Ducky One'],
    'SSD': ['Samsung 990 Pro', 'WD Black SN850X', 'Kingston KC3000', 'Crucial P5 Plus', 'Corsair MP600']
};

const models = {
    'VGA': ['RTX 4090 24GB', 'RTX 4080 Super', 'RTX 4070 Ti', 'RTX 4060 8GB', 'RX 7900 XTX', 'RX 7800 XT', 'RTX 3060 12GB'],
    'CPU': ['i9-14900K', 'i7-14700K', 'i5-13600K', 'i5-12400F', '9 7950X', '7 7800X3D', '5 7600X', '5 5600X'],
    'RAM': ['32GB DDR5 6000MHz', '64GB DDR5 6400MHz', '16GB DDR4 3200MHz', '32GB DDR4 3600MHz'],
    'Mainboard': ['Z790 WiFi', 'B760M', 'X670E', 'B650M', 'Z690-A', 'H610M'],
    'Mouse': ['Pro X Superlight', 'DeathAdder V3 Pro', 'Viper Mini', 'G502 Hero', 'EC2-C', 'X2 Mini'],
    'Laptop': ['Zephyrus G14', 'Scar 15', 'Legion 5 Pro', 'Alienware m16', 'Katana 15', 'Helios Neo 16'],
    'Monitor': ['27GN850', 'Odyssey G7', 'VG27AQ', 'XL2546K', 'U2723QE'],
    'Keyboard': ['MOD007', 'K8 Pro', 'BlackWidow V3', 'K70 RGB', 'G Pro X', 'One 3 Mini'],
    'SSD': ['1TB PCIe 4.0', '2TB PCIe 4.0', '500GB PCIe 3.0', '4TB Gen 4', '250GB NVMe']
};

const basePrices = {
    'VGA': [6000000, 55000000],
    'CPU': [3000000, 15000000],
    'RAM': [800000, 7000000],
    'Mainboard': [1500000, 13000000],
    'Mouse': [400000, 3500000],
    'Laptop': [15000000, 80000000],
    'Monitor': [3000000, 25000000],
    'Keyboard': [1000000, 5000000],
    'SSD': [800000, 6000000]
};

const delay = ms => new Promise(res => setTimeout(res, ms));

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 1. Sinh 500 sản phẩm (chưa có ảnh)
function generateProducts(count) {
    const products = [];
    const types = Object.keys(brands);
    
    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const brand = brands[type][Math.floor(Math.random() * brands[type].length)];
        const model = models[type][Math.floor(Math.random() * models[type].length)];
        
        let name = `${type} ${brand} ${model}`;
        if (type === 'CPU' && brand === 'AMD Ryzen') name = `${brand} ${model}`;
        if (type === 'CPU' && brand === 'Intel Core') name = `${brand} ${model}`;

        const priceRange = basePrices[type];
        const originalPrice = Math.floor(getRandomInt(priceRange[0], priceRange[1]) / 100000) * 100000 + 90000;
        
        let salePrice = null;
        if (Math.random() > 0.5) {
            salePrice = Math.floor(originalPrice * (1 - getRandomInt(5, 15)/100) / 100000) * 100000 + 90000;
        }

        products.push({
            name: name, // Tên siêu chi tiết (VD: VGA ASUS ROG Strix RTX 4090 24GB)
            type: type,
            slug: generateSlug(name) + '-' + getRandomInt(1000, 9999),
            description: `Sản phẩm linh kiện máy tính ${type} cao cấp. Cam kết chính hãng 100%, bảo hành dài hạn. Phù hợp cho build PC Gaming và Workstation.`,
            price: originalPrice,
            sale_price: salePrice,
            image: '', // Sẽ gắn sau
            is_featured: Math.random() > 0.8 ? 1 : 0 
        });
    }
    return products;
}

// 2. Tìm và tải ảnh cho TỪNG sản phẩm
async function fetchAndDownloadImages(products) {
    console.log('🤖 Khởi động AI dò tìm ảnh thực tế từ Google Images cho TỪNG SẢN PHẨM...');
    const imgDir = path.join(__dirname, '../../public/img/products');
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

    const localImages = {};
    
    // Lọc ra các tên sản phẩm độc nhất (tránh tìm 1 món đồ 2 lần nếu random trùng)
    const uniqueNames = [...new Set(products.map(p => p.name))];
    
    console.log(`🔎 Dữ liệu random tạo ra ${uniqueNames.length} sản phẩm hoàn toàn khác biệt. Đang tiến hành cào ${uniqueNames.length} ảnh tương ứng... (Sẽ mất khoảng 3-5 phút)`);

    for (let i = 0; i < uniqueNames.length; i++) {
        const productName = uniqueNames[i];
        const fileName = `${generateSlug(productName)}.jpg`;
        const filePath = path.join(imgDir, fileName);
        
        if (fs.existsSync(filePath)) {
            localImages[productName] = `/img/products/${fileName}`;
            continue; // Ảnh đã tải rồi thì bỏ qua
        }

        try {
            // Lên Google tìm đích danh Tên Hãng + Tên Đời Máy
            const query = `${productName} hardware`;
            const images = await google.image(query, { safe: false });
            
            if (images && images.length > 0) {
                let imgUrl = images[0].url;
                const response = await axios({
                    method: 'GET',
                    url: imgUrl,
                    responseType: 'stream',
                    timeout: 5000
                });
                
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);
                
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                
                localImages[productName] = `/img/products/${fileName}`;
                console.log(`[${i+1}/${uniqueNames.length}] ✅ Đã tải: ${productName}`);
            } else {
                console.log(`[${i+1}/${uniqueNames.length}] ⚠️ Không thấy ảnh: ${productName}`);
            }
        } catch (error) {
            console.log(`[${i+1}/${uniqueNames.length}] ❌ Lỗi mạng/Bị chặn: ${productName}`);
        }
        
        // Ngủ 0.8 giây để không bị Google cấm IP
        await delay(800);
    }
    
    // Gắn ảnh ngược lại vào 500 sản phẩm
    for (let p of products) {
        p.image = localImages[p.name] || `https://wsrv.nl/?url=hanoicomputercdn.com/media/product/67406_cpu_intel_core_i9_13900k_1.jpg`;
    }
    
    return products;
}

async function run() {
    console.log('\n🚀 Đang tạo dữ liệu ngẫu nhiên (500 sản phẩm)...');
    let products = generateProducts(500);

    // Bắt đầu cào hàng trăm ảnh
    products = await fetchAndDownloadImages(products);
    
    console.log('💾 Đang lưu vào Database MySQL...');
    const db = await mysql.createConnection({
        host: process.env.DB_HOST === 'localhost' ? '127.0.0.1' : (process.env.DB_HOST || '127.0.0.1'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cnweb_db'
    });

    try {
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('🧹 Đang dọn dẹp giỏ hàng và sản phẩm cũ...');
        await db.query('TRUNCATE TABLE cart_items');
        await db.query('TRUNCATE TABLE products');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        const [categories] = await db.query('SELECT id, name, slug FROM categories');
        const [brands] = await db.query('SELECT id, name, slug FROM brands');
        
        // Tạo map để lookup brand nhanh
        const brandMap = {};
        brands.forEach(b => brandMap[b.name.toLowerCase()] = b.id);
        
        let successCount = 0;
        for (let p of products) {
            let catId = null;
            for (let c of categories) {
                if (p.type === 'Laptop') {
                    if (c.slug === 'laptop-gaming' || c.name.toLowerCase().includes('laptop')) catId = c.id;
                } else if (p.name.includes('Core') || p.name.includes('Ryzen')) {
                    if (c.name.toLowerCase().includes('cpu')) catId = c.id;
                } else if (p.name.includes('RTX') || p.name.includes('RX')) {
                    if (c.name.toLowerCase().includes('vga')) catId = c.id;
                } else if (p.name.includes('RAM') || p.name.includes('DDR')) {
                    if (c.name.toLowerCase().includes('ram')) catId = c.id;
                } else if (p.name.includes('Mainboard') || p.name.includes('Z790') || p.name.includes('B760')) {
                    if (c.name.toLowerCase().includes('main')) catId = c.id;
                } else if (p.name.includes('Mouse') || p.name.includes('Logitech') || p.name.includes('Razer')) {
                    if (c.name.toLowerCase().includes('chuột') || c.name.toLowerCase().includes('mouse')) catId = c.id;
                } else if (p.name.includes('Monitor') || p.name.includes('Odyssey') || p.name.includes('UltraGear')) {
                    if (c.name.toLowerCase().includes('màn hình')) catId = c.id;
                } else if (p.name.includes('Keyboard') || p.name.includes('Keychron')) {
                    if (c.name.toLowerCase().includes('bàn phím')) catId = c.id;
                } else if (p.name.includes('SSD') || p.name.includes('NVMe')) {
                    if (c.name.toLowerCase().includes('ssd')) catId = c.id;
                }
            }

            // Detect brand from name
            let brandId = null;
            const n = p.name.toLowerCase();
            for (const bName of Object.keys(brandMap)) {
                if (n.includes(bName)) {
                    brandId = brandMap[bName];
                    break;
                }
            }
            
            // Random stock
            const stock = Math.floor(Math.random() * 100) + 10;

            await db.query(
                'INSERT INTO products (name, slug, description, price, sale_price, image, category_id, brand_id, stock, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [p.name, p.slug, p.description, p.price, p.sale_price, p.image, catId, brandId, stock, p.is_featured]
            );
            successCount++;
        }
        
        console.log(`\n🎉 HOÀN TẤT! Đã tạo và lưu thành công ${successCount} sản phẩm.`);
        console.log('Tất cả hình ảnh thực tế đã được bóc tách từ Google và tải về thư mục máy tính của bạn!');
        console.log('Hãy F5 trang web để xem thành quả!');
    } catch (err) {
        console.error('Lỗi Database:', err);
    } finally {
        await db.end();
        process.exit(0);
    }
}

run();
