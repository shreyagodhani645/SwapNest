const db = require('./db');
const oracledb = require('oracledb');

async function cleanup() {
    await db.initialize();
    console.log('=== SwapNest Database Cleanup ===\n');

    try {
        // 1. Delete all messages
        console.log('Deleting all MESSAGES...');
        const msgResult = await db.execute('DELETE FROM MESSAGES');
        console.log(`  Deleted ${msgResult.rowsAffected || 0} messages`);

        // 2. Delete all offers
        console.log('Deleting all OFFERS...');
        const offerResult = await db.execute('DELETE FROM OFFERS');
        console.log(`  Deleted ${offerResult.rowsAffected || 0} offers`);

        // 3. Delete all wishlist entries
        console.log('Deleting all WISHLIST entries...');
        const wishResult = await db.execute('DELETE FROM WISHLIST');
        console.log(`  Deleted ${wishResult.rowsAffected || 0} wishlist entries`);

        // 4. Delete all images
        console.log('Deleting all IMAGES...');
        const imgResult = await db.execute('DELETE FROM IMAGES');
        console.log(`  Deleted ${imgResult.rowsAffected || 0} images`);

        // 5. Delete all listings
        console.log('Deleting all LISTINGS...');
        const listResult = await db.execute('DELETE FROM LISTINGS');
        console.log(`  Deleted ${listResult.rowsAffected || 0} listings`);

        // 6. Delete all users (including admin)
        console.log('Deleting ALL USERS...');
        const userResult = await db.execute('DELETE FROM USERS');
        console.log(`  Deleted ${userResult.rowsAffected || 0} users`);

        // 7. Verify cleanup
        console.log('\n=== Verification ===');
        const tables = ['USERS', 'LISTINGS', 'IMAGES', 'WISHLIST', 'OFFERS', 'MESSAGES'];
        for (const table of tables) {
            try {
                const result = await db.execute(`SELECT COUNT(*) AS CNT FROM ${table}`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
                console.log(`  ${table}: ${result.rows[0].CNT} rows`);
            } catch (err) {
                console.log(`  ${table}: error checking - ${err.message}`);
            }
        }

        console.log('\n✅ Database cleanup complete! All users and listings removed.');
        console.log('   You can now sign up fresh users via the app.');

    } catch (err) {
        console.error('\n❌ Cleanup error:', err.message);
    } finally {
        await db.close();
        process.exit(0);
    }
}

cleanup();
