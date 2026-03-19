const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db');

async function runSqlFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    console.log(`Executing ${filePath}...`);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Improved splitting: 
    // 1. Split by / on its own line (PL/SQL blocks)
    // 2. For the rest, split by ;
    const parts = content.split(/\r?\n\/\r?\n/);
    let statements = [];
    
    for (let part of parts) {
        if (part.trim().toUpperCase().startsWith('BEGIN') || part.trim().toUpperCase().startsWith('DECLARE')) {
            statements.push(part.trim());
        } else {
            const subStatements = part.split(';').map(s => s.trim()).filter(s => s.length > 0);
            statements.push(...subStatements);
        }
    }
    
    for (let statement of statements) {
        try {
            await db.execute(statement);
        } catch (err) {
            // Ignore "Table or view does not exist", "Sequence does not exist", "Name already used"
            if ([942, 2289, 955].includes(err.errorNum)) {
                // Ignore
            } else {
                console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
                console.error(err.message);
            }
        }
    }
}

async function setup() {
    try {
        await db.initialize();
        
        console.log("Starting DB Setup...");
        
        // 0. Clean start: Drop Users if they exist
        console.log("Cleaning up existing USERS table...");
        try {
            await db.execute("DROP TABLE WISHLIST CASCADE CONSTRAINTS");
            await db.execute("DROP TABLE USERS CASCADE CONSTRAINTS");
            await db.execute("DROP SEQUENCE USERS_SEQ");
        } catch (err) {}

        // 1. Create Users Table
        await runSqlFile('schema.sql');
        
        // 2. Create Core Tables (Categories, Listings, etc.)
        await runSqlFile('full_schema.sql');
        
        // 3. Create Advanced Tables (Messages, Offers)
        await runSqlFile('advanced_schema.sql');
        
        // 4. Seed Data
        await runSqlFile('seed_data.sql');
        
        // 5. Fix Passwords for Seeded Users
        console.log("Updating seeded users with valid bcrypt hashes...");
        const hashedPassword = await bcrypt.hash('password123', 10);
        await db.execute("UPDATE USERS SET PASSWORD = :hashedPassword", { hashedPassword });
        
        console.log("DB Setup Completed Successfully!");
        
        // Verify Users
        const result = await db.execute("SELECT USERNAME, EMAIL FROM USERS", {}, { outFormat: 4002 });
        console.log("Seeded Users:", result.rows);
        
    } catch (err) {
        console.error("Setup Failed:", err);
    } finally {
        await db.close();
        process.exit();
    }
}

setup();
