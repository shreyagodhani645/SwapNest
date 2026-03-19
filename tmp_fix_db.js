const db = require('./backend/db');

async function runFix() {
    try {
        await db.initialize();
        console.log('Connected to DB');
        
        const sql = `ALTER TABLE IMAGES MODIFY IMAGE_URL VARCHAR2(2000)`;
        await db.execute(sql);
        console.log('Successfully altered IMAGES table');
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

runFix();
