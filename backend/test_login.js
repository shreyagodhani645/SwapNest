const bcrypt = require('bcrypt');
const db = require('./db');

async function test() {
    try {
        await db.initialize();
        const email = 'alice@example.com';
        const password = 'password123';
        
        const sql = `SELECT ID, USERNAME, EMAIL, PASSWORD FROM USERS WHERE EMAIL = :email`;
        const result = await db.execute(sql, { email }, { outFormat: 4002 });
        
        if (result.rows.length === 0) {
            console.log("User not found!");
        } else {
            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.PASSWORD);
            console.log(`Login test for ${email}: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
        }
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await db.close();
        process.exit();
    }
}

test();
