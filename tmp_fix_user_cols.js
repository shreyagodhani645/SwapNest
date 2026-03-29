const db = require('./backend/db');

async function fixUserColumns() {
    try {
        await db.initialize();
        console.log('Connected to DB');
        
        const sql = `ALTER TABLE USERS ADD (PHONE VARCHAR2(20), PROFILE_PICTURE VARCHAR2(500))`;
        await db.execute(sql);
        console.log('Successfully added PHONE and PROFILE_PICTURE to USERS table');
        
    } catch (err) {
        if (err.errorNum === 1430) {
            console.log('Columns already exist.');
        } else {
            console.error('Error:', err);
        }
    } finally {
        await db.close();
        process.exit();
    }
}

fixUserColumns();
