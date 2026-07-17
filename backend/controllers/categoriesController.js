const db = require('../db');

// POST /api/categories
const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    try {
        // Insert new category, ignore if already exists
        const sql = `INSERT INTO CATEGORIES (NAME) VALUES (:name) RETURNING ID`;
        const result = await db.execute(sql, { name });
        const categoryId = result.rows[0].ID;
        res.status(201).json({ id: categoryId, name });
    } catch (err) {
        if (err.message.includes('unique constraint') || err.code === '23505') {
            // Category already exists, fetch its ID
            try {
                const fetchSql = `SELECT ID FROM CATEGORIES WHERE NAME = :name`;
                const fetchResult = await db.execute(fetchSql, { name });
                if (fetchResult.rows.length > 0) {
                    return res.status(200).json({ id: fetchResult.rows[0].ID, name });
                }
            } catch (fetchErr) {}
        }
        res.status(500).json({ message: 'Error creating category', error: err.message });
    }
};

module.exports = { createCategory };