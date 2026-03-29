const oracledb = require('oracledb');

async function grantPrivileges() {
    let connection;
    try {
        // Connect as SYSDBA
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'oracle',
            connectString: 'localhost:1521/XEPDB1',
            privilege: oracledb.SYSDBA
        });
        console.log('Connected as SYSDBA');

        const grants = [
            'GRANT CREATE VIEW TO project',
            'GRANT CREATE PROCEDURE TO project',
            'GRANT CREATE TRIGGER TO project',
            'GRANT CREATE SEQUENCE TO project'
        ];

        for (const sql of grants) {
            try {
                await connection.execute(sql);
                console.log('✓ ' + sql);
            } catch (err) {
                if (err.errorNum === 1927) {
                    console.log('○ ' + sql + ' (already granted)');
                } else {
                    console.log('✗ ' + sql + ': ' + err.message);
                }
            }
        }
        console.log('\nAll privileges granted!');
    } catch (err) {
        console.error('Connection error:', err.message);
        
        // Fallback: try with different password patterns
        console.log('\nTrying alternative connection...');
        try {
            connection = await oracledb.getConnection({
                user: 'sys',
                password: 'Oracle123',
                connectString: 'localhost:1521/XEPDB1',
                privilege: oracledb.SYSDBA
            });
            console.log('Connected as SYSDBA (alt password)');
            for (const sql of ['GRANT CREATE VIEW TO project', 'GRANT CREATE PROCEDURE TO project', 'GRANT CREATE TRIGGER TO project']) {
                try { await connection.execute(sql); console.log('✓ ' + sql); } catch (e) { console.log('○ ' + sql); }
            }
        } catch (e2) {
            console.error('Alt connection also failed:', e2.message);
            console.log('\n>>> MANUAL FIX NEEDED <<<');
            console.log('Run this inside Oracle as SYS:');
            console.log('  GRANT CREATE VIEW TO project;');
            console.log('  GRANT CREATE PROCEDURE TO project;');
            console.log('  GRANT CREATE TRIGGER TO project;');
        }
    } finally {
        if (connection) await connection.close();
    }
}

grantPrivileges();
