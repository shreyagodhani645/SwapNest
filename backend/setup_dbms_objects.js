/**
 * SwapNest — Setup DBMS Objects Runner
 * 
 * Creates all stored procedures, functions, triggers, views, indexes,
 * and audit tables in the Oracle database.
 * 
 * Usage: node setup_dbms_objects.js
 */

const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING || process.env.DB_CONNECT_STRING
        });
        console.log('Connected to Oracle DB');

        // ===== 1. CREATE AUDIT TABLES =====
        console.log('\n--- Creating Audit Tables ---');
        
        // LISTING_AUDIT_LOG
        await safeExec(connection, `
            CREATE SEQUENCE AUDIT_LOG_SEQ START WITH 1 INCREMENT BY 1
        `, 'AUDIT_LOG_SEQ');

        await safeExec(connection, `
            CREATE TABLE LISTING_AUDIT_LOG (
                ID            NUMBER DEFAULT AUDIT_LOG_SEQ.NEXTVAL PRIMARY KEY,
                LISTING_ID    NUMBER NOT NULL,
                OLD_STATUS    VARCHAR2(20),
                NEW_STATUS    VARCHAR2(20),
                CHANGED_BY    NUMBER,
                CHANGED_AT    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                REMARKS       VARCHAR2(500)
            )
        `, 'LISTING_AUDIT_LOG');

        // ADMIN_ACTIVITY_LOG
        await safeExec(connection, `
            CREATE SEQUENCE ADMIN_LOG_SEQ START WITH 1 INCREMENT BY 1
        `, 'ADMIN_LOG_SEQ');

        await safeExec(connection, `
            CREATE TABLE ADMIN_ACTIVITY_LOG (
                ID            NUMBER DEFAULT ADMIN_LOG_SEQ.NEXTVAL PRIMARY KEY,
                ADMIN_ID      NUMBER NOT NULL,
                ACTION_TYPE   VARCHAR2(50) NOT NULL,
                TARGET_TABLE  VARCHAR2(50),
                TARGET_ID     NUMBER,
                DESCRIPTION   VARCHAR2(1000),
                ACTION_AT     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, 'ADMIN_ACTIVITY_LOG');

        // ===== 2. ALTER TABLES =====
        console.log('\n--- Adding New Columns ---');
        await safeExec(connection, `ALTER TABLE LISTINGS ADD (UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, 'UPDATED_AT column');
        await safeExec(connection, `ALTER TABLE USERS ADD (IS_BANNED NUMBER(1) DEFAULT 0)`, 'IS_BANNED column');

        // ===== 3. CREATE INDEXES =====
        console.log('\n--- Creating Indexes ---');
        await safeExec(connection, `CREATE INDEX IDX_LISTINGS_SELLER ON LISTINGS(SELLER_ID)`, 'IDX_LISTINGS_SELLER');
        await safeExec(connection, `CREATE INDEX IDX_LISTINGS_CATEGORY ON LISTINGS(CATEGORY_ID)`, 'IDX_LISTINGS_CATEGORY');
        await safeExec(connection, `CREATE INDEX IDX_LISTINGS_STATUS ON LISTINGS(STATUS)`, 'IDX_LISTINGS_STATUS');
        await safeExec(connection, `CREATE INDEX IDX_OFFERS_LISTING ON OFFERS(LISTING_ID)`, 'IDX_OFFERS_LISTING');
        await safeExec(connection, `CREATE INDEX IDX_OFFERS_STATUS ON OFFERS(STATUS)`, 'IDX_OFFERS_STATUS');
        await safeExec(connection, `CREATE INDEX IDX_USERS_EMAIL ON USERS(EMAIL)`, 'IDX_USERS_EMAIL');

        // ===== 4. CREATE VIEWS =====
        console.log('\n--- Creating Views ---');

        await connection.execute(`
            CREATE OR REPLACE VIEW VW_LISTING_DETAILS AS
            SELECT 
                l.ID, l.TITLE, l.DESCRIPTION, l.PRICE, l.LOCATION,
                l.ITEM_CONDITION, l.STATUS, l.CREATED_AT, l.UPDATED_AT,
                c.ID AS CATEGORY_ID, c.NAME AS CATEGORY_NAME,
                u.ID AS SELLER_ID, u.USERNAME AS SELLER_NAME, u.EMAIL AS SELLER_EMAIL,
                (SELECT MIN(i.IMAGE_URL) FROM IMAGES i WHERE i.LISTING_ID = l.ID) AS IMAGE_URL
            FROM LISTINGS l
            JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
            JOIN USERS u ON l.SELLER_ID = u.ID
        `);
        console.log('  ✓ VW_LISTING_DETAILS');

        await connection.execute(`
            CREATE OR REPLACE VIEW VW_USER_DASHBOARD_STATS AS
            SELECT 
                u.ID AS USER_ID, u.USERNAME, u.EMAIL, u.ROLE, u.IS_BANNED, u.CREATED_AT,
                (SELECT COUNT(*) FROM LISTINGS l WHERE l.SELLER_ID = u.ID) AS LISTING_COUNT,
                (SELECT COUNT(*) FROM OFFERS o WHERE o.BUYER_ID = u.ID OR o.SELLER_ID = u.ID) AS OFFER_COUNT,
                (SELECT COUNT(*) FROM MESSAGES m WHERE m.SENDER_ID = u.ID) AS MESSAGES_SENT,
                (SELECT COUNT(*) FROM WISHLIST w WHERE w.USER_ID = u.ID) AS WISHLIST_COUNT,
                LEAST(
                    (SELECT COUNT(*) FROM LISTINGS l2 WHERE l2.SELLER_ID = u.ID) * 12 +
                    (SELECT COUNT(*) FROM OFFERS o2 WHERE o2.BUYER_ID = u.ID OR o2.SELLER_ID = u.ID) * 2 +
                    (SELECT COUNT(*) FROM MESSAGES m2 WHERE m2.SENDER_ID = u.ID) * 1,
                    100
                ) AS TRUST_SCORE
            FROM USERS u
        `);
        console.log('  ✓ VW_USER_DASHBOARD_STATS');

        await connection.execute(`
            CREATE OR REPLACE VIEW VW_ADMIN_PLATFORM_OVERVIEW AS
            SELECT
                (SELECT COUNT(*) FROM USERS) AS TOTAL_USERS,
                (SELECT COUNT(*) FROM USERS WHERE ROLE = 'admin') AS TOTAL_ADMINS,
                (SELECT COUNT(*) FROM USERS WHERE IS_BANNED = 1) AS BANNED_USERS,
                (SELECT COUNT(*) FROM LISTINGS) AS TOTAL_LISTINGS,
                (SELECT COUNT(*) FROM LISTINGS WHERE STATUS = 'active' OR STATUS IS NULL) AS ACTIVE_LISTINGS,
                (SELECT COUNT(*) FROM LISTINGS WHERE STATUS = 'sold') AS SOLD_LISTINGS,
                (SELECT COUNT(*) FROM LISTINGS WHERE STATUS = 'reserved') AS RESERVED_LISTINGS,
                (SELECT COUNT(*) FROM OFFERS) AS TOTAL_OFFERS,
                (SELECT COUNT(*) FROM OFFERS WHERE STATUS = 'pending' OR STATUS = 'PENDING') AS PENDING_OFFERS,
                (SELECT COUNT(*) FROM OFFERS WHERE STATUS = 'accepted' OR STATUS = 'ACCEPTED') AS ACCEPTED_OFFERS,
                (SELECT COUNT(*) FROM MESSAGES) AS TOTAL_MESSAGES,
                (SELECT COUNT(*) FROM CATEGORIES) AS TOTAL_CATEGORIES,
                (SELECT COUNT(*) FROM WISHLIST) AS TOTAL_WISHLISTED,
                (SELECT NVL(SUM(PRICE), 0) FROM LISTINGS WHERE STATUS = 'active' OR STATUS IS NULL) AS TOTAL_ACTIVE_VALUE,
                (SELECT NVL(ROUND(AVG(PRICE), 2), 0) FROM LISTINGS) AS AVG_LISTING_PRICE
            FROM DUAL
        `);
        console.log('  ✓ VW_ADMIN_PLATFORM_OVERVIEW');

        // ===== 5. CREATE FUNCTIONS =====
        console.log('\n--- Creating Functions ---');

        await connection.execute(`
            CREATE OR REPLACE FUNCTION FN_GET_USER_TRUST_SCORE(p_user_id IN NUMBER)
            RETURN NUMBER
            IS
                v_listing_count NUMBER := 0;
                v_offer_count   NUMBER := 0;
                v_message_count NUMBER := 0;
                v_trust_score   NUMBER := 0;
            BEGIN
                SELECT COUNT(*) INTO v_listing_count FROM LISTINGS WHERE SELLER_ID = p_user_id;
                SELECT COUNT(*) INTO v_offer_count FROM OFFERS WHERE BUYER_ID = p_user_id OR SELLER_ID = p_user_id;
                SELECT COUNT(*) INTO v_message_count FROM MESSAGES WHERE SENDER_ID = p_user_id;
                v_trust_score := (v_listing_count * 12) + (v_offer_count * 2) + (v_message_count * 1);
                IF v_trust_score > 100 THEN v_trust_score := 100; END IF;
                RETURN v_trust_score;
            EXCEPTION WHEN OTHERS THEN RETURN 0;
            END FN_GET_USER_TRUST_SCORE
        `);
        console.log('  ✓ FN_GET_USER_TRUST_SCORE');

        await connection.execute(`
            CREATE OR REPLACE FUNCTION FN_GET_LISTING_COUNT_BY_CATEGORY(p_category_id IN NUMBER)
            RETURN NUMBER
            IS
                v_count NUMBER := 0;
            BEGIN
                SELECT COUNT(*) INTO v_count FROM LISTINGS 
                WHERE CATEGORY_ID = p_category_id AND (STATUS = 'active' OR STATUS IS NULL);
                RETURN v_count;
            EXCEPTION WHEN OTHERS THEN RETURN 0;
            END FN_GET_LISTING_COUNT_BY_CATEGORY
        `);
        console.log('  ✓ FN_GET_LISTING_COUNT_BY_CATEGORY');

        await connection.execute(`
            CREATE OR REPLACE FUNCTION FN_GET_TOTAL_REVENUE_POTENTIAL
            RETURN NUMBER
            IS
                v_total NUMBER := 0;
            BEGIN
                SELECT NVL(SUM(PRICE), 0) INTO v_total FROM LISTINGS WHERE STATUS = 'active' OR STATUS IS NULL;
                RETURN v_total;
            EXCEPTION WHEN OTHERS THEN RETURN 0;
            END FN_GET_TOTAL_REVENUE_POTENTIAL
        `);
        console.log('  ✓ FN_GET_TOTAL_REVENUE_POTENTIAL');

        await connection.execute(`
            CREATE OR REPLACE FUNCTION FN_GET_USER_ROLE(p_user_id IN NUMBER)
            RETURN VARCHAR2
            IS
                v_role VARCHAR2(20);
            BEGIN
                SELECT NVL(ROLE, 'user') INTO v_role FROM USERS WHERE ID = p_user_id;
                RETURN v_role;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN RETURN 'unknown';
                WHEN OTHERS THEN RETURN 'error';
            END FN_GET_USER_ROLE
        `);
        console.log('  ✓ FN_GET_USER_ROLE');

        // ===== 6. CREATE PROCEDURES =====
        console.log('\n--- Creating Stored Procedures ---');

        await connection.execute(`
            CREATE OR REPLACE PROCEDURE SP_REGISTER_USER(
                p_username IN VARCHAR2, p_email IN VARCHAR2, p_password IN VARCHAR2,
                p_result OUT VARCHAR2, p_user_id OUT NUMBER
            ) IS
                v_count NUMBER;
            BEGIN
                SELECT COUNT(*) INTO v_count FROM USERS WHERE USERNAME = p_username;
                IF v_count > 0 THEN p_result := 'ERROR: Username already exists'; p_user_id := -1; RETURN; END IF;
                SELECT COUNT(*) INTO v_count FROM USERS WHERE EMAIL = p_email;
                IF v_count > 0 THEN p_result := 'ERROR: Email already exists'; p_user_id := -1; RETURN; END IF;
                INSERT INTO USERS (USERNAME, EMAIL, PASSWORD, ROLE, IS_BANNED)
                VALUES (p_username, p_email, p_password, 'user', 0) RETURNING ID INTO p_user_id;
                COMMIT;
                p_result := 'SUCCESS: User registered';
            EXCEPTION WHEN OTHERS THEN
                ROLLBACK; p_result := 'ERROR: ' || SQLERRM; p_user_id := -1;
            END SP_REGISTER_USER
        `);
        console.log('  ✓ SP_REGISTER_USER');

        await connection.execute(`
            CREATE OR REPLACE PROCEDURE SP_CREATE_LISTING(
                p_title IN VARCHAR2, p_description IN CLOB, p_price IN NUMBER,
                p_location IN VARCHAR2, p_condition IN VARCHAR2, p_category_id IN NUMBER,
                p_seller_id IN NUMBER, p_image_url IN VARCHAR2 DEFAULT NULL,
                p_listing_id OUT NUMBER, p_result OUT VARCHAR2
            ) IS
            BEGIN
                INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, ITEM_CONDITION, CATEGORY_ID, SELLER_ID, STATUS)
                VALUES (p_title, p_description, p_price, p_location, p_condition, p_category_id, p_seller_id, 'active')
                RETURNING ID INTO p_listing_id;
                IF p_image_url IS NOT NULL THEN
                    INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (p_listing_id, p_image_url);
                END IF;
                COMMIT; p_result := 'SUCCESS';
            EXCEPTION WHEN OTHERS THEN
                ROLLBACK; p_listing_id := -1; p_result := 'ERROR: ' || SQLERRM;
            END SP_CREATE_LISTING
        `);
        console.log('  ✓ SP_CREATE_LISTING');

        await connection.execute(`
            CREATE OR REPLACE PROCEDURE SP_ACCEPT_OFFER(
                p_offer_id IN NUMBER, p_seller_id IN NUMBER, p_result OUT VARCHAR2
            ) IS
                v_listing_id NUMBER; v_offer_seller NUMBER; v_offer_status VARCHAR2(20);
                CURSOR c_competing IS
                    SELECT ID FROM OFFERS WHERE LISTING_ID = v_listing_id AND ID != p_offer_id AND (STATUS = 'pending' OR STATUS = 'PENDING');
                v_cid NUMBER;
            BEGIN
                SELECT LISTING_ID, SELLER_ID, STATUS INTO v_listing_id, v_offer_seller, v_offer_status
                FROM OFFERS WHERE ID = p_offer_id;
                IF v_offer_seller != p_seller_id THEN p_result := 'ERROR: Only the seller can accept'; RETURN; END IF;
                IF v_offer_status NOT IN ('pending','PENDING') THEN p_result := 'ERROR: Not pending'; RETURN; END IF;
                UPDATE OFFERS SET STATUS = 'accepted' WHERE ID = p_offer_id;
                OPEN c_competing; LOOP FETCH c_competing INTO v_cid; EXIT WHEN c_competing%NOTFOUND;
                    UPDATE OFFERS SET STATUS = 'rejected' WHERE ID = v_cid;
                END LOOP; CLOSE c_competing;
                UPDATE LISTINGS SET STATUS = 'reserved' WHERE ID = v_listing_id;
                COMMIT; p_result := 'SUCCESS: Offer accepted, competing offers rejected';
            EXCEPTION
                WHEN NO_DATA_FOUND THEN p_result := 'ERROR: Offer not found';
                WHEN OTHERS THEN ROLLBACK; p_result := 'ERROR: ' || SQLERRM;
            END SP_ACCEPT_OFFER
        `);
        console.log('  ✓ SP_ACCEPT_OFFER');

        await connection.execute(`
            CREATE OR REPLACE PROCEDURE SP_DELETE_USER_CASCADE(
                p_user_id IN NUMBER, p_admin_id IN NUMBER, p_result OUT VARCHAR2
            ) IS
                v_username VARCHAR2(50); v_lid NUMBER;
                CURSOR c_listings IS SELECT ID FROM LISTINGS WHERE SELLER_ID = p_user_id;
            BEGIN
                SELECT USERNAME INTO v_username FROM USERS WHERE ID = p_user_id;
                IF p_user_id = p_admin_id THEN p_result := 'ERROR: Cannot delete self'; RETURN; END IF;
                DELETE FROM MESSAGES WHERE SENDER_ID = p_user_id OR RECEIVER_ID = p_user_id;
                DELETE FROM OFFERS WHERE BUYER_ID = p_user_id OR SELLER_ID = p_user_id;
                DELETE FROM WISHLIST WHERE USER_ID = p_user_id;
                OPEN c_listings; LOOP FETCH c_listings INTO v_lid; EXIT WHEN c_listings%NOTFOUND;
                    DELETE FROM IMAGES WHERE LISTING_ID = v_lid;
                    DELETE FROM WISHLIST WHERE LISTING_ID = v_lid;
                END LOOP; CLOSE c_listings;
                DELETE FROM LISTINGS WHERE SELLER_ID = p_user_id;
                DELETE FROM USERS WHERE ID = p_user_id;
                INSERT INTO ADMIN_ACTIVITY_LOG (ADMIN_ID, ACTION_TYPE, TARGET_TABLE, TARGET_ID, DESCRIPTION)
                VALUES (p_admin_id, 'DELETE_USER', 'USERS', p_user_id, 'Deleted user: ' || v_username);
                COMMIT; p_result := 'SUCCESS: User ' || v_username || ' deleted';
            EXCEPTION
                WHEN NO_DATA_FOUND THEN p_result := 'ERROR: User not found';
                WHEN OTHERS THEN ROLLBACK; p_result := 'ERROR: ' || SQLERRM;
            END SP_DELETE_USER_CASCADE
        `);
        console.log('  ✓ SP_DELETE_USER_CASCADE');

        await connection.execute(`
            CREATE OR REPLACE PROCEDURE SP_GENERATE_PLATFORM_REPORT IS
                v_users NUMBER; v_listings NUMBER; v_offers NUMBER; v_msgs NUMBER; v_val NUMBER; v_avg NUMBER;
                CURSOR c_cats IS SELECT c.NAME, COUNT(l.ID) CNT, NVL(SUM(l.PRICE),0) VAL, NVL(ROUND(AVG(l.PRICE),2),0) AV
                    FROM CATEGORIES c LEFT JOIN LISTINGS l ON c.ID = l.CATEGORY_ID GROUP BY c.NAME ORDER BY CNT DESC;
                CURSOR c_sellers IS SELECT u.USERNAME, COUNT(l.ID) CNT FROM USERS u JOIN LISTINGS l ON u.ID = l.SELLER_ID
                    GROUP BY u.USERNAME ORDER BY CNT DESC FETCH FIRST 5 ROWS ONLY;
                r_cat c_cats%ROWTYPE; r_sel c_sellers%ROWTYPE;
            BEGIN
                SELECT COUNT(*) INTO v_users FROM USERS;
                SELECT COUNT(*) INTO v_listings FROM LISTINGS;
                SELECT COUNT(*) INTO v_offers FROM OFFERS;
                SELECT COUNT(*) INTO v_msgs FROM MESSAGES;
                SELECT NVL(SUM(PRICE),0), NVL(ROUND(AVG(PRICE),2),0) INTO v_val, v_avg FROM LISTINGS;
                DBMS_OUTPUT.PUT_LINE('=== SWAPNEST PLATFORM REPORT ===');
                DBMS_OUTPUT.PUT_LINE('Users: '||v_users||' | Listings: '||v_listings||' | Offers: '||v_offers||' | Messages: '||v_msgs);
                DBMS_OUTPUT.PUT_LINE('Total Value: Rs.'||v_val||' | Avg Price: Rs.'||v_avg);
                DBMS_OUTPUT.PUT_LINE('--- Category Breakdown ---');
                OPEN c_cats; LOOP FETCH c_cats INTO r_cat; EXIT WHEN c_cats%NOTFOUND;
                    DBMS_OUTPUT.PUT_LINE('  '||r_cat.NAME||': '||r_cat.CNT||' items, Rs.'||r_cat.VAL);
                END LOOP; CLOSE c_cats;
                DBMS_OUTPUT.PUT_LINE('--- Top Sellers ---');
                OPEN c_sellers; LOOP FETCH c_sellers INTO r_sel; EXIT WHEN c_sellers%NOTFOUND;
                    DBMS_OUTPUT.PUT_LINE('  '||r_sel.USERNAME||': '||r_sel.CNT||' listings');
                END LOOP; CLOSE c_sellers;
            EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('Error: '||SQLERRM);
            END SP_GENERATE_PLATFORM_REPORT
        `);
        console.log('  ✓ SP_GENERATE_PLATFORM_REPORT');

        // ===== 7. CREATE TRIGGERS =====
        console.log('\n--- Creating Triggers ---');

        await connection.execute(`
            CREATE OR REPLACE TRIGGER TRG_SET_DEFAULT_ROLE
            BEFORE INSERT ON USERS FOR EACH ROW
            BEGIN
                IF :NEW.ROLE IS NULL THEN :NEW.ROLE := 'user'; END IF;
                IF :NEW.IS_BANNED IS NULL THEN :NEW.IS_BANNED := 0; END IF;
            END;
        `);
        console.log('  ✓ TRG_SET_DEFAULT_ROLE');

        await connection.execute(`
            CREATE OR REPLACE TRIGGER TRG_LISTING_STATUS_LOG
            AFTER UPDATE OF STATUS ON LISTINGS FOR EACH ROW
            BEGIN
                IF :OLD.STATUS IS NULL OR :OLD.STATUS != :NEW.STATUS THEN
                    INSERT INTO LISTING_AUDIT_LOG (LISTING_ID, OLD_STATUS, NEW_STATUS, REMARKS)
                    VALUES (:NEW.ID, :OLD.STATUS, :NEW.STATUS, 'Status: '||NVL(:OLD.STATUS,'NULL')||' -> '||:NEW.STATUS);
                END IF;
            END;
        `);
        console.log('  ✓ TRG_LISTING_STATUS_LOG');

        await connection.execute(`
            CREATE OR REPLACE TRIGGER TRG_AUTO_REJECT_OFFERS_ON_SOLD
            AFTER UPDATE OF STATUS ON LISTINGS FOR EACH ROW
            BEGIN
                IF :NEW.STATUS = 'sold' THEN
                    UPDATE OFFERS SET STATUS = 'rejected' 
                    WHERE LISTING_ID = :NEW.ID AND (STATUS = 'pending' OR STATUS = 'PENDING');
                END IF;
            END;
        `);
        console.log('  ✓ TRG_AUTO_REJECT_OFFERS_ON_SOLD');

        await connection.execute(`
            CREATE OR REPLACE TRIGGER TRG_PREVENT_SELF_OFFER
            BEFORE INSERT ON OFFERS FOR EACH ROW
            DECLARE v_seller NUMBER;
            BEGIN
                SELECT SELLER_ID INTO v_seller FROM LISTINGS WHERE ID = :NEW.LISTING_ID;
                IF v_seller = :NEW.BUYER_ID THEN
                    RAISE_APPLICATION_ERROR(-20001, 'Cannot offer on own listing');
                END IF;
            EXCEPTION WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20002, 'Listing not found');
            END;
        `);
        console.log('  ✓ TRG_PREVENT_SELF_OFFER');

        await connection.execute(`
            CREATE OR REPLACE TRIGGER TRG_UPDATE_TIMESTAMP
            BEFORE UPDATE ON LISTINGS FOR EACH ROW
            BEGIN
                :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
            END;
        `);
        console.log('  ✓ TRG_UPDATE_TIMESTAMP');

        // ===== VERIFICATION =====
        console.log('\n=== VERIFICATION ===');
        
        const tables = await connection.execute(
            `SELECT COUNT(*) AS CNT FROM user_tables WHERE table_name IN ('LISTING_AUDIT_LOG','ADMIN_ACTIVITY_LOG')`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`Audit Tables: ${tables.rows[0].CNT}/2`);

        const indexes = await connection.execute(
            `SELECT COUNT(*) AS CNT FROM user_indexes WHERE index_name IN ('IDX_LISTINGS_SELLER','IDX_LISTINGS_CATEGORY','IDX_LISTINGS_STATUS','IDX_OFFERS_LISTING','IDX_OFFERS_STATUS','IDX_USERS_EMAIL')`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`Indexes: ${indexes.rows[0].CNT}/6`);

        const views = await connection.execute(
            `SELECT COUNT(*) AS CNT FROM user_views WHERE view_name IN ('VW_LISTING_DETAILS','VW_USER_DASHBOARD_STATS','VW_ADMIN_PLATFORM_OVERVIEW')`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`Views: ${views.rows[0].CNT}/3`);

        const functions = await connection.execute(
            `SELECT COUNT(*) AS CNT FROM user_objects WHERE object_type='FUNCTION' AND object_name IN ('FN_GET_USER_TRUST_SCORE','FN_GET_LISTING_COUNT_BY_CATEGORY','FN_GET_TOTAL_REVENUE_POTENTIAL','FN_GET_USER_ROLE')`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`Functions: ${functions.rows[0].CNT}/4`);

        const procedures = await connection.execute(
            `SELECT COUNT(*) AS CNT FROM user_objects WHERE object_type='PROCEDURE' AND object_name IN ('SP_REGISTER_USER','SP_CREATE_LISTING','SP_ACCEPT_OFFER','SP_DELETE_USER_CASCADE','SP_GENERATE_PLATFORM_REPORT')`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`Procedures: ${procedures.rows[0].CNT}/5`);

        const triggers = await connection.execute(
            `SELECT COUNT(*) AS CNT FROM user_triggers WHERE trigger_name IN ('TRG_SET_DEFAULT_ROLE','TRG_LISTING_STATUS_LOG','TRG_AUTO_REJECT_OFFERS_ON_SOLD','TRG_PREVENT_SELF_OFFER','TRG_UPDATE_TIMESTAMP')`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`Triggers: ${triggers.rows[0].CNT}/5`);

        console.log('\n✅ All DBMS objects created successfully!');

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        if (connection) await connection.close();
    }
}

async function safeExec(connection, sql, label) {
    try {
        await connection.execute(sql);
        console.log(`  ✓ ${label}`);
    } catch (err) {
        if (err.errorNum === 955 || err.errorNum === 1430 || err.errorNum === 2275 || err.errorNum === 1408) {
            console.log(`  ○ ${label} (already exists)`);
        } else {
            console.error(`  ✗ ${label}: ${err.message}`);
        }
    }
}

run();
