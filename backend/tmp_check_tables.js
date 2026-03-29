const db = require('./db');
const oracledb = require('oracledb');

async function check() {
    await db.initialize();
    
    // Check MESSAGES table columns
    console.log('=== MESSAGES TABLE COLUMNS ===');
    const msgCols = await db.execute(
        `SELECT COLUMN_NAME, DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'MESSAGES' ORDER BY COLUMN_ID`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.table(msgCols.rows);

    // Check OFFERS table columns
    console.log('\n=== OFFERS TABLE COLUMNS ===');
    const offerCols = await db.execute(
        `SELECT COLUMN_NAME, DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'OFFERS' ORDER BY COLUMN_ID`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.table(offerCols.rows);

    // Check USERS table columns
    console.log('\n=== USERS TABLE COLUMNS ===');
    const userCols = await db.execute(
        `SELECT COLUMN_NAME, DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'USERS' ORDER BY COLUMN_ID`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.table(userCols.rows);

    // Check LISTINGS table columns
    console.log('\n=== LISTINGS TABLE COLUMNS ===');
    const listCols = await db.execute(
        `SELECT COLUMN_NAME, DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'LISTINGS' ORDER BY COLUMN_ID`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.table(listCols.rows);

    // Check all user data
    console.log('\n=== ALL USERS ===');
    const users = await db.execute(`SELECT ID, USERNAME, EMAIL, ROLE FROM USERS`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    console.table(users.rows);

    // Check listing count
    console.log('\n=== LISTING COUNT ===');
    const listCount = await db.execute(`SELECT COUNT(*) AS CNT FROM LISTINGS`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    console.log('Listings:', listCount.rows[0].CNT);

    // Check if FN_GET_USER_TRUST_SCORE exists
    console.log('\n=== DB OBJECTS STATUS ===');
    const objs = await db.execute(
        `SELECT OBJECT_NAME, OBJECT_TYPE, STATUS FROM USER_OBJECTS WHERE OBJECT_TYPE IN ('FUNCTION','PROCEDURE','TRIGGER') ORDER BY OBJECT_TYPE, OBJECT_NAME`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.table(objs.rows);

    await db.close();
}
check().catch(e => { console.error(e); process.exit(1); });
