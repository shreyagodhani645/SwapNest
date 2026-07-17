const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

async function updatePassword() {
    try {
        await db.initialize();
        const username = 'sarah_home';
        const rawPassword = '12345';
        
        console.log(`Hashing password for ${username}...`);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);
        
        console.log(`Updating database...`);
        const result = await db.execute(
            `UPDATE USERS SET PASSWORD = :hashedPassword WHERE USERNAME = :username`,
            { hashedPassword, username }
        );
        
        if (result.rowsAffected > 0) {
            console.log(`✅ Successfully updated password for ${username}.`);
            console.log(`New password is: ${rawPassword} (stored as bcrypt hash)`);
            await db.execute('COMMIT');
        } else {
            console.log(`❌ User ${username} not found.`);
        }
    } catch (err) {
        console.error('Error updating password:', err.message);
    } finally {
        await db.close();
        process.exit();
    }
}

updatePassword();
