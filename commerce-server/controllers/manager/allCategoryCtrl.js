const db = require('@/config/database');

exports.getAllCategory = async (req, res) => {
    const listSql = `SELECT * FROM category`;
    const [rows] = await db.query(listSql);
    return res.json({
        status: 200,
        success: true,
        message: '获取分类成功',
        data: rows
    });
}

exports.updateCategoryStatus = async (req, res) => {
    const { category_id: categoryId, newCategory, operation } = req.body;
    console.log("update分类表:", categoryId, "操作类型:", operation, "新分类:", newCategory);
    if (operation === 'delete') {
        try {
            const deleteSql = `DELETE FROM category WHERE category_id in (?)`;
            await db.query(deleteSql, [categoryId]);
            return res.json({
                status: 200,
                success: true,
                message: '删除分类成功',
                data: true
            });
        } catch (error) {
            console.error("删除分类失败:", error);
            return res.json({
                status: 500,
                success: false,
                message: '删除分类失败',
                data: false
            });
        }
    }
    else if (operation === 'add') {
        try {
            const addSql = `INSERT INTO category (name, parent_id) VALUES (?, ?);`;
            await db.query(addSql, [newCategory.name, newCategory.parent_id]);
            return res.json({
                status: 200,
                success: true,
                message: '新增分类成功',
                data: true
            });
        } catch (error) {
            console.error("新增分类失败:", error);
            return res.json({
                status: 500,
                success: false,
                message: '新增分类失败',
                data: false
            });
        }
    }
    else if (operation === 'update') {
        try {
            const updateSql = `UPDATE category SET name = ? WHERE category_id = ?`;
            await db.query(updateSql, [newCategory.name, categoryId]);
            return res.json({
                status: 200,
                success: true,
                message: '修改分类名成功',
                data: true
            });
        } catch (error) {
            console.error("修改分类名失败:", error);
            return res.json({
                status: 500,
                success: false,
                message: '修改分类名失败',
                data: false
            });
        }
    }
    else {
        return res.json({
            status: 400,
            success: false,
            message: '操作类型错误',
            data: false
        });
    }
    const updateSql = `UPDATE category SET name = ? WHERE id = ?`;
    await db.query(updateSql, [newCategory.name, categoryId]);
    return res.json({
        status: 200,
        success: true,
        message: '更新分类状态成功',
        data: true
    });
}
