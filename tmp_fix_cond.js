const db = require('./backend/db');

async function fixColumn() {
    try {
        await db.initialize();
        console.log('Connected to DB');
        
        // Add the ITEM_CONDITION column
        const sql = `ALTER TABLE LISTINGS ADD (ITEM_CONDITION VARCHAR2(50))`;
        await db.execute(sql);
        console.log('Successfully added ITEM_CONDITION to LISTINGS table');
        
    } catch (err) {
        // Ignore if it already exists (ORA-01430: column being added already exists in table)
        if (err.errorNum === 1430) {
            console.log('Column already exists.');
        } else {
            console.error('Error:', err);
        }
    } finally {
        await db.close();
        process.exit();
    }
}

fixColumn();
