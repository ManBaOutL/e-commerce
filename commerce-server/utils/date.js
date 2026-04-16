/**
 * 将ISO时间字符串转为 YYYY-MM-DD 格式
 * @param {string} isoTime - ISO 8601时间字符串（如 2026-04-09T13:02:49.000Z）
 * @returns {string} 格式化后的日期（如 2026-04-09）
 */
exports.formatIsoDate = (isoTime, format = true) => {
    if (!isoTime) return '';
    const date = new Date(isoTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    if (format) {
        return `${year}-${month}-${day}`;
    }
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};
