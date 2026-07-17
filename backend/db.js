const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

let pool;

async function initialize() {
  try {
    pool = new Pool({
      connectionString: process.env.DB_CONNECTION_STRING,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('PostgreSQL (Supabase) Connection Pool initialized');
  } catch (err) {
    console.error('Error initializing PostgreSQL Pool:', err);
    process.exit(1);
  }
}

async function close() {
  try {
    await pool.end();
    console.log('PostgreSQL Connection Pool closed');
  } catch (err) {
    console.error('Error closing PostgreSQL Pool:', err);
  }
}

// Converts Oracle-style ":bindname" SQL + object binds into Postgres "$1,$2" style
function convertQuery(sql, binds) {
  if (Array.isArray(binds)) {
    // Already positional (rare in this codebase), just convert :name to $n in order
    let index = 0;
    const convertedSql = sql.replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, () => `$${++index}`);
    return { convertedSql, values: binds };
  }

  // Object-style binds: { username: 'x', id: 5 }
  const values = [];
  const seen = {};
  const convertedSql = sql.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, name) => {
    if (!(name in binds)) {
      throw new Error(`Missing bind value for :${name}`);
    }
    if (!(name in seen)) {
      values.push(binds[name]);
      seen[name] = values.length; // 1-based index
    }
    return `$${seen[name]}`;
  });

  return { convertedSql, values };
}

// Uppercases all column keys in returned rows to match old Oracle-style access (row.USERNAME)
function uppercaseRows(rows) {
  return rows.map(row => {
    const newRow = {};
    for (const key in row) {
      newRow[key.toUpperCase()] = row[key];
    }
    return newRow;
  });
}

async function execute(sql, binds = {}, options = {}) {
  try {
    const { convertedSql, values } = convertQuery(sql, binds);
    const result = await pool.query(convertedSql, values);
    return {
      rows: uppercaseRows(result.rows || []),
      rowsAffected: result.rowCount
    };
  } catch (err) {
    console.error('Database execution error:', err);
    throw err;
  }
}

module.exports = {
  initialize,
  close,
  execute,
  pool: () => pool
};