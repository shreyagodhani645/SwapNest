const db = require('../db');
const oracledb = require('oracledb');

const addToWishlist = async (req, res) => {
    const userId = parseInt(req.user.id);
    const listing_id = parseInt(req.body.listing_id);

    if (!listing_id) return res.status(400).json({ message: 'Listing ID is required' });

    try {
        const checkSql = `SELECT * FROM WISHLIST WHERE USER_ID = :userId AND LISTING_ID = :listing_id`;
        const checkResult = await db.execute(checkSql, { userId, listing_id });
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'Item is already in your wishlist' });
        }
        
        await db.execute(`INSERT INTO WISHLIST (USER_ID, LISTING_ID) VALUES (:userId, :listing_id)`, { userId, listing_id });
        res.status(201).json({ message: 'Added to wishlist' });
    } catch (err) {
        console.error('Wishlist Insert Error:', err);
        // Catch ORA-00001: unique constraint violated
        if (err.errorNum === 1 || err.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Item is already in your wishlist' });
        }
        res.status(500).json({ message: 'Error adding to wishlist', error: err.message });
    }
};

const checkWishlist = async (req, res) => {
    const userId = req.user.id;
    const { listing_id } = req.params;

    try {
        const checkSql = `SELECT * FROM WISHLIST WHERE USER_ID = :userId AND LISTING_ID = :listing_id`;
        const checkResult = await db.execute(checkSql, { userId, listing_id });
        res.json({ isWishlisted: checkResult.rows.length > 0 });
    } catch (err) {
        res.status(500).json({ message: 'Error checking wishlist', error: err.message });
    }
};

const removeFromWishlist = async (req, res) => {
    const userId = req.user.id;
    const { listing_id } = req.params;

    try {
        await db.execute(`DELETE FROM WISHLIST WHERE USER_ID = :userId AND LISTING_ID = :listing_id`, { userId, listing_id });
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
    }
};

const getWishlist = async (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT l.ID, l.TITLE, l.PRICE, l.LOCATION AS CONDITION,
               (SELECT MIN(i.IMAGE_URL) FROM IMAGES i WHERE i.LISTING_ID = l.ID) as IMAGE_URL
        FROM WISHLIST w
        JOIN LISTINGS l ON w.LISTING_ID = l.ID
        WHERE w.USER_ID = :userId
        ORDER BY w.ADDED_AT DESC
    `;

    try {
        const result = await db.execute(sql, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching wishlist', error: err.message });
    }
};

module.exports = { addToWishlist, checkWishlist, removeFromWishlist, getWishlist };
