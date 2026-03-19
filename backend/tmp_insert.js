const db = require('./db');
const oracledb = require('oracledb');

async function testInsert() {
  await db.initialize();
  const sql = `
      INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID)
      VALUES (:title, :description, :price, :location, :categoryId, :sellerId)
      RETURNING ID INTO :id
  `;
  
  const binds = {
      title: "Test Listing",
      description: "Test Desc",
      price: 10,
      location: "New",
      categoryId: 1,
      sellerId: 1,
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
  };

  try {
    const result = await db.execute(sql, binds);
    console.log("Insert result:", result);
    console.log("Returned ID:", result.outBinds.id[0]);
  } catch (err) {
    console.error("Insert error:", err);
  }

  await db.close();
}
testInsert();
