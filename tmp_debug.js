const db = require('./backend/db');
const oracledb = require('oracledb');

async function debugListings() {
    try {
        await db.initialize();
        const res = await db.execute(`SELECT ID, TITLE, SELLER_ID, CATEGORY_ID FROM LISTINGS ORDER BY ID DESC FETCH FIRST 5 ROWS ONLY`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        console.log("Recent Listings:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await db.close();
        process.exit();
    }
}

debugListings();
