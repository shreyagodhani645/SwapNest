const db = require('./db');
const oracledb = require('oracledb');

async function testQueryString() {
  await db.initialize();
  const id = "1"; // test with string
  const listingSql = `
        SELECT l.*, c.NAME as CATEGORY_NAME, u.USERNAME as SELLER_NAME, u.EMAIL as SELLER_EMAIL
        FROM LISTINGS l
        JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
        JOIN USERS u ON l.SELLER_ID = u.ID
        WHERE l.ID = :id
    `;
  const result = await db.execute(listingSql, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  console.log("SQL Result length with String param:", result.rows.length);
  await db.close();
}
testQueryString();
