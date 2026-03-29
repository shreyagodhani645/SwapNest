const db = require('../db');
const oracledb = require('oracledb');

const getPublicProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        // Get Basic User Info
        const userSql = `SELECT ID, USERNAME, EMAIL, PHONE, PROFILE_PICTURE, CREATED_AT FROM USERS WHERE ID = :userId`;
        const userResult = await db.execute(userSql, { userId: Number(userId) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Always get listings count first (needed regardless of trust score path)
        const listingsSql = `SELECT COUNT(*) as COUNT FROM LISTINGS WHERE SELLER_ID = :userId`;
        const listingsRes = await db.execute(listingsSql, { userId: Number(userId) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const listingsCount = listingsRes.rows[0].COUNT;

        // Calculate Trust Score — try Oracle Function first, fallback to manual
        let trustScore = 0;
        try {
            const trustResult = await db.execute(
                `SELECT FN_GET_USER_TRUST_SCORE(:userId) AS TRUST_SCORE FROM DUAL`,
                { userId: Number(userId) }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            trustScore = trustResult.rows[0].TRUST_SCORE;
        } catch (fnErr) {
            // Fallback: calculate manually if function doesn't exist or is invalid
            console.log('FN_GET_USER_TRUST_SCORE unavailable, using manual calculation');
            const offersSql = `SELECT COUNT(*) as COUNT FROM OFFERS WHERE BUYER_ID = :userId OR SELLER_ID = :userId`;
            const messagesSql = `SELECT COUNT(*) as COUNT FROM MESSAGES WHERE SENDER_ID = :userId`;

            const [offersRes, messagesRes] = await Promise.all([
                db.execute(offersSql, { userId: Number(userId) }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
                db.execute(messagesSql, { userId: Number(userId) }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
            ]);

            const totalActivity = offersRes.rows[0].COUNT + messagesRes.rows[0].COUNT;
            trustScore = Math.min((listingsCount * 12) + (totalActivity * 2), 100);
        }
        user.TRUST_SCORE = trustScore;

        // Get User Listings
        const listingsDetailsSql = `
            SELECT l.ID, l.TITLE, l.PRICE, l.LOCATION, 
                   (SELECT i.IMAGE_URL FROM IMAGES i WHERE i.LISTING_ID = l.ID AND ROWNUM = 1) as IMAGE_URL
            FROM LISTINGS l 
            WHERE l.SELLER_ID = :userId 
            ORDER BY l.CREATED_AT DESC
        `;
        const listingsDetailsRes = await db.execute(listingsDetailsSql, { userId: Number(userId) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        user.LISTINGS = listingsDetailsRes.rows;
        user.LISTINGS_COUNT = listingsCount;

        res.json(user);
    } catch (err) {
        console.error('Error in getPublicProfile:', err);
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
};

const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username, phone } = req.body;

    try {
        let profilePicture = null;
        if (req.file) {
            profilePicture = `/uploads/${req.file.filename}`;
        }

        // Build dynamic update query - email is NO LONGER updatable
        let updateSql = `
            UPDATE USERS 
            SET USERNAME = :username, 
                PHONE = :phone
        `;
        const binds = { 
            username, 
            phone: phone || null, 
            userId: Number(userId)
        };

        if (profilePicture) {
            updateSql += `, PROFILE_PICTURE = :profilePicture`;
            binds.profilePicture = profilePicture;
        }
        
        updateSql += ` WHERE ID = :userId`;

        await db.execute(updateSql, binds);

        // Fetch and return updated user info
        const updatedUserSql = `SELECT ID, USERNAME, EMAIL, PHONE, PROFILE_PICTURE FROM USERS WHERE ID = :userId`;
        const updatedUserResult = await db.execute(updatedUserSql, { userId: Number(userId) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        res.json({
            message: 'Profile updated successfully',
            user: updatedUserResult.rows[0]
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
};

module.exports = { getPublicProfile, updateProfile };
