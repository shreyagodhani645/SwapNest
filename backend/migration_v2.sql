-- ============================================================
-- SwapNest Enhancement Migration Script
-- Run inside Docker: 
--   docker exec -it oracle-db sqlplus project/project123@XEPDB1
-- ============================================================

SET SERVEROUTPUT ON;

-- 1. Add ROLE column to USERS table
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_tab_columns 
  WHERE table_name = 'USERS' AND column_name = 'ROLE';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE USERS ADD (ROLE VARCHAR2(20) DEFAULT ''user'')';
    DBMS_OUTPUT.PUT_LINE('Added ROLE column to USERS.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ROLE column already exists in USERS.');
  END IF;
END;
/

-- 2. Add STATUS column to LISTINGS table
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_tab_columns 
  WHERE table_name = 'LISTINGS' AND column_name = 'STATUS';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE LISTINGS ADD (STATUS VARCHAR2(20) DEFAULT ''active'')';
    DBMS_OUTPUT.PUT_LINE('Added STATUS column to LISTINGS.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('STATUS column already exists in LISTINGS.');
  END IF;
END;
/

-- 3. Ensure OFFER_PRICE column exists in OFFERS
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_tab_columns 
  WHERE table_name = 'OFFERS' AND column_name = 'OFFER_PRICE';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE OFFERS ADD (OFFER_PRICE NUMBER(10, 2))';
    -- Migrate data from AMOUNT if it exists
    BEGIN
      EXECUTE IMMEDIATE 'UPDATE OFFERS SET OFFER_PRICE = AMOUNT WHERE OFFER_PRICE IS NULL';
      DBMS_OUTPUT.PUT_LINE('Migrated AMOUNT -> OFFER_PRICE and added column.');
    EXCEPTION
      WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('OFFER_PRICE column added (no AMOUNT column to migrate).');
    END;
  ELSE
    DBMS_OUTPUT.PUT_LINE('OFFER_PRICE column already exists in OFFERS.');
  END IF;
END;
/

-- 4. Ensure SELLER_ID column exists in OFFERS
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_tab_columns 
  WHERE table_name = 'OFFERS' AND column_name = 'SELLER_ID';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE OFFERS ADD (SELLER_ID NUMBER)';
    DBMS_OUTPUT.PUT_LINE('Added SELLER_ID column to OFFERS.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('SELLER_ID column already exists in OFFERS.');
  END IF;
END;
/

COMMIT;

-- ============================================================
-- NOTE: To create an admin user, run this Node.js script first
-- to generate a bcrypt hash, then insert the user:
--
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h))"
--
-- Then run:
-- INSERT INTO USERS (USERNAME, EMAIL, PASSWORD, ROLE) 
-- VALUES ('admin', 'admin@swapnest.com', '<paste_hash_here>', 'admin');
-- COMMIT;
-- ============================================================

EXIT;
