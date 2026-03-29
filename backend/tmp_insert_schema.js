const db = require('./db');
const oracledb = require('oracledb');

async function testInsert() {
    await db.initialize();
    try {
        const sql = `
            INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, ITEM_CONDITION, CATEGORY_ID, SELLER_ID)
            VALUES ('Test', 'desc', 10, 'loc', 'New', 1, 1)
            RETURNING ID INTO :id
        `;
        const binds = {
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };
        const result = await db.execute(sql, binds);
        console.log('Insert successful, ID:', result.outBinds.id[0]);
    } catch (err) {
        console.error('Error during insert:', err.message);
    } finally {
        await db.close();
    }
}

testInsert();
