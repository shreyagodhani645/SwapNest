const db = require('../db');

// POST /api/offers — Create a new offer
const createOffer = async (req, res) => {
    const { listing_id, amount } = req.body;
    const buyerId = Number(req.user.id);

    if (!listing_id || !amount) {
        return res.status(400).json({ message: 'Listing ID and amount are required' });
    }

    try {
        // Get seller ID from listing
        const listingSql = `SELECT SELLER_ID, STATUS FROM LISTINGS WHERE ID = :listing_id`;
        const listingResult = await db.execute(listingSql, { listing_id: Number(listing_id) });

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = listingResult.rows[0];

        if (listing.STATUS === 'sold') {
            return res.status(400).json({ message: 'This listing has been sold' });
        }

        if (listing.SELLER_ID === buyerId) {
            return res.status(400).json({ message: 'You cannot make an offer on your own listing' });
        }

        // Schema only has OFFER_PRICE (no AMOUNT column) — fixed from previous version
        const sql = `
            INSERT INTO OFFERS (LISTING_ID, BUYER_ID, SELLER_ID, OFFER_PRICE, STATUS)
            VALUES (:listing_id, :buyerId, :sellerId, :offerPrice, 'pending')
        `;
        await db.execute(sql, {
            listing_id: Number(listing_id),
            buyerId,
            sellerId: listing.SELLER_ID,
            offerPrice: Number(amount)
        });

        res.status(201).json({ message: 'Offer submitted successfully' });
    } catch (err) {
        console.error('Error creating offer:', err);
        res.status(500).json({ message: 'Error creating offer', error: err.message });
    }
};

// PATCH /api/offers/:id — Update offer status (accept/reject)
const updateOfferStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = Number(req.user.id);

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        if (status === 'accepted') {
            // Oracle SP_ACCEPT_OFFER OUT-bind call removed — not supported by the
            // Postgres db.js shim. Using the manual SQL path directly instead.
            const checkSql = `SELECT SELLER_ID, LISTING_ID FROM OFFERS WHERE ID = :id`;
            const checkResult = await db.execute(checkSql, { id: Number(id) });
            if (checkResult.rows.length === 0) return res.status(404).json({ message: 'Offer not found' });
            if (checkResult.rows[0].SELLER_ID !== userId) return res.status(403).json({ message: 'Only the seller can update this offer' });

            const listingId = checkResult.rows[0].LISTING_ID;
            await db.execute(`UPDATE OFFERS SET STATUS = 'accepted' WHERE ID = :id`, { id: Number(id) });
            // Reject competing offers
            await db.execute(
                `UPDATE OFFERS SET STATUS = 'rejected' WHERE LISTING_ID = :listingId AND ID != :id AND LOWER(STATUS) = 'pending'`,
                { listingId, id: Number(id) }
            );
            await db.execute(`UPDATE LISTINGS SET STATUS = 'reserved' WHERE ID = :listingId`, { listingId });
            return res.json({ message: 'Offer accepted, competing offers rejected' });
        } else {
            // Rejection
            const checkSql = `SELECT SELLER_ID FROM OFFERS WHERE ID = :id`;
            const checkResult = await db.execute(checkSql, { id: Number(id) });
            if (checkResult.rows.length === 0) return res.status(404).json({ message: 'Offer not found' });
            if (checkResult.rows[0].SELLER_ID !== userId) return res.status(403).json({ message: 'Only the seller can update this offer' });

            await db.execute(`UPDATE OFFERS SET STATUS = :status WHERE ID = :id`, { status, id: Number(id) });
            res.json({ message: `Offer ${status}` });
        }
    } catch (err) {
        console.error('Error updating offer status:', err);
        res.status(500).json({ message: 'Error updating offer status', error: err.message });
    }
};

// GET /api/offers/my-listings — Get offers on my listings (seller view)
const getMyListingsOffers = async (req, res) => {
    const userId = Number(req.user.id);

    try {
        const sql = `
            SELECT o.ID, o.LISTING_ID, o.BUYER_ID,
                   o.OFFER_PRICE AS AMOUNT,
                   o.STATUS, o.CREATED_AT,
                   u.USERNAME AS BUYER_NAME, l.TITLE AS LISTING_TITLE
            FROM OFFERS o
            JOIN USERS u ON o.BUYER_ID = u.ID
            JOIN LISTINGS l ON o.LISTING_ID = l.ID
            WHERE o.SELLER_ID = :userId
            ORDER BY o.CREATED_AT DESC
        `;
        const result = await db.execute(sql, { userId });
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching offers:', err);
        res.status(500).json({ message: 'Error fetching offers', error: err.message });
    }
};

// GET /api/offers/my-sent — Get offers I've sent (buyer view)
const getMySentOffers = async (req, res) => {
    const userId = Number(req.user.id);

    try {
        const sql = `
            SELECT o.ID, o.LISTING_ID,
                   o.OFFER_PRICE AS AMOUNT,
                   o.STATUS, o.CREATED_AT,
                   l.TITLE AS LISTING_TITLE, l.PRICE AS LISTING_PRICE,
                   u.USERNAME AS SELLER_NAME
            FROM OFFERS o
            JOIN LISTINGS l ON o.LISTING_ID = l.ID
            JOIN USERS u ON o.SELLER_ID = u.ID
            WHERE o.BUYER_ID = :userId
            ORDER BY o.CREATED_AT DESC
        `;
        const result = await db.execute(sql, { userId });
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sent offers:', err);
        res.status(500).json({ message: 'Error fetching sent offers', error: err.message });
    }
};

module.exports = { createOffer, updateOfferStatus, getMyListingsOffers, getMySentOffers };