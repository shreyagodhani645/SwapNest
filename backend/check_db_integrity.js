const db = require('./db');

async function check() {
    try {
        await db.initialize();
        
        console.log("--- Categories ---");
        const cats = await db.execute("SELECT * FROM CATEGORIES", []);
        console.log(cats.rows);
        
        console.log("\n--- Listing Counts by Category Index ---");
        const counts = await db.execute("SELECT CATEGORY_ID, COUNT(*) as COUNT FROM LISTINGS GROUP BY CATEGORY_ID", []);
        console.log(counts.rows);
        
        console.log("\n--- Sample Joined Listings ---");
        const joined = await db.execute(`
            SELECT l.ID, l.TITLE, c.NAME as CATEGORY 
            FROM LISTINGS l 
            JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
            FETCH FIRST 5 ROWS ONLY
        `, []);
        console.log(joined.rows);
        
        if (joined.rows.length === 0) {
            console.warn("\nWARNING: No listings found with JOINed categories! This is why nothing shows up.");
            const orphanCount = await db.execute("SELECT COUNT(*) as COUNT FROM LISTINGS WHERE CATEGORY_ID NOT IN (SELECT ID FROM CATEGORIES)", []);
            console.log("Listings with invalid CATEGORY_ID:", orphanCount.rows[0].COUNT);
        } else {
            console.log("\nJOIN works! Found", joined.rows.length, "joined rows.");
        }

    } catch (err) {
        console.error("Diagnostic failed:", err);
    } finally {
        await db.close();
        process.exit();
    }
}

check();
