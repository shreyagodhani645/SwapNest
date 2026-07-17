const oracledb = require('oracledb');
const db = require('./db');

async function countUsers() {
  try {
    // Ensure pool exists (if script is run standalone)
    try {
      oracledb.getPool();
    } catch (e) {
      await db.initialize();
    }
    // Total users
    const totalRes = await db.execute(
      `SELECT COUNT(*) AS TOTAL FROM USERS`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const total = totalRes.rows?.[0]?.TOTAL ?? 0;

    // Try common patterns to determine admin count
    let adminCount = 0;

    // 1) Try ROLE column (case-insensitive)
    try {
      const adminRes = await db.execute(
        `SELECT COUNT(*) AS ADMIN_COUNT FROM USERS WHERE UPPER(ROLE) = 'ADMIN'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      adminCount = adminRes.rows?.[0]?.ADMIN_COUNT ?? 0;
    } catch (errRole) {
      // 2) Try IS_ADMIN boolean/number column
      try {
        const adminRes2 = await db.execute(
          `SELECT COUNT(*) AS ADMIN_COUNT FROM USERS WHERE IS_ADMIN = 1`,
          [],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        adminCount = adminRes2.rows?.[0]?.ADMIN_COUNT ?? 0;
      } catch (errIsAdmin) {
        // 3) Inspect columns and try a LIKE on ROLE if present
        try {
          const colsRes = await db.execute(
            `SELECT COLUMN_NAME FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'USERS'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );
          const cols = colsRes.rows.map(r => r.COLUMN_NAME);
          if (cols.includes('ROLE')) {
            const adminRes3 = await db.execute(
              `SELECT COUNT(*) AS ADMIN_COUNT FROM USERS WHERE UPPER(ROLE) LIKE '%ADMIN%'`,
              [],
              { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            adminCount = adminRes3.rows?.[0]?.ADMIN_COUNT ?? 0;
          } else if (cols.includes('IS_ADMIN')) {
            const adminRes3 = await db.execute(
              `SELECT COUNT(*) AS ADMIN_COUNT FROM USERS WHERE IS_ADMIN = 1`,
              [],
              { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            adminCount = adminRes3.rows?.[0]?.ADMIN_COUNT ?? 0;
          } else {
            throw new Error('Could not determine admin column in USERS table');
          }
        } catch (errCols) {
          throw new Error('Failed to determine admin count: ' + errCols.message);
        }
      }
    }

    console.log(`Total users: ${total}`);
    console.log(`Admin users: ${adminCount}`);
  } catch (err) {
    console.error('Error counting users:', err.message || err);
  } finally {
    // Do not close the global pool here to avoid interfering with a running server.
    process.exit(0);
  }
}

countUsers();
