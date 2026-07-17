const db = require('../db');

const getPublicProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const userSql = `SELECT ID, USERNAME, EMAIL, PHONE, PROFILE_PICTURE, CREATED_AT FROM USERS WHERE ID = :userId`;
        const userResult = await db.execute(userSql, { userId: Number(userId) });

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        const listingsSql = `SELECT COUNT(*) as COUNT FROM LISTINGS WHERE SELLER_ID = :userId`;
        const listingsRes = await db.execute(listingsSql, { userId: Number(userId) });
        const listingsCount = Number(listingsRes.rows[0].COUNT);

        let trustScore = 0;
        try {
            const trustResult = await db.execute(
                `SELECT FN_GET_USER_TRUST_SCORE(:userId) AS TRUST_SCORE`,
                { userId: Number(userId) }
            );
            trustScore = trustResult.rows[0].TRUST_SCORE;
        } catch (fnErr) {
            console.log('FN_GET_USER_TRUST_SCORE unavailable, using manual calculation');
            const offersSql = `SELECT COUNT(*) as COUNT FROM OFFERS WHERE BUYER_ID = :userId OR SELLER_ID = :userId`;
            const messagesSql = `SELECT COUNT(*) as COUNT FROM MESSAGES WHERE SENDER_ID = :userId`;

            const [offersRes, messagesRes] = await Promise.all([
                db.execute(offersSql, { userId: Number(userId) }),
                db.execute(messagesSql, { userId: Number(userId) })
            ]);

            const totalActivity = Number(offersRes.rows[0].COUNT) + Number(messagesRes.rows[0].COUNT);
            trustScore = Math.min((listingsCount * 12) + (totalActivity * 2), 100);
        }
        user.TRUST_SCORE = trustScore;

        const listingsDetailsSql = `
            SELECT l.ID, l.TITLE, l.PRICE, l.LOCATION, 
                   (SELECT i.IMAGE_URL FROM IMAGES i WHERE i.LISTING_ID = l.ID LIMIT 1) as IMAGE_URL
            FROM LISTINGS l 
            WHERE l.SELLER_ID = :userId 
            ORDER BY l.CREATED_AT DESC
        `;
        const listingsDetailsRes = await db.execute(listingsDetailsSql, { userId: Number(userId) });

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

        const updatedUserSql = `SELECT ID, USERNAME, EMAIL, PHONE, PROFILE_PICTURE FROM USERS WHERE ID = :userId`;
        const updatedUserResult = await db.execute(updatedUserSql, { userId: Number(userId) });

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
