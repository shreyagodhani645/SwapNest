const db = require('../db');
const oracledb = require('oracledb');

const createOffer = async (req, res) => {
    const { listing_id, amount } = req.body;
    const buyer_id = req.user.id;

    try {
        const getSellerSql = `SELECT SELLER_ID FROM LISTINGS WHERE ID = :listing_id`;
        const sellerResult = await db.execute(getSellerSql, { listing_id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (sellerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        const seller_id = sellerResult.rows[0].SELLER_ID;

        const sql = `
            INSERT INTO OFFERS (LISTING_ID, BUYER_ID, SELLER_ID, OFFER_PRICE, STATUS)
            VALUES (:listing_id, :buyer_id, :seller_id, :amount, 'pending')
        `;
        await db.execute(sql, { listing_id, buyer_id, seller_id, amount });
        res.status(201).json({ message: 'Offer sent successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating offer', error: err.message });
    }
};

const updateOfferStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    const userId = req.user.id;

    try {
        const sql = `UPDATE OFFERS SET STATUS = :status WHERE ID = :id AND SELLER_ID = :userId`;
        const result = await db.execute(sql, { status, id, userId });

        if (result.rowsAffected === 0) {
            return res.status(403).json({ message: 'Unauthorized or offer not found' });
        }

        res.json({ message: `Offer ${status.toLowerCase()}` });
    } catch (err) {
        res.status(500).json({ message: 'Error updating offer', error: err.message });
    }
};

const getMyListingsOffers = async (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT o.ID, o.OFFER_PRICE as AMOUNT, o.STATUS, o.LISTING_ID, 
               l.TITLE, u.USERNAME as BUYER_NAME
        FROM OFFERS o
        JOIN LISTINGS l ON o.LISTING_ID = l.ID
        JOIN USERS u ON o.BUYER_ID = u.ID
        WHERE l.SELLER_ID = :userId
        ORDER BY o.CREATED_AT DESC
    `;

    try {
        const result = await db.execute(sql, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching offers', error: err.message });
    }
};

module.exports = { createOffer, updateOfferStatus, getMyListingsOffers };
