const db = require('./db');
const oracledb = require('oracledb');

async function testListings() {
    await db.initialize();
    try {
        const sql = `
            SELECT l.ID, 
                   l.TITLE, 
                   l.PRICE, 
                   l.ITEM_CONDITION, 
                   l.LOCATION,
                   c.NAME AS CATEGORY_NAME, 
                   MIN(i.IMAGE_URL) AS IMAGE_URL
            FROM LISTINGS l
            JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
            LEFT JOIN IMAGES i ON l.ID = i.LISTING_ID
            WHERE 1=1
            GROUP BY l.ID, l.TITLE, l.PRICE, l.ITEM_CONDITION, l.LOCATION, c.NAME, l.CREATED_AT
            ORDER BY l.CREATED_AT DESC
        `;
        const result = await db.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        console.log('Query successful, found rows:', result.rows.length);
        console.log('Zero ORA errors!');
    } catch (err) {
        console.error('Error during query:', err.message);
    } finally {
        await db.close();
    }
}

testListings();
