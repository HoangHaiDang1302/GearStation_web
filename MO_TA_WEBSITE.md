# Mô Tả Chi Tiết Website GearStation

## 1. Giới thiệu chung

GearStation là website thương mại điện tử chuyên bán linh kiện máy tính, laptop gaming, màn hình và gaming gear. Website được xây dựng nhằm mô phỏng một hệ thống bán hàng trực tuyến hoàn chỉnh, trong đó người dùng có thể xem sản phẩm, tìm kiếm, thêm vào giỏ hàng, đặt hàng và theo dõi đơn hàng. Bên cạnh đó, quản trị viên có thể quản lý sản phẩm, danh mục, đơn hàng và theo dõi tình hình hoạt động của cửa hàng thông qua trang admin.

Dự án phù hợp với đồ án môn Công nghệ Web vì có đầy đủ các thành phần quan trọng của một website thực tế: giao diện người dùng, xác thực tài khoản, xử lý dữ liệu với database, quản lý giỏ hàng, đặt hàng, phân quyền admin và hệ thống API.

## 2. Mục tiêu của website

Website GearStation được xây dựng với các mục tiêu chính:

- Cung cấp giao diện mua sắm trực tuyến cho người dùng.
- Hiển thị sản phẩm theo danh mục, sản phẩm mới và sản phẩm nổi bật.
- Cho phép người dùng đăng ký, đăng nhập và quản lý quá trình mua hàng.
- Cho phép người dùng thêm sản phẩm vào giỏ hàng và tạo đơn hàng.
- Hỗ trợ mã giảm giá khi thanh toán.
- Cung cấp trang quản trị cho admin để quản lý dữ liệu cửa hàng.
- Xây dựng hệ thống API để có thể mở rộng sang mobile app hoặc frontend riêng trong tương lai.

## 3. Đối tượng sử dụng

### 3.1. Khách truy cập

Khách truy cập là người chưa đăng nhập vào hệ thống. Nhóm người dùng này có thể:

- Xem trang chủ.
- Xem danh sách sản phẩm.
- Xem chi tiết sản phẩm.
- Tìm kiếm sản phẩm.
- Xem sản phẩm theo danh mục.
- Truy cập trang đăng nhập và đăng ký.

Tuy nhiên, khách truy cập chưa thể thêm sản phẩm vào giỏ hàng hoặc đặt hàng nếu chưa đăng nhập.

### 3.2. Khách hàng đã đăng nhập

Khách hàng đã đăng nhập có đầy đủ chức năng mua hàng:

- Thêm sản phẩm vào giỏ hàng.
- Cập nhật số lượng sản phẩm trong giỏ.
- Xóa sản phẩm khỏi giỏ hàng.
- Thanh toán và tạo đơn hàng.
- Áp dụng mã giảm giá.
- Xem lịch sử đơn hàng.
- Xem chi tiết từng đơn hàng.
- Gửi đánh giá sản phẩm thông qua API.

### 3.3. Quản trị viên

Quản trị viên là tài khoản có `role = admin`. Admin có thể truy cập khu vực `/admin` và thực hiện các nghiệp vụ quản lý:

- Xem dashboard thống kê.
- Quản lý sản phẩm.
- Quản lý danh mục.
- Quản lý đơn hàng.
- Cập nhật trạng thái đơn hàng.
- Xem danh sách người dùng thông qua API admin.

## 4. Chức năng phía người dùng

### 4.1. Trang chủ

Trang chủ là nơi giới thiệu nhanh các nội dung chính của cửa hàng. Giao diện trang chủ gồm:

- Banner khuyến mãi lớn, sinh động.
- Các banner phụ cho laptop gaming, màn hình và combo build PC.
- Dải liên kết nhanh đến các nhóm sản phẩm như CPU, VGA, bàn phím, SSD.
- Danh mục nổi bật.
- Sản phẩm bán chạy.
- Sản phẩm mới.

Mục tiêu của trang chủ là giúp người dùng nhanh chóng nhận biết website đang bán gì và dễ dàng đi đến nhóm sản phẩm họ quan tâm.

### 4.2. Danh sách sản phẩm

Trang danh sách sản phẩm cho phép người dùng xem các sản phẩm có trong hệ thống. Mỗi sản phẩm thường hiển thị:

- Ảnh sản phẩm.
- Tên sản phẩm.
- Giá bán.
- Giá khuyến mãi nếu có.
- Trạng thái nổi bật nếu là sản phẩm hot.
- Nút thêm vào giỏ hàng.

Danh sách sản phẩm có phân trang để tránh tải quá nhiều sản phẩm trong một lần.

### 4.3. Tìm kiếm sản phẩm

Người dùng có thể tìm kiếm sản phẩm theo từ khóa. Hệ thống sẽ truy vấn sản phẩm theo tên hoặc thông tin liên quan và trả về danh sách kết quả phù hợp.

Ví dụ:

```text
/products/search?q=rtx
```

Chức năng này giúp người dùng tìm nhanh sản phẩm cần mua thay vì phải duyệt thủ công qua từng danh mục.

### 4.4. Lọc sản phẩm theo danh mục

Website hỗ trợ xem sản phẩm theo từng danh mục như:

- CPU.
- VGA - Card đồ họa.
- RAM.
- Mainboard.
- SSD / HDD.
- Màn hình.
- Bàn phím và chuột.

Mỗi danh mục có slug riêng và được truy cập qua route:

```text
/products/category/:slug
```

### 4.5. Chi tiết sản phẩm

Trang chi tiết sản phẩm cung cấp thông tin đầy đủ hơn về một sản phẩm cụ thể:

- Tên sản phẩm.
- Hình ảnh.
- Giá gốc.
- Giá khuyến mãi.
- Mô tả sản phẩm.
- Thông số kỹ thuật.
- Tồn kho.
- Sản phẩm liên quan cùng danh mục.

Từ trang này, người dùng có thể thêm sản phẩm vào giỏ hàng.

### 4.6. Đăng ký tài khoản

Người dùng có thể tạo tài khoản mới bằng cách nhập các thông tin cơ bản như:

- Username.
- Email.
- Mật khẩu.
- Họ tên.
- Số điện thoại.
- Địa chỉ.

Mật khẩu sau khi đăng ký không được lưu trực tiếp trong database mà được hash bằng bcrypt để tăng tính bảo mật.

### 4.7. Đăng nhập và đăng xuất

Website sử dụng session để quản lý trạng thái đăng nhập. Sau khi đăng nhập thành công, thông tin user được lưu trong session và được dùng để:

- Hiển thị trạng thái đăng nhập trên giao diện.
- Kiểm tra quyền truy cập giỏ hàng.
- Kiểm tra quyền đặt hàng.
- Kiểm tra quyền admin.

Người dùng có thể đăng xuất để xóa session hiện tại.

### 4.8. Giỏ hàng

Giỏ hàng là nơi lưu các sản phẩm người dùng muốn mua. Chức năng giỏ hàng gồm:

- Xem danh sách sản phẩm trong giỏ.
- Thêm sản phẩm vào giỏ.
- Tăng hoặc giảm số lượng.
- Xóa sản phẩm khỏi giỏ.
- Tính tổng tiền tạm tính.

Dữ liệu giỏ hàng được lưu trong bảng `cart_items`, gắn với từng user cụ thể.

### 4.9. Thanh toán và tạo đơn hàng

Khi thanh toán, người dùng nhập thông tin nhận hàng:

- Tên người nhận.
- Số điện thoại.
- Địa chỉ giao hàng.
- Ghi chú đơn hàng.
- Phương thức thanh toán.
- Mã giảm giá nếu có.

Sau khi đặt hàng thành công, hệ thống tạo dữ liệu trong bảng `orders` và `order_items`. Đồng thời, giỏ hàng của người dùng được xóa để chuẩn bị cho lần mua tiếp theo.

### 4.10. Mã giảm giá

Website có bảng `coupons` để lưu mã giảm giá. Coupon có thể được cấu hình theo:

- Loại giảm giá: phần trăm hoặc số tiền cố định.
- Giá trị giảm.
- Giá trị đơn hàng tối thiểu.
- Mức giảm tối đa.
- Số lần sử dụng.
- Ngày bắt đầu và ngày kết thúc.
- Trạng thái kích hoạt.

Khi người dùng nhập coupon, hệ thống kiểm tra điều kiện hợp lệ trước khi áp dụng vào đơn hàng.

### 4.11. Lịch sử đơn hàng

Người dùng đã đăng nhập có thể xem lại các đơn hàng đã đặt. Mỗi đơn hàng gồm:

- Mã đơn hàng.
- Ngày đặt.
- Tổng tiền.
- Số tiền giảm.
- Phí vận chuyển.
- Thành tiền.
- Trạng thái đơn.

### 4.12. Chi tiết đơn hàng

Trang chi tiết đơn hàng hiển thị:

- Thông tin người nhận.
- Địa chỉ giao hàng.
- Phương thức thanh toán.
- Trạng thái đơn hàng.
- Danh sách sản phẩm trong đơn.
- Tổng tiền đơn hàng.

Người dùng chỉ được xem đơn hàng của chính mình.

## 5. Chức năng phía quản trị

### 5.1. Dashboard admin

Dashboard là màn hình tổng quan dành cho quản trị viên. Trang này giúp admin nắm được tình hình hoạt động của cửa hàng, bao gồm:

- Tổng số sản phẩm.
- Tổng số đơn hàng.
- Tổng số danh mục.
- Tổng số người dùng.
- Thống kê doanh thu hoặc trạng thái đơn hàng nếu dữ liệu có sẵn.

### 5.2. Quản lý sản phẩm

Admin có thể quản lý toàn bộ sản phẩm trong hệ thống:

- Xem danh sách sản phẩm.
- Thêm sản phẩm mới.
- Sửa thông tin sản phẩm.
- Xóa sản phẩm.
- Upload ảnh sản phẩm.
- Cấu hình giá gốc và giá khuyến mãi.
- Cấu hình tồn kho.
- Gán danh mục và thương hiệu.
- Đánh dấu sản phẩm nổi bật.

Chức năng này là phần quan trọng nhất của trang admin vì sản phẩm là dữ liệu chính của website bán hàng.

### 5.3. Quản lý danh mục

Admin có thể tạo và chỉnh sửa danh mục sản phẩm. Mỗi danh mục gồm:

- Tên danh mục.
- Slug.
- Mô tả.
- Hình ảnh nếu có.

Danh mục được dùng để phân loại sản phẩm và giúp người dùng lọc sản phẩm dễ hơn.

### 5.4. Quản lý đơn hàng

Admin có thể xem danh sách tất cả đơn hàng trong hệ thống. Với mỗi đơn hàng, admin có thể:

- Xem thông tin khách hàng.
- Xem sản phẩm trong đơn.
- Xem tổng tiền.
- Xem mã giảm giá đã dùng.
- Cập nhật trạng thái đơn hàng.

Các trạng thái đơn hàng gồm:

| Trạng thái | Ý nghĩa |
| --- | --- |
| `pending` | Đơn mới, đang chờ xác nhận |
| `confirmed` | Đơn đã được xác nhận |
| `shipping` | Đơn đang được giao |
| `delivered` | Đơn đã giao thành công |
| `cancelled` | Đơn đã bị hủy |

### 5.5. Quản lý người dùng

Hiện tại website có API admin để lấy danh sách người dùng. Chức năng giao diện quản lý user có thể được phát triển thêm trong tương lai.

## 6. Hệ thống API

Website có API v1 tại:

```text
/api/v1
```

API được chia thành ba nhóm:

### 6.1. API public

API public không yêu cầu đăng nhập. Các API này dùng để lấy dữ liệu sản phẩm, danh mục, thương hiệu, đánh giá và kiểm tra mã giảm giá.

Ví dụ:

```text
GET /api/v1/products
GET /api/v1/products/featured
GET /api/v1/products/latest
GET /api/v1/categories
GET /api/v1/brands
GET /api/v1/coupons/validate
```

### 6.2. API yêu cầu đăng nhập

Nhóm API này yêu cầu user đã đăng nhập. Các API chính:

```text
GET /api/v1/cart
POST /api/v1/cart/add
PUT /api/v1/cart/update
DELETE /api/v1/cart/remove
GET /api/v1/orders
POST /api/v1/orders
POST /api/v1/products/:productId/reviews
```

### 6.3. API admin

Nhóm API admin yêu cầu user có quyền admin:

```text
GET /api/v1/admin/dashboard
GET /api/v1/admin/products
POST /api/v1/admin/products
PUT /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id
GET /api/v1/admin/categories
POST /api/v1/admin/categories
PUT /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id
GET /api/v1/admin/orders
PATCH /api/v1/admin/orders/:id/status
GET /api/v1/admin/users
```

Việc có sẵn API giúp dự án dễ mở rộng thành hệ thống tách riêng backend và frontend, hoặc xây dựng thêm ứng dụng mobile.

## 7. Cơ sở dữ liệu

Database chính của website là `cnweb_db`. Các bảng dữ liệu được thiết kế theo nghiệp vụ bán hàng.

### 7.1. Bảng `users`

Lưu thông tin tài khoản người dùng:

- Username.
- Email.
- Password đã hash.
- Họ tên.
- Số điện thoại.
- Địa chỉ.
- Vai trò: `customer` hoặc `admin`.

### 7.2. Bảng `products`

Lưu thông tin sản phẩm:

- Tên sản phẩm.
- Slug.
- Mô tả.
- Giá gốc.
- Giá khuyến mãi.
- Ảnh.
- Danh mục.
- Thương hiệu.
- Tồn kho.
- Số lượng đã bán.
- Thông số kỹ thuật dạng JSON.
- Trạng thái nổi bật.

### 7.3. Bảng `categories`

Lưu danh mục sản phẩm để phân loại sản phẩm.

### 7.4. Bảng `brands`

Lưu thương hiệu sản phẩm như Intel, AMD, ASUS, MSI, Gigabyte, Kingston, Logitech.

### 7.5. Bảng `cart_items`

Lưu từng sản phẩm trong giỏ hàng của người dùng. Mỗi user có thể có nhiều sản phẩm trong giỏ.

### 7.6. Bảng `orders`

Lưu thông tin đơn hàng:

- User đặt hàng.
- Tổng tiền.
- Số tiền giảm.
- Phí vận chuyển.
- Thành tiền.
- Thông tin nhận hàng.
- Coupon.
- Phương thức thanh toán.
- Trạng thái đơn hàng.

### 7.7. Bảng `order_items`

Lưu chi tiết từng sản phẩm trong đơn hàng. Bảng này giúp giữ lại thông tin sản phẩm tại thời điểm đặt hàng, kể cả khi sản phẩm bị sửa hoặc xóa sau này.

### 7.8. Bảng `coupons`

Lưu mã giảm giá và các điều kiện áp dụng.

### 7.9. Bảng `reviews`

Lưu đánh giá sản phẩm của người dùng. Mỗi user chỉ được đánh giá một sản phẩm một lần theo ràng buộc unique.

## 8. Kiến trúc kỹ thuật

Website được xây dựng theo mô hình MVC:

```text
Route → Controller → Model → Database
                 ↓
              View EJS
```

### 8.1. Route

Route định nghĩa đường dẫn mà người dùng hoặc client API có thể gọi đến. Ví dụ:

- `home.routes.js`
- `product.routes.js`
- `auth.routes.js`
- `cart.routes.js`
- `order.routes.js`
- `admin.routes.js`
- `api.routes.js`

### 8.2. Controller

Controller xử lý logic nghiệp vụ:

- Nhận request.
- Lấy dữ liệu từ model.
- Validate dữ liệu cơ bản.
- Render view hoặc trả JSON.
- Chuyển lỗi đến error handler.

### 8.3. Model

Model chịu trách nhiệm thao tác với MySQL. Mỗi model tương ứng với một nhóm dữ liệu:

- `UserModel`
- `ProductModel`
- `CategoryModel`
- `BrandModel`
- `CartModel`
- `OrderModel`
- `CouponModel`
- `ReviewModel`

### 8.4. View

View sử dụng EJS để render HTML phía server. Giao diện được chia thành:

- Layout chính cho người dùng.
- Layout admin.
- Partial header, footer, product section.
- Các trang chức năng như login, register, product detail, cart, checkout.

## 9. Middleware

Website sử dụng nhiều middleware để xử lý các tác vụ dùng chung:

| Middleware | Chức năng |
| --- | --- |
| `auth.middleware.js` | Kiểm tra người dùng đã đăng nhập |
| `admin.middleware.js` | Kiểm tra quyền admin cho giao diện |
| `api-auth.middleware.js` | Kiểm tra đăng nhập cho API |
| `api-admin.middleware.js` | Kiểm tra quyền admin cho API |
| `upload.middleware.js` | Xử lý upload ảnh bằng multer |

Ngoài ra, server còn sử dụng các middleware của Express:

- `express.json()`
- `express.urlencoded()`
- `express.static()`
- `express-session`
- `cors`
- `morgan`

## 10. Giao diện

Giao diện website được thiết kế theo phong cách cửa hàng linh kiện máy tính hiện đại:

- Màu chủ đạo đỏ, trắng và xám.
- Trang chủ có banner lớn, ảnh sản phẩm thật và các khối khuyến mãi.
- Card sản phẩm có ảnh, tên, giá và nút mua hàng.
- Trang đăng nhập và đăng ký được bố trí rõ ràng.
- Trang admin có layout riêng, phục vụ thao tác quản trị.
- Giá tiền được định dạng theo chuẩn Việt Nam.
- Các lỗi tiếng Việt trên một số giao diện đã được chỉnh lại để dễ đọc hơn.

## 11. Luồng mua hàng

Luồng mua hàng cơ bản của website:

```text
Người dùng truy cập trang chủ
→ Xem hoặc tìm kiếm sản phẩm
→ Xem chi tiết sản phẩm
→ Đăng nhập hoặc đăng ký
→ Thêm sản phẩm vào giỏ hàng
→ Kiểm tra giỏ hàng
→ Điền thông tin thanh toán
→ Áp dụng mã giảm giá nếu có
→ Đặt hàng
→ Xem lịch sử và trạng thái đơn hàng
```

## 12. Luồng quản trị

Luồng quản trị cơ bản:

```text
Admin đăng nhập
→ Truy cập /admin
→ Xem dashboard
→ Quản lý sản phẩm, danh mục
→ Theo dõi đơn hàng mới
→ Cập nhật trạng thái đơn hàng
→ Kiểm tra dữ liệu qua API admin nếu cần
```

## 13. Bảo mật và phân quyền

Website đã có các cơ chế bảo mật cơ bản:

- Mật khẩu được hash bằng bcrypt.
- Session dùng để duy trì trạng thái đăng nhập.
- Route giỏ hàng và đơn hàng yêu cầu đăng nhập.
- Route admin yêu cầu quyền admin.
- API admin có middleware kiểm tra riêng.
- File `.env` dùng để cấu hình thông tin nhạy cảm.

Các cải tiến bảo mật nên bổ sung khi deploy thật:

- Thêm CSRF protection cho các form POST.
- Bật cookie secure khi chạy HTTPS.
- Đặt `SESSION_SECRET` mạnh.
- Validate dữ liệu đầu vào chặt hơn.
- Giới hạn kích thước file upload.
- Thêm rate limit cho login và API.

## 14. Điểm mạnh của website

- Có đầy đủ luồng cơ bản của một website bán hàng.
- Có phân quyền khách hàng và admin.
- Có database rõ ràng, nhiều bảng đúng nghiệp vụ.
- Có giao diện người dùng và giao diện admin riêng.
- Có API v1 để mở rộng.
- Có hỗ trợ upload ảnh sản phẩm.
- Có mã giảm giá và trạng thái đơn hàng.
- Có định dạng giá tiền Việt Nam.
- Có thể dễ dàng mở rộng thêm chức năng.

## 15. Hạn chế hiện tại

Một số điểm có thể tiếp tục hoàn thiện:

- Chưa có giao diện admin để quản lý coupon.
- Chưa có giao diện admin để quản lý user.
- Chưa có trang profile người dùng.
- Chưa có chức năng quên mật khẩu.
- Chưa có bộ lọc nâng cao theo giá, thương hiệu, sale.
- Chưa có thanh toán online thật.
- Chưa có test tự động.
- Một số file script/schema cũ vẫn có thể còn lỗi encoding trong comment hoặc dữ liệu mẫu.

## 16. Hướng phát triển trong tương lai

Website có thể được phát triển thêm theo các hướng:

- Tích hợp thanh toán online qua VNPay, MoMo hoặc Stripe.
- Thêm quản lý mã giảm giá trong admin.
- Thêm quản lý người dùng trong admin.
- Thêm dashboard doanh thu theo ngày, tháng, năm.
- Thêm lọc sản phẩm nâng cao.
- Thêm so sánh sản phẩm.
- Thêm wishlist.
- Thêm email xác nhận đơn hàng.
- Thêm reset password qua email.
- Tách frontend thành React/Vue và dùng Express như REST API backend.
- Deploy lên VPS, Docker hoặc cloud platform.

## 17. Kết luận

GearStation là một website bán linh kiện máy tính có cấu trúc tương đối đầy đủ cho một đồ án Công nghệ Web. Dự án bao gồm cả phần giao diện khách hàng, hệ thống quản trị, xử lý database, xác thực người dùng, giỏ hàng, đặt hàng, mã giảm giá và API. Với nền tảng hiện tại, website có thể tiếp tục mở rộng thành một hệ thống thương mại điện tử hoàn chỉnh hơn.

