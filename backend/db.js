const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function initialize() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMax: 10,
      poolMin: 2,
      poolIncrement: 1
    });
    oracledb.fetchAsString = [oracledb.CLOB];
    console.log('Oracle DB Connection Pool initialized');
  } catch (err) {
    console.error('Error initializing Oracle DB Pool:', err);
    process.exit(1);
  }
}

async function close() {
  try {
    await oracledb.getPool().close(0);
    console.log('Oracle DB Connection Pool closed');
  } catch (err) {
    console.error('Error closing Oracle DB Pool:', err);
  }
}

async function execute(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    options.autoCommit = true;
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error('Database execution error:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

module.exports = {
  initialize,
  close,
  execute
};
