const db = require('./backend/db');

async function testWishlist() {
    await db.initialize();
    try {
        const userId = 1;
        const listing_id = 9; // Hardcoded listing id that exists
        
        const checkSql = `SELECT * FROM WISHLIST WHERE USER_ID = :userId AND LISTING_ID = :listing_id`;
        const checkResult = await db.execute(checkSql, { userId, listing_id });
        console.log("Check rows length:", checkResult.rows.length);
        
        if (checkResult.rows.length === 0) {
            console.log("Attempting insert...");
            await db.execute(`INSERT INTO WISHLIST (USER_ID, LISTING_ID) VALUES (:userId, :listing_id)`, { userId, listing_id });
            console.log("Insert success!");
        } else {
            console.log("Already exists.");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await db.close();
    }
}
testWishlist();
