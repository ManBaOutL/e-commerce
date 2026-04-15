const db = require('@/config/database');

exports.getAllProduct = async (req, res) => {
    console.log(req.user);

    const result = await db.query('SELECT * FROM products');
    res.json(result);
}