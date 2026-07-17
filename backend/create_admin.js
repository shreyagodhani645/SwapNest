// Run this script to create the admin user:
// node create_admin.js
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

async function createAdmin() {
    try {
        await db.initialize();
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        const check = await db.execute(
            `SELECT COUNT(*) AS CNT FROM USERS WHERE EMAIL = :email`,
            { email: 'admin@swapnest.com' }
        );

        if (Number(check.rows[0].CNT) > 0) {
            console.log('Admin user already exists. Updating role and password...');
            await db.execute(
                `UPDATE USERS SET PASSWORD = :hash, ROLE = 'admin' WHERE EMAIL = :email`,
                { hash, email: 'admin@swapnest.com' }
            );
        } else {
            await db.execute(
                `INSERT INTO USERS (USERNAME, EMAIL, PASSWORD, ROLE) VALUES (:username, :email, :hash, 'admin')`,
                { username: 'admin', email: 'admin@swapnest.com', hash }
            );
        }

        console.log('Admin user created/updated successfully!');
        console.log('   Email:    admin@swapnest.com');
        console.log('   Password: admin123');
        console.log('   Login at: http://localhost:5173/login');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await db.close();
        process.exit(0);
    }
}

createAdmin();
