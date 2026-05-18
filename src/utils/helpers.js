// Utility/Helper functions

/**
 * Format date to Vietnamese locale.
 * @param {Date|string} date
 * @returns {string}
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

/**
 * Format money as Vietnamese Dong.
 * @param {number|string|null} value
 * @returns {string}
 */
const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    });
};

/**
 * Slugify Vietnamese string.
 * @param {string} str
 * @returns {string}
 */
const slugify = (str) => {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

module.exports = {
    formatDate,
    formatCurrency,
    slugify
};
