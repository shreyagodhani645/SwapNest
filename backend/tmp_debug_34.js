const db = require('./db');
const oracledb = require('oracledb');

async function debug500() {
  await db.initialize();
  const id = "34";
  
  try {
      const listingSql = `
          SELECT l.*, c.NAME as CATEGORY_NAME, u.USERNAME as SELLER_NAME, u.EMAIL as SELLER_EMAIL
          FROM LISTINGS l
          JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
          JOIN USERS u ON l.SELLER_ID = u.ID
          WHERE l.ID = :id
      `;
      const listingResult = await db.execute(listingSql, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      console.log('ListingResult:', listingResult.rows);
      
      const imagesSql = `SELECT IMAGE_URL FROM IMAGES WHERE LISTING_ID = :id`;
      const imagesResult = await db.execute(imagesSql, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      console.log('ImagesResult:', imagesResult.rows);
  } catch(e) {
      console.error("DB QUERY THREW EXCEPTION:");
      console.error(e);
  }
  
  await db.close();
}
debug500();
