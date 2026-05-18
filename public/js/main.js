// Main JavaScript file cho GearStation

console.log('CNWeb App loaded!');

// ============================================
// CART API INTEGRATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Intercept "Thêm vào giỏ hàng" forms
    const addCartForms = document.querySelectorAll('.add-to-cart-form');
    
    addCartForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Ngăn chặn reload trang
            
            const productId = form.querySelector('input[name="productId"]').value;
            const quantityInput = form.querySelector('input[name="quantity"]');
            const quantity = quantityInput ? quantityInput.value : 1;
            const submitBtn = form.querySelector('button[type="submit"]');

            // Hiển thị trạng thái loading
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang thêm...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/v1/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ productId, quantity })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Thành công: Cập nhật số lượng trên icon giỏ hàng ở Header
                    updateCartBadge(data.data.cartCount);
                    
                    // Hiển thị thông báo (tạm thời dùng alert, có thể thay bằng Toast notification)
                    showToast('Thành công', 'Đã thêm sản phẩm vào giỏ hàng!', 'success');
                } else {
                    // Thất bại (ví dụ: chưa đăng nhập)
                    if (response.status === 401) {
                        window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
                    } else {
                        showToast('Lỗi', data.message || 'Có lỗi xảy ra', 'error');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi thêm vào giỏ:', error);
                showToast('Lỗi', 'Không thể kết nối đến server.', 'error');
            } finally {
                // Khôi phục nút
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    });

    // 2. Use cart APIs for quantity updates on cart page
    const updateQtyForms = document.querySelectorAll('.update-qty-form');

    updateQtyForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productId = form.querySelector('input[name="productId"]').value;
            const quantity = e.submitter ? e.submitter.value : form.querySelector('button[name="quantity"]').value;

            try {
                const response = await fetch('/api/v1/cart/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ productId, quantity })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    updateCartBadge(data.data.cartCount);
                    window.location.reload();
                } else if (response.status === 401) {
                    window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
                } else {
                    showToast('Loi', data.message || 'Khong the cap nhat gio hang', 'error');
                }
            } catch (error) {
                console.error('Update cart error:', error);
                showToast('Loi', 'Khong the ket noi den server.', 'error');
            }
        });
    });

    // 3. Use cart APIs for item removal on cart page
    const removeForms = document.querySelectorAll('.remove-form');

    removeForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productId = form.querySelector('input[name="productId"]').value;

            try {
                const response = await fetch('/api/v1/cart/remove', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ productId })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    updateCartBadge(data.data.cartCount);
                    window.location.reload();
                } else if (response.status === 401) {
                    window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
                } else {
                    showToast('Loi', data.message || 'Khong the xoa san pham', 'error');
                }
            } catch (error) {
                console.error('Remove cart item error:', error);
                showToast('Loi', 'Khong the ket noi den server.', 'error');
            }
        });
    });

});

// Hàm cập nhật số lượng badge trên Header
function updateCartBadge(count) {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = count;
        // Thêm animation nhẹ
        badge.classList.remove('pulse-animation');
        void badge.offsetWidth; // trigger reflow
        badge.classList.add('pulse-animation');
    });
}

// Simple Toast Notification Function
function showToast(title, message, type = 'success') {
    // Nếu bạn có thư viện Toast (như Toastify hoặc SweetAlert), hãy dùng ở đây.
    // Nếu không, tạm dùng alert.
    alert(`${title}: ${message}`);
}
