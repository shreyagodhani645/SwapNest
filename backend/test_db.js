const db = require('./db');

async function check() {
    try {
        console.log("Initializing DB pool...");
        await db.initialize();
        
        console.log("Checking DB connection...");
        const result = await db.execute("SELECT table_name AS TABLE_NAME FROM information_schema.tables WHERE table_schema = 'public'", {});
        console.log("Tables found:", result.rows.map(r => r.TABLE_NAME));
        
        const countRes = await db.execute("SELECT COUNT(*) as COUNT FROM LISTINGS", {});
        console.log("Listings count:", countRes.rows[0].COUNT);
    } catch (err) {
        console.error("Diagnostic Error:", err.message);
    } finally {
        process.exit();
    }
}

check();
