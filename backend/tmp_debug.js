const db = require('./db');
const oracledb = require('oracledb');

async function testQuery() {
  await db.initialize();
  const id = 1;
  const listingSql = `
        SELECT l.*, c.NAME as CATEGORY_NAME, u.USERNAME as SELLER_NAME, u.EMAIL as SELLER_EMAIL
        FROM LISTINGS l
        JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
        JOIN USERS u ON l.SELLER_ID = u.ID
        WHERE l.ID = :id
    `;
  const result = await db.execute(listingSql, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  console.log("SQL Result length:", result.rows.length);
  if (result.rows.length === 0) {
     console.log("Checking why it's 0... ID in db?");
     const check = await db.execute(`SELECT ID, CATEGORY_ID, SELLER_ID FROM LISTINGS WHERE ID = :id`, { id });
     console.log("Bare check:", check.rows);
  }
  await db.close();
}
testQuery();
