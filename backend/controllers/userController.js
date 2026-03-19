const db = require('../db');
const oracledb = require('oracledb');

const getPublicProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        // Get Basic User Info
        const userSql = `SELECT ID, USERNAME, EMAIL, CREATED_AT FROM USERS WHERE ID = :userId`;
        const userResult = await db.execute(userSql, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Calculate Trust Score Metrics
        const listingsSql = `SELECT COUNT(*) as COUNT FROM LISTINGS WHERE SELLER_ID = :userId`;
        const offersSql = `SELECT COUNT(*) as COUNT FROM OFFERS WHERE BUYER_ID = :userId OR SELLER_ID = :userId`;
        const messagesSql = `SELECT COUNT(*) as COUNT FROM MESSAGES WHERE SENDER_ID = :userId`;

        const [listingsRes, offersRes, messagesRes] = await Promise.all([
            db.execute(listingsSql, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
            db.execute(offersSql, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
            db.execute(messagesSql, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
        ]);

        const listingsCount = listingsRes.rows[0].COUNT;
        const totalActivity = offersRes.rows[0].COUNT + messagesRes.rows[0].COUNT;
        
        // Dynamic Trust Score Calculation
        const trustScore = (listingsCount * 12) + (totalActivity * 2);
        user.TRUST_SCORE = Math.min(trustScore, 100); // Cap at 100

        // Get User Listings
        const listingsDetailsSql = `
            SELECT l.ID, l.TITLE, l.PRICE, l.LOCATION, 
                   (SELECT i.IMAGE_URL FROM IMAGES i WHERE i.LISTING_ID = l.ID FETCH FIRST 1 ROWS ONLY) as IMAGE_URL
            FROM LISTINGS l 
            WHERE l.SELLER_ID = :userId 
            ORDER BY l.CREATED_AT DESC
        `;
        const listingsDetailsRes = await db.execute(listingsDetailsSql, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        user.LISTINGS = listingsDetailsRes.rows;
        user.LISTINGS_COUNT = listingsCount;

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
};

module.exports = { getPublicProfile };
