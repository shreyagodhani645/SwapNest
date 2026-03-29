// Run this script to create the admin user:
// node backend/create_admin.js

const bcrypt = require('bcrypt');
const oracledb = require('oracledb');
require('dotenv').config();

async function createAdmin() {
    let connection;
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        connection = await oracledb.getConnection({
            user: process.env.DB_USER || 'project',
            password: process.env.DB_PASSWORD || 'project123',
            connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1'
        });

        // Check if admin already exists
        const check = await connection.execute(
            `SELECT COUNT(*) AS CNT FROM USERS WHERE EMAIL = :email`,
            { email: 'admin@swapnest.com' },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (check.rows[0].CNT > 0) {
            console.log('Admin user already exists. Updating role and password...');
            await connection.execute(
                `UPDATE USERS SET PASSWORD = :hash, ROLE = 'admin' WHERE EMAIL = :email`,
                { hash, email: 'admin@swapnest.com' }
            );
        } else {
            await connection.execute(
                `INSERT INTO USERS (USERNAME, EMAIL, PASSWORD, ROLE) VALUES (:username, :email, :hash, 'admin')`,
                { username: 'admin', email: 'admin@swapnest.com', hash }
            );
        }

        await connection.commit();
        console.log('✅ Admin user created/updated successfully!');
        console.log('   Email:    admin@swapnest.com');
        console.log('   Password: admin123');
        console.log('   Login at: http://localhost:5173/admin/login');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        if (connection) await connection.close();
        process.exit(0);
    }
}

createAdmin();
