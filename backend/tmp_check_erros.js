const db = require('./db');
const oracledb = require('oracledb');

async function checkErrors() {
    try {
        await db.initialize();
        console.log('=== CHECKING USER_ERRORS ===');
        const errors = await db.execute(
            `SELECT NAME, TYPE, LINE, POSITION, TEXT FROM USER_ERRORS WHERE NAME = 'FN_GET_USER_TRUST_SCORE' ORDER BY SEQUENCE`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (errors.rows.length > 0) {
            console.table(errors.rows);
        } else {
            console.log('No specific errors found in USER_ERRORS for FN_GET_USER_TRUST_SCORE.');
            console.log('Attempting to recompile...');
            try {
                await db.execute('ALTER FUNCTION FN_GET_USER_TRUST_SCORE COMPILE');
                console.log('Successfully recompiled FN_GET_USER_TRUST_SCORE.');
            } catch (err) {
                console.error('Recompilation failed again:', err.message);
                const secondCheck = await db.execute(
                    `SELECT TEXT FROM USER_ERRORS WHERE NAME = 'FN_GET_USER_TRUST_SCORE'`,
                    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );
                console.table(secondCheck.rows);
            }
        }
    } catch (err) {
        console.error('Error checking DB errors:', err);
    } finally {
        await db.close();
    }
}

checkErrors();
