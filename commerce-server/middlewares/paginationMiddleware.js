/**
 * 分页中间件：解析分页参数 & 挂载分页计算方法
 */
const paginationMiddleware = (req, res, next) => {
    console.log("中间件pagination请求参数:", req.query)
    // 1. 解析分页参数（默认值：第1页，每页10条）
    const currentPage = parseInt(req.query.currentPage) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // 2. 参数校验（防止非法值）
    req.pagination = {
        currentPage: currentPage < 1 ? 1 : currentPage,
        pageSize: pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize), // 限制最大页容量
        offset: (currentPage - 1) * pageSize // 计算数据库偏移量
    };

    // 3. 挂载分页结果组装方法
    req.pagination.formatResult = (total) => {
        const totalPages = Math.ceil(total / req.pagination.pageSize);
        return {
            currentPage: req.pagination.currentPage,
            pageSize: req.pagination.pageSize,
            total,
            totalPages
        };
    };

    next();
};

module.exports = paginationMiddleware;