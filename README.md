# GearStation - Website bán linh kiện máy tính

GearStation là website thương mại điện tử bán linh kiện máy tính, laptop gaming và gaming gear. Dự án được xây dựng theo mô hình MVC với Express.js, EJS và MySQL, có đầy đủ giao diện người dùng, trang quản trị và API v1 để mở rộng sang mobile app hoặc frontend riêng.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat-square)
![EJS](https://img.shields.io/badge/View-EJS-B4CA65?style=flat-square)
![Status](https://img.shields.io/badge/Status-Development-e30019?style=flat-square)

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Database](#database)
- [Tài khoản mẫu](#tài-khoản-mẫu)
- [Các route giao diện](#các-route-giao-diện)
- [API v1](#api-v1)
- [Luồng hoạt động chính](#luồng-hoạt-động-chính)
- [Ghi chú bảo mật](#ghi-chú-bảo-mật)
- [Định hướng phát triển tiếp](#định-hướng-phát-triển-tiếp)

## Tính năng chính

### Khách hàng

| Nhóm chức năng | Mô tả |
| --- | --- |
| Trang chủ | Banner khuyến mãi, danh mục nổi bật, sản phẩm bán chạy, sản phẩm mới |
| Sản phẩm | Xem danh sách, tìm kiếm, lọc theo danh mục, xem chi tiết |
| Tài khoản | Đăng ký, đăng nhập, đăng xuất bằng session |
| Giỏ hàng | Thêm sản phẩm, cập nhật số lượng, xóa sản phẩm |
| Đặt hàng | Thanh toán, nhập thông tin nhận hàng, chọn phương thức thanh toán |
| Mã giảm giá | Kiểm tra và áp dụng coupon hợp lệ |
| Đơn hàng | Xem lịch sử đơn hàng và chi tiết từng đơn |
| Đánh giá | API hỗ trợ xem và tạo đánh giá sản phẩm |

### Quản trị viên

| Nhóm chức năng | Mô tả |
| --- | --- |
| Dashboard | Thống kê tổng sản phẩm, đơn hàng, doanh thu, người dùng |
| Quản lý sản phẩm | Thêm, sửa, xóa, upload ảnh, quản lý giá, tồn kho, danh mục, thương hiệu |
| Quản lý danh mục | Thêm, sửa, xóa danh mục sản phẩm |
| Quản lý đơn hàng | Xem danh sách, xem chi tiết, cập nhật trạng thái đơn |
| Quản lý user | API admin hỗ trợ lấy danh sách người dùng |

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Runtime | Node.js |
| Backend framework | Express.js |
| Template engine | EJS |
| Layout | express-ejs-layouts |
| Database | MySQL |
| MySQL driver | mysql2 |
| Authentication | express-session |
| Password hashing | bcryptjs |
| Upload file | multer |
| Validate dữ liệu | express-validator |
| HTTP logging | morgan |
| CORS | cors |
| CSS/Icon | CSS thuần, Boxicons |

## Cấu trúc thư mục

```text
web/
├── public/
│   ├── css/                 # CSS giao diện
│   ├── img/                 # Ảnh sản phẩm, asset tĩnh
│   └── uploads/             # Ảnh upload từ admin nếu có
├── src/
│   ├── config/
│   │   └── db.js            # Kết nối MySQL
│   ├── controllers/         # Controller giao diện và API
│   │   └── api/             # REST API controllers
│   ├── database/
│   │   └── schema.sql       # Schema và dữ liệu mẫu
│   ├── middlewares/         # Auth, admin, upload middleware
│   ├── models/              # Model thao tác database
│   ├── routes/              # Web routes và API routes
│   ├── scripts/             # Script init DB, seed dữ liệu, crawler
│   ├── utils/               # Helper format tiền, ngày tháng
│   ├── views/               # Giao diện EJS
│   │   ├── admin/           # Trang quản trị
│   │   ├── auth/            # Đăng nhập, đăng ký
│   │   ├── cart/            # Giỏ hàng
│   │   ├── orders/          # Thanh toán, lịch sử đơn
│   │   ├── products/        # Danh sách và chi tiết sản phẩm
│   │   ├── layouts/         # Layout main/admin
│   │   └── partials/        # Header, footer, product section
│   └── server.js            # Entry point
├── .env.example             # File môi trường mẫu
├── package.json
└── README.md
```

## Cài đặt và chạy dự án

### 1. Clone hoặc mở project

```bash
cd web
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file môi trường

Sao chép `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 4. Tạo database

Đảm bảo MySQL đang chạy, sau đó chạy:

```bash
node src/scripts/init-db.js
```

Script này sẽ:

- Xóa database `cnweb_db` cũ nếu có.
- Tạo lại database theo `src/database/schema.sql`.
- Tạo các bảng cần thiết.
- Thêm dữ liệu mẫu: admin, user, thương hiệu, danh mục, coupon.

### 5. Chạy server

Chạy production/dev thường:

```bash
npm start
```

Chạy bằng nodemon:

```bash
npm run dev
```

Sau đó mở:

```text
http://localhost:3000
```

## Cấu hình môi trường

File `.env.example`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cnweb_db

SESSION_SECRET=
```

| Biến | Ý nghĩa |
| --- | --- |
| `PORT` | Port chạy Express server |
| `NODE_ENV` | Môi trường chạy app |
| `DB_HOST` | Host MySQL |
| `DB_PORT` | Port MySQL |
| `DB_USER` | Tài khoản MySQL |
| `DB_PASSWORD` | Mật khẩu MySQL |
| `DB_NAME` | Tên database |
| `SESSION_SECRET` | Chuỗi bí mật để ký session |

Khuyến nghị đặt `SESSION_SECRET` thành chuỗi dài, khó đoán khi deploy.

## Database

Dự án sử dụng MySQL với các bảng chính:

| Bảng | Chức năng |
| --- | --- |
| `users` | Lưu tài khoản khách hàng và admin |
| `brands` | Lưu thương hiệu sản phẩm |
| `categories` | Lưu danh mục sản phẩm |
| `products` | Lưu sản phẩm, giá, sale price, tồn kho, thông số |
| `reviews` | Lưu đánh giá sản phẩm |
| `cart_items` | Lưu giỏ hàng theo user |
| `coupons` | Lưu mã giảm giá |
| `orders` | Lưu thông tin đơn hàng |
| `order_items` | Lưu chi tiết sản phẩm trong đơn |

### Trạng thái đơn hàng

| Trạng thái | Ý nghĩa |
| --- | --- |
| `pending` | Chờ xác nhận |
| `confirmed` | Đã xác nhận |
| `shipping` | Đang giao |
| `delivered` | Đã giao |
| `cancelled` | Đã hủy |

### Phương thức thanh toán

| Giá trị | Ý nghĩa |
| --- | --- |
| `cod` | Thanh toán khi nhận hàng |
| `bank_transfer` | Chuyển khoản ngân hàng |

## Tài khoản mẫu

Sau khi chạy `node src/scripts/init-db.js`, có thể dùng:

| Vai trò | Email | Username | Password |
| --- | --- | --- | --- |
| Admin | `admin@cnweb.com` | `admin` | `password` |
| Customer | `user1@gmail.com` | `user1` | `password` |

Mật khẩu trong database được lưu bằng bcrypt hash, không lưu plain text.

## Các route giao diện

### Public

| Method | Route | Mô tả |
| --- | --- | --- |
| GET | `/` | Trang chủ |
| GET | `/products` | Danh sách sản phẩm |
| GET | `/products/search?q=keyword` | Tìm kiếm sản phẩm |
| GET | `/products/category/:slug` | Sản phẩm theo danh mục |
| GET | `/products/:slug` | Chi tiết sản phẩm |
| GET | `/auth/login` | Trang đăng nhập |
| POST | `/auth/login` | Xử lý đăng nhập |
| GET | `/auth/register` | Trang đăng ký |
| POST | `/auth/register` | Xử lý đăng ký |
| GET | `/auth/logout` | Đăng xuất |

### Yêu cầu đăng nhập

| Method | Route | Mô tả |
| --- | --- | --- |
| GET | `/cart` | Xem giỏ hàng |
| POST | `/cart/add` | Thêm sản phẩm vào giỏ |
| POST | `/cart/update` | Cập nhật số lượng |
| POST | `/cart/remove` | Xóa sản phẩm khỏi giỏ |
| GET | `/orders/checkout` | Trang thanh toán |
| POST | `/orders/checkout` | Tạo đơn hàng |
| GET | `/orders` | Lịch sử đơn hàng |
| GET | `/orders/:id` | Chi tiết đơn hàng |

### Admin

| Method | Route | Mô tả |
| --- | --- | --- |
| GET | `/admin` | Dashboard |
| GET | `/admin/products` | Danh sách sản phẩm |
| GET | `/admin/products/create` | Form thêm sản phẩm |
| POST | `/admin/products/create` | Tạo sản phẩm |
| GET | `/admin/products/edit/:id` | Form sửa sản phẩm |
| POST | `/admin/products/edit/:id` | Cập nhật sản phẩm |
| POST | `/admin/products/delete/:id` | Xóa sản phẩm |
| GET | `/admin/categories` | Danh sách danh mục |
| POST | `/admin/categories/create` | Tạo danh mục |
| POST | `/admin/categories/edit/:id` | Cập nhật danh mục |
| POST | `/admin/categories/delete/:id` | Xóa danh mục |
| GET | `/admin/orders` | Danh sách đơn hàng |
| GET | `/admin/orders/:id` | Chi tiết đơn hàng |
| POST | `/admin/orders/:id/status` | Cập nhật trạng thái đơn |

## API v1

Base URL:

```text
/api/v1
```

### Public API

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/api/v1` | Danh sách API |
| GET | `/api/v1/products` | Danh sách sản phẩm |
| GET | `/api/v1/products/featured` | Sản phẩm nổi bật |
| GET | `/api/v1/products/latest` | Sản phẩm mới |
| GET | `/api/v1/products/:idOrSlug` | Chi tiết sản phẩm theo id hoặc slug |
| GET | `/api/v1/products/:productId/reviews` | Danh sách đánh giá |
| GET | `/api/v1/categories` | Danh sách danh mục |
| GET | `/api/v1/brands` | Danh sách thương hiệu |
| GET | `/api/v1/coupons/validate?code=CODE&orderAmount=AMOUNT` | Kiểm tra coupon |
| POST | `/api/v1/coupons/validate` | Kiểm tra coupon |

### API cần đăng nhập

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/api/v1/cart` | Lấy giỏ hàng |
| POST | `/api/v1/cart/add` | Thêm vào giỏ |
| PUT | `/api/v1/cart/update` | Cập nhật số lượng |
| DELETE | `/api/v1/cart/remove` | Xóa khỏi giỏ |
| GET | `/api/v1/orders` | Danh sách đơn của user |
| GET | `/api/v1/orders/:id` | Chi tiết đơn |
| POST | `/api/v1/orders` | Tạo đơn hàng |
| POST | `/api/v1/products/:productId/reviews` | Tạo đánh giá |

### API admin

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/api/v1/admin/dashboard` | Thống kê dashboard |
| GET | `/api/v1/admin/products` | Danh sách sản phẩm |
| POST | `/api/v1/admin/products` | Tạo sản phẩm |
| GET | `/api/v1/admin/products/:id` | Chi tiết sản phẩm |
| PUT | `/api/v1/admin/products/:id` | Cập nhật sản phẩm |
| DELETE | `/api/v1/admin/products/:id` | Xóa sản phẩm |
| GET | `/api/v1/admin/categories` | Danh sách danh mục |
| POST | `/api/v1/admin/categories` | Tạo danh mục |
| PUT | `/api/v1/admin/categories/:id` | Cập nhật danh mục |
| DELETE | `/api/v1/admin/categories/:id` | Xóa danh mục |
| GET | `/api/v1/admin/orders` | Danh sách đơn hàng |
| GET | `/api/v1/admin/orders/:id` | Chi tiết đơn hàng |
| PATCH | `/api/v1/admin/orders/:id/status` | Cập nhật trạng thái đơn |
| GET | `/api/v1/admin/users` | Danh sách người dùng |

### Ví dụ request API

Thêm sản phẩm vào giỏ:

```http
POST /api/v1/cart/add
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

Tạo đơn hàng:

```http
POST /api/v1/orders
Content-Type: application/json

{
  "shippingName": "Nguyen Van A",
  "shippingPhone": "0901234567",
  "shippingAddress": "123 Le Loi, Quan 1, TP.HCM",
  "note": "Giao buoi chieu",
  "paymentMethod": "cod",
  "couponCode": "WELCOME10"
}
```

Cập nhật trạng thái đơn hàng:

```http
PATCH /api/v1/admin/orders/1/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

## Luồng hoạt động chính

### Luồng mua hàng

```text
Xem sản phẩm
→ Đăng nhập
→ Thêm vào giỏ hàng
→ Cập nhật số lượng nếu cần
→ Thanh toán
→ Áp dụng coupon nếu có
→ Tạo đơn hàng
→ Theo dõi trạng thái đơn
```

### Luồng quản trị sản phẩm

```text
Admin đăng nhập
→ Vào /admin/products
→ Thêm hoặc sửa sản phẩm
→ Upload ảnh nếu cần
→ Sản phẩm hiển thị ở trang khách hàng
```

### Luồng xử lý đơn hàng

```text
Khách đặt hàng
→ Đơn ở trạng thái pending
→ Admin xác nhận
→ Chuyển sang shipping
→ Hoàn tất delivered hoặc cancelled
```

## Ghi chú bảo mật

- Password được hash bằng `bcryptjs`.
- Route `/cart` và `/orders` yêu cầu đăng nhập.
- Route `/admin` yêu cầu user có `role = admin`.
- API admin sử dụng middleware riêng để kiểm tra quyền.
- Không nên commit file `.env` thật lên GitHub.
- Khi deploy thật, nên đặt `SESSION_SECRET` mạnh và bật HTTPS.

## Kiểm tra nhanh

Kiểm tra cú pháp server:

```bash
node --check src/server.js
```

Kiểm tra server:

```bash
npm start
```

Sau đó truy cập:

```text
http://localhost:3000
http://localhost:3000/admin
http://localhost:3000/api/v1
```

## Định hướng phát triển tiếp

- Thêm trang quản lý coupon trong admin.
- Thêm trang quản lý user trong admin.
- Thêm profile người dùng và đổi mật khẩu.
- Thêm quên mật khẩu qua email.
- Thêm bộ lọc sản phẩm theo giá, thương hiệu, trạng thái sale.
- Thêm upload nhiều ảnh cho sản phẩm.
- Thêm quản lý review trong admin.
- Thêm CSRF protection cho form.
- Thêm test tự động cho model, controller và API.
- Chuẩn hóa lại encoding tiếng Việt trong các file seed/schema/script cũ nếu cần.

## Tác giả

Dự án phục vụ đồ án môn học Công nghệ Web.

