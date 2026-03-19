const db = require('./db');

async function check() {
    try {
        console.log("Initializing DB pool...");
        await db.initialize();
        
        console.log("Checking DB connection...");
        const result = await db.execute("SELECT table_name FROM user_tables", {}, { outFormat: 4002 }); // oracledb.OUT_FORMAT_OBJECT is usually 4002
        console.log("Tables found:", result.rows.map(r => r.TABLE_NAME));
        
        const countRes = await db.execute("SELECT COUNT(*) as COUNT FROM LISTINGS", {}, { outFormat: 4002 });
        console.log("Listings count:", countRes.rows[0].COUNT);
    } catch (err) {
        console.error("Diagnostic Error:", err.message);
    } finally {
        process.exit();
    }
}

check();
