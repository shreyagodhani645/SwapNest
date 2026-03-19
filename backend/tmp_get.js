const db = require('./db');
const oracledb = require('oracledb');

async function testQuery() {
  await db.initialize();
  const sql = `
        SELECT l.ID, 
               l.TITLE, 
               l.PRICE, 
               l.LOCATION AS CONDITION, 
               c.NAME AS CATEGORY_NAME, 
               MIN(i.IMAGE_URL) AS IMAGE_URL
        FROM LISTINGS l
        JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
        LEFT JOIN IMAGES i ON l.ID = i.LISTING_ID
        WHERE 1=1
        GROUP BY l.ID, l.TITLE, l.PRICE, l.LOCATION, c.NAME, l.CREATED_AT
        ORDER BY l.CREATED_AT DESC
    `;
  const result = await db.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  console.log("First row returned:", result.rows[0]);
  await db.close();
}
testQuery();
