const db = require('./db');
const oracledb = require('oracledb');

async function testWishlistFix() {
    await db.initialize();
    try {
        const sql = `
            SELECT l.ID, l.TITLE, l.PRICE, l.ITEM_CONDITION AS CONDITION,
                   (SELECT MIN(i.IMAGE_URL) FROM IMAGES i WHERE i.LISTING_ID = l.ID) as IMAGE_URL
            FROM WISHLIST w
            JOIN LISTINGS l ON w.LISTING_ID = l.ID
            WHERE rownum <= 1
        `;
        const result = await db.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        console.log('Test successful. Row count:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('Condition field exists:', result.rows[0].CONDITION !== undefined);
        }
    } catch (err) {
        console.error('Error during query:', err.message);
    } finally {
        await db.close();
    }
}

testWishlistFix();
