const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const CATEGORY_RULES = [
    {
        slug: 'laptop-gaming',
        name: 'Laptop Gaming',
        description: 'Laptop gaming, laptop hieu nang cao',
        matches: [
            'laptop', 'zephyrus', 'scar', 'legion', 'alienware', 'katana',
            'helios', 'predator', 'rog flow', 'rog strix g'
        ]
    },
    {
        slug: 'cpu-bo-vi-xu-ly',
        matches: ['cpu', 'ryzen', 'core i', 'xeon']
    },
    {
        slug: 'vga-card-do-hoa',
        matches: ['vga', 'rtx', 'gtx', 'radeon', 'geforce', 'rx 7', 'rx 6']
    },
    {
        slug: 'ram-bo-nho',
        matches: ['ram', 'ddr4', 'ddr5']
    },
    {
        slug: 'mainboard-bo-mach-chu',
        matches: ['mainboard', 'main ', 'z790', 'b760', 'x670', 'b650', 'h610', 'z690']
    },
    {
        slug: 'ssd-hdd-o-cung',
        matches: ['ssd', 'hdd', 'nvme', '990 pro', 'sn850x', 'kc3000']
    },
    {
        slug: 'psu-nguon-may-tinh',
        matches: ['psu', 'power supply', 'nguon']
    },
    {
        slug: 'case-vo-may-tinh',
        matches: ['case', 'vo may']
    },
    {
        slug: 'tan-nhiet',
        matches: ['tan nhiet', 'cooler', 'aio', 'fan']
    },
    {
        slug: 'man-hinh',
        matches: ['monitor', 'man hinh', 'odyssey', 'ultragear', 'vg27', 'xl2546']
    },
    {
        slug: 'ban-phim-chuot',
        matches: ['keyboard', 'mouse', 'ban phim', 'chuot', 'keychron', 'blackwidow', 'logitech g', 'razer']
    }
];

function normalize(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd');
}

function detectCategorySlug(productName) {
    const normalized = normalize(productName);
    const rule = CATEGORY_RULES.find(item => item.matches.some(keyword => normalized.includes(keyword)));
    return rule ? rule.slug : null;
}

async function ensureLaptopCategory(db) {
    const laptopRule = CATEGORY_RULES[0];
    await db.query(
        `INSERT INTO categories (name, slug, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
        [laptopRule.name, laptopRule.slug, laptopRule.description]
    );
}

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST === 'localhost' ? '127.0.0.1' : (process.env.DB_HOST || '127.0.0.1'),
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cnweb_db'
    });

    try {
        await ensureLaptopCategory(db);

        const [categories] = await db.query('SELECT id, slug FROM categories');
        const categoryIds = new Map(categories.map(category => [category.slug, category.id]));
        const [products] = await db.query('SELECT id, name, category_id FROM products');

        let updated = 0;
        let unchanged = 0;
        let unknown = 0;

        for (const product of products) {
            const slug = detectCategorySlug(product.name);
            const nextCategoryId = slug ? categoryIds.get(slug) : null;

            if (!nextCategoryId) {
                unknown++;
                continue;
            }

            if (product.category_id === nextCategoryId) {
                unchanged++;
                continue;
            }

            await db.query('UPDATE products SET category_id = ? WHERE id = ?', [nextCategoryId, product.id]);
            updated++;
        }

        console.log(`Repair completed: ${updated} updated, ${unchanged} unchanged, ${unknown} unknown.`);
    } finally {
        await db.end();
    }
}

main().catch(error => {
    console.error('Repair failed:', error.message);
    process.exit(1);
});
