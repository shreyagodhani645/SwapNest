const db = require('./backend/db');

async function alterTable() {
    try {
        await db.initialize();
        console.log("Adding CONDITION column to LISTINGS...");
        await db.execute(`ALTER TABLE LISTINGS ADD CONDITION VARCHAR2(50)`);
        
        console.log("Moving existing location data to condition...");
        await db.execute(`UPDATE LISTINGS SET CONDITION = LOCATION`);
        
        console.log("Clearing location data...");
        await db.execute(`UPDATE LISTINGS SET LOCATION = NULL`);
        
        console.log("Success!");
    } catch (e) {
        if (e.errorNum === 1430) {
            console.log("Column already exists.");
        } else {
            console.error("Error:", e);
        }
    } finally {
        await db.close();
        process.exit();
    }
}
alterTable();
