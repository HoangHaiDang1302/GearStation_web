// Utility/Helper functions

/**
 * Format date to Vietnamese locale
 * @param {Date} date
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
 * Slugify Vietnamese string
 * @param {string} str
 * @returns {string}
 */
const slugify = (str) => {
    str = str.toLowerCase();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    str = str.replace(/[^a-z0-9\s-]/g, '');
    str = str.replace(/[\s-]+/g, '-');
    str = str.replace(/^-+|-+$/g, '');
    return str;
};

module.exports = {
    formatDate,
    slugify
};
