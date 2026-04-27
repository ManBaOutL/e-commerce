const db = require('@/config/database');

// 1. 添加地址 (加事务：防止取消默认地址后失败，所有地址也被取消)
exports.addAddress = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { recipient_name, phone, province, city, district, street, streetNumber, address, lng, lat, type, is_default } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        if (is_default) {
            await connection.execute(`UPDATE \`address\` SET is_default = 0 WHERE user_id = ?`, [user_id]);
        }
        await connection.execute(
            `INSERT INTO \`address\` (user_id, recipient_name, phone, province, city, district, street, streetNumber, address, lng, lat, type, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, recipient_name, phone, province, city, district, street, streetNumber, address, lng, lat, type || '其他', is_default ? 1 : 0]
        );
        await connection.commit();
        res.json({ success: true, message: '添加成功', status: 200, data: null });
    } catch (err) {
        await connection.rollback();
        console.error('添加地址异常:', err);
        res.status(500).json({ success: false, message: '添加失败', status: 500, data: null });
    } finally {
        connection.release();
    }
};

// 2. 获取地址列表
exports.getList = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    try {
        const [rows] = await db.execute(
            `SELECT * FROM \`address\` WHERE user_id = ? ORDER BY is_default DESC, create_time DESC`, 
            [user_id]
        );
        rows.forEach(r => r.is_default = !!r.is_default); 
        res.json({ success: true, message: '获取成功', status: 200, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: '获取失败', status: 500, data: null });
    }
};

// 3. 修改地址 (加事务)
exports.updateAddress = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { address_id, recipient_name, phone, province, city, district, street, streetNumber, address, lng, lat, type, is_default } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        if (is_default) {
            await connection.execute(`UPDATE \`address\` SET is_default = 0 WHERE user_id = ?`, [user_id]);
        }
        await connection.execute(
            `UPDATE \`address\` SET recipient_name=?, phone=?, province=?, city=?, district=?, street=?, streetNumber=?, address=?, lng=?, lat=?, type=?, is_default=? 
             WHERE address_id=? AND user_id=?`,
            [recipient_name, phone, province, city, district, street, streetNumber, address, lng, lat, type || '其他', is_default ? 1 : 0, address_id, user_id]
        );
        await connection.commit();
        res.json({ success: true, message: '修改成功', status: 200, data: null });
    } catch (err) {
        await connection.rollback();
        console.error('修改地址异常:', err);
        res.status(500).json({ success: false, message: '修改失败', status: 500, data: null });
    } finally {
        connection.release();
    }
};

// 4. 删除地址
exports.deleteAddress = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { address_id } = req.body;
    try {
        await db.execute(`DELETE FROM \`address\` WHERE address_id = ? AND user_id = ?`, [address_id, user_id]);
        res.json({ success: true, message: '删除成功', status: 200, data: null });
    } catch (err) {
        res.status(500).json({ success: false, message: '删除失败', status: 500, data: null });
    }
};

// 5. 单独设为默认地址 (加事务)
exports.setDefault = async (req, res) => {
    const user_id = req.user.user_id || req.user.id;
    const { address_id } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        await connection.execute(`UPDATE \`address\` SET is_default = 0 WHERE user_id = ?`, [user_id]);
        await connection.execute(`UPDATE \`address\` SET is_default = 1 WHERE address_id = ? AND user_id = ?`, [address_id, user_id]);
        await connection.commit();
        res.json({ success: true, message: '设置成功', status: 200, data: null });
    } catch (err) {
        await connection.rollback();
        console.error('设为默认异常:', err);
        res.status(500).json({ success: false, message: '设置失败', status: 500, data: null });
    } finally {
        connection.release();
    }
};