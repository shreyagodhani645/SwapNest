const db = require('../db');

const addToWishlist = async (req, res) => {
    const userId = Number(req.user.id);
    const listing_id = Number(req.body.listing_id);

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
        if (err.code === '23505' || err.errorNum === 1 || err.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Item is already in your wishlist' });
        }
        res.status(500).json({ message: 'Error adding to wishlist', error: err.message });
    }
};

const checkWishlist = async (req, res) => {
    const userId = Number(req.user.id);
    const listing_id = Number(req.params.listing_id);

    try {
        const checkSql = `SELECT * FROM WISHLIST WHERE USER_ID = :userId AND LISTING_ID = :listing_id`;
        const checkResult = await db.execute(checkSql, { userId, listing_id });
        res.json({ isWishlisted: checkResult.rows.length > 0 });
    } catch (err) {
        console.error('Error checking wishlist:', err);
        res.status(500).json({ message: 'Error checking wishlist', error: err.message });
    }
};

const removeFromWishlist = async (req, res) => {
    const userId = Number(req.user.id);
    const listing_id = Number(req.params.listing_id);

    try {
        await db.execute(`DELETE FROM WISHLIST WHERE USER_ID = :userId AND LISTING_ID = :listing_id`, { userId, listing_id });
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error('Error removing from wishlist:', err);
        res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
    }
};

const getWishlist = async (req, res) => {
    const userId = Number(req.user.id);
    const sql = `
        SELECT l.ID, l.TITLE, l.PRICE, l.ITEM_CONDITION AS CONDITION,
               (SELECT MIN(i.IMAGE_URL) FROM IMAGES i WHERE i.LISTING_ID = l.ID) as IMAGE_URL
        FROM WISHLIST w
        JOIN LISTINGS l ON w.LISTING_ID = l.ID
        WHERE w.USER_ID = :userId
        ORDER BY w.ADDED_AT DESC
    `;

    try {
        const result = await db.execute(sql, { userId });
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching wishlist:', err);
        res.status(500).json({ message: 'Error fetching wishlist', error: err.message });
    }
};

module.exports = { addToWishlist, checkWishlist, removeFromWishlist, getWishlist };
