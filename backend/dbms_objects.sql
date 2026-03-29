-- ============================================================
-- SwapNest — Advanced DBMS Objects
-- Stored Procedures, Functions, Triggers, Views, Indexes,
-- Cursors, and Audit Tables
-- ============================================================
-- Run inside Oracle: sqlplus project/project123@XEPDB1
-- ============================================================

SET SERVEROUTPUT ON;

-- ============================================================
-- SECTION 1: NEW TABLES (Audit & Logging)
-- ============================================================

-- 1A. LISTING_AUDIT_LOG — Tracks every listing status change
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_tables WHERE table_name = 'LISTING_AUDIT_LOG';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE AUDIT_LOG_SEQ START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE '
      CREATE TABLE LISTING_AUDIT_LOG (
        ID            NUMBER DEFAULT AUDIT_LOG_SEQ.NEXTVAL PRIMARY KEY,
        LISTING_ID    NUMBER NOT NULL,
        OLD_STATUS    VARCHAR2(20),
        NEW_STATUS    VARCHAR2(20),
        CHANGED_BY    NUMBER,
        CHANGED_AT    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        REMARKS       VARCHAR2(500)
      )';
    DBMS_OUTPUT.PUT_LINE('Created LISTING_AUDIT_LOG table.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('LISTING_AUDIT_LOG already exists.');
  END IF;
END;
/

-- 1B. ADMIN_ACTIVITY_LOG — Tracks all admin actions
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_tables WHERE table_name = 'ADMIN_ACTIVITY_LOG';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE ADMIN_LOG_SEQ START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE '
      CREATE TABLE ADMIN_ACTIVITY_LOG (
        ID            NUMBER DEFAULT ADMIN_LOG_SEQ.NEXTVAL PRIMARY KEY,
        ADMIN_ID      NUMBER NOT NULL,
        ACTION_TYPE   VARCHAR2(50) NOT NULL,
        TARGET_TABLE  VARCHAR2(50),
        TARGET_ID     NUMBER,
        DESCRIPTION   VARCHAR2(1000),
        ACTION_AT     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )';
    DBMS_OUTPUT.PUT_LINE('Created ADMIN_ACTIVITY_LOG table.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ADMIN_ACTIVITY_LOG already exists.');
  END IF;
END;
/

-- 1C. Add UPDATED_AT and IS_BANNED columns if not exist
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_tab_columns 
  WHERE table_name = 'LISTINGS' AND column_name = 'UPDATED_AT';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE LISTINGS ADD (UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP)';
    DBMS_OUTPUT.PUT_LINE('Added UPDATED_AT column to LISTINGS.');
  END IF;
END;
/

DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_tab_columns 
  WHERE table_name = 'USERS' AND column_name = 'IS_BANNED';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE USERS ADD (IS_BANNED NUMBER(1) DEFAULT 0)';
    DBMS_OUTPUT.PUT_LINE('Added IS_BANNED column to USERS.');
  END IF;
END;
/

COMMIT;

-- ============================================================
-- SECTION 2: INDEXES (Performance Optimization)
-- ============================================================

-- Index 1: Fast lookup of listings by seller
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_indexes WHERE index_name = 'IDX_LISTINGS_SELLER';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_LISTINGS_SELLER ON LISTINGS(SELLER_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IDX_LISTINGS_SELLER.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IDX_LISTINGS_SELLER already exists.');
  END IF;
END;
/

-- Index 2: Fast category filtering
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_indexes WHERE index_name = 'IDX_LISTINGS_CATEGORY';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_LISTINGS_CATEGORY ON LISTINGS(CATEGORY_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IDX_LISTINGS_CATEGORY.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IDX_LISTINGS_CATEGORY already exists.');
  END IF;
END;
/

-- Index 3: Fast status filtering
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_indexes WHERE index_name = 'IDX_LISTINGS_STATUS';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_LISTINGS_STATUS ON LISTINGS(STATUS)';
    DBMS_OUTPUT.PUT_LINE('Created IDX_LISTINGS_STATUS.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IDX_LISTINGS_STATUS already exists.');
  END IF;
END;
/

-- Index 4: Fast offer lookup per listing
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_indexes WHERE index_name = 'IDX_OFFERS_LISTING';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_OFFERS_LISTING ON OFFERS(LISTING_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IDX_OFFERS_LISTING.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IDX_OFFERS_LISTING already exists.');
  END IF;
END;
/

-- Index 5: Fast offer status filtering
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_indexes WHERE index_name = 'IDX_OFFERS_STATUS';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_OFFERS_STATUS ON OFFERS(STATUS)';
    DBMS_OUTPUT.PUT_LINE('Created IDX_OFFERS_STATUS.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IDX_OFFERS_STATUS already exists.');
  END IF;
END;
/

-- Index 6: Fast login lookup by email
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_indexes WHERE index_name = 'IDX_USERS_EMAIL';
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_USERS_EMAIL ON USERS(EMAIL)';
    DBMS_OUTPUT.PUT_LINE('Created IDX_USERS_EMAIL.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IDX_USERS_EMAIL already exists.');
  END IF;
END;
/

-- ============================================================
-- SECTION 3: VIEWS (Pre-built Queries)
-- ============================================================

-- View 1: VW_LISTING_DETAILS — Complete listing info with joins
CREATE OR REPLACE VIEW VW_LISTING_DETAILS AS
SELECT 
    l.ID,
    l.TITLE,
    l.DESCRIPTION,
    l.PRICE,
    l.LOCATION,
    l.ITEM_CONDITION,
    l.STATUS,
    l.CREATED_AT,
    l.UPDATED_AT,
    c.ID AS CATEGORY_ID,
    c.NAME AS CATEGORY_NAME,
    u.ID AS SELLER_ID,
    u.USERNAME AS SELLER_NAME,
    u.EMAIL AS SELLER_EMAIL,
    (SELECT MIN(i.IMAGE_URL) FROM IMAGES i WHERE i.LISTING_ID = l.ID) AS IMAGE_URL
FROM LISTINGS l
JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
JOIN USERS u ON l.SELLER_ID = u.ID;

-- View 2: VW_USER_DASHBOARD_STATS — Per-user aggregated statistics
CREATE OR REPLACE VIEW VW_USER_DASHBOARD_STATS AS
SELECT 
    u.ID AS USER_ID,
    u.USERNAME,
    u.EMAIL,
    u.ROLE,
    u.IS_BANNED,
    u.CREATED_AT,
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
FROM USERS u;

-- View 3: VW_ADMIN_PLATFORM_OVERVIEW — Platform-wide stats for admin
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
FROM DUAL;

DBMS_OUTPUT.PUT_LINE('Views created successfully.');

-- ============================================================
-- SECTION 4: FUNCTIONS (Reusable Computations)
-- ============================================================

-- Function 1: FN_GET_USER_TRUST_SCORE
-- Calculates a trust score for a user based on their platform activity
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
    
    IF v_trust_score > 100 THEN
        v_trust_score := 100;
    END IF;
    
    RETURN v_trust_score;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END FN_GET_USER_TRUST_SCORE;
/

-- Function 2: FN_GET_LISTING_COUNT_BY_CATEGORY
-- Returns the number of active listings in a given category
CREATE OR REPLACE FUNCTION FN_GET_LISTING_COUNT_BY_CATEGORY(p_category_id IN NUMBER)
RETURN NUMBER
IS
    v_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM LISTINGS 
    WHERE CATEGORY_ID = p_category_id 
    AND (STATUS = 'active' OR STATUS IS NULL);
    
    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END FN_GET_LISTING_COUNT_BY_CATEGORY;
/

-- Function 3: FN_GET_TOTAL_REVENUE_POTENTIAL
-- Returns the total price sum of all active listings
CREATE OR REPLACE FUNCTION FN_GET_TOTAL_REVENUE_POTENTIAL
RETURN NUMBER
IS
    v_total NUMBER := 0;
BEGIN
    SELECT NVL(SUM(PRICE), 0) INTO v_total 
    FROM LISTINGS 
    WHERE STATUS = 'active' OR STATUS IS NULL;
    
    RETURN v_total;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END FN_GET_TOTAL_REVENUE_POTENTIAL;
/

-- Function 4: FN_GET_USER_ROLE
-- Returns the role of a user by their ID
CREATE OR REPLACE FUNCTION FN_GET_USER_ROLE(p_user_id IN NUMBER)
RETURN VARCHAR2
IS
    v_role VARCHAR2(20);
BEGIN
    SELECT NVL(ROLE, 'user') INTO v_role FROM USERS WHERE ID = p_user_id;
    RETURN v_role;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'unknown';
    WHEN OTHERS THEN
        RETURN 'error';
END FN_GET_USER_ROLE;
/

-- ============================================================
-- SECTION 5: STORED PROCEDURES (Business Logic)
-- ============================================================

-- Procedure 1: SP_REGISTER_USER
-- Registers a new user with duplicate checking
CREATE OR REPLACE PROCEDURE SP_REGISTER_USER(
    p_username  IN VARCHAR2,
    p_email     IN VARCHAR2,
    p_password  IN VARCHAR2,
    p_result    OUT VARCHAR2,
    p_user_id   OUT NUMBER
)
IS
    v_count NUMBER;
BEGIN
    -- Check for duplicate username
    SELECT COUNT(*) INTO v_count FROM USERS WHERE USERNAME = p_username;
    IF v_count > 0 THEN
        p_result := 'ERROR: Username already exists';
        p_user_id := -1;
        RETURN;
    END IF;
    
    -- Check for duplicate email
    SELECT COUNT(*) INTO v_count FROM USERS WHERE EMAIL = p_email;
    IF v_count > 0 THEN
        p_result := 'ERROR: Email already exists';
        p_user_id := -1;
        RETURN;
    END IF;
    
    -- Insert user
    INSERT INTO USERS (USERNAME, EMAIL, PASSWORD, ROLE, IS_BANNED)
    VALUES (p_username, p_email, p_password, 'user', 0)
    RETURNING ID INTO p_user_id;
    
    COMMIT;
    p_result := 'SUCCESS: User registered';
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'ERROR: ' || SQLERRM;
        p_user_id := -1;
END SP_REGISTER_USER;
/

-- Procedure 2: SP_CREATE_LISTING
-- Creates a listing and optionally inserts an image in one transaction
CREATE OR REPLACE PROCEDURE SP_CREATE_LISTING(
    p_title         IN VARCHAR2,
    p_description   IN CLOB,
    p_price         IN NUMBER,
    p_location      IN VARCHAR2,
    p_condition     IN VARCHAR2,
    p_category_id   IN NUMBER,
    p_seller_id     IN NUMBER,
    p_image_url     IN VARCHAR2 DEFAULT NULL,
    p_listing_id    OUT NUMBER,
    p_result        OUT VARCHAR2
)
IS
BEGIN
    -- Insert the listing
    INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, ITEM_CONDITION, CATEGORY_ID, SELLER_ID, STATUS)
    VALUES (p_title, p_description, p_price, p_location, p_condition, p_category_id, p_seller_id, 'active')
    RETURNING ID INTO p_listing_id;
    
    -- Insert image if provided
    IF p_image_url IS NOT NULL THEN
        INSERT INTO IMAGES (LISTING_ID, IMAGE_URL)
        VALUES (p_listing_id, p_image_url);
    END IF;
    
    COMMIT;
    p_result := 'SUCCESS';
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_listing_id := -1;
        p_result := 'ERROR: ' || SQLERRM;
END SP_CREATE_LISTING;
/

-- Procedure 3: SP_ACCEPT_OFFER
-- Accepts an offer, rejects all competing offers, marks listing as reserved
-- Uses a CURSOR to iterate over competing offers
CREATE OR REPLACE PROCEDURE SP_ACCEPT_OFFER(
    p_offer_id   IN NUMBER,
    p_seller_id  IN NUMBER,
    p_result     OUT VARCHAR2
)
IS
    v_listing_id   NUMBER;
    v_offer_seller NUMBER;
    v_offer_status VARCHAR2(20);
    
    -- CURSOR: Iterate over all other pending offers for the same listing
    CURSOR c_competing_offers(c_listing_id NUMBER, c_offer_id NUMBER) IS
        SELECT ID FROM OFFERS 
        WHERE LISTING_ID = c_listing_id 
        AND ID != c_offer_id 
        AND (STATUS = 'pending' OR STATUS = 'PENDING');
    
    v_competing_id NUMBER;
BEGIN
    -- Validate the offer exists and belongs to seller
    SELECT LISTING_ID, SELLER_ID, STATUS 
    INTO v_listing_id, v_offer_seller, v_offer_status
    FROM OFFERS WHERE ID = p_offer_id;
    
    IF v_offer_seller != p_seller_id THEN
        p_result := 'ERROR: Only the seller can accept this offer';
        RETURN;
    END IF;
    
    IF v_offer_status NOT IN ('pending', 'PENDING') THEN
        p_result := 'ERROR: Offer is not in pending status';
        RETURN;
    END IF;
    
    -- Accept the offer
    UPDATE OFFERS SET STATUS = 'accepted' WHERE ID = p_offer_id;
    
    -- Use CURSOR to reject all competing offers
    OPEN c_competing_offers(v_listing_id, p_offer_id);
    LOOP
        FETCH c_competing_offers INTO v_competing_id;
        EXIT WHEN c_competing_offers%NOTFOUND;
        UPDATE OFFERS SET STATUS = 'rejected' WHERE ID = v_competing_id;
    END LOOP;
    CLOSE c_competing_offers;
    
    -- Mark listing as reserved
    UPDATE LISTINGS SET STATUS = 'reserved' WHERE ID = v_listing_id;
    
    COMMIT;
    p_result := 'SUCCESS: Offer accepted, competing offers rejected, listing reserved';
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := 'ERROR: Offer not found';
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'ERROR: ' || SQLERRM;
END SP_ACCEPT_OFFER;
/

-- Procedure 4: SP_DELETE_USER_CASCADE
-- Deletes a user and ALL associated data across every table
CREATE OR REPLACE PROCEDURE SP_DELETE_USER_CASCADE(
    p_user_id    IN NUMBER,
    p_admin_id   IN NUMBER,
    p_result     OUT VARCHAR2
)
IS
    v_username VARCHAR2(50);
    v_listing_id NUMBER;
    
    -- CURSOR: Iterate over all listings owned by the user
    CURSOR c_user_listings IS
        SELECT ID FROM LISTINGS WHERE SELLER_ID = p_user_id;
BEGIN
    -- Get username for logging
    SELECT USERNAME INTO v_username FROM USERS WHERE ID = p_user_id;
    
    -- Cannot delete self
    IF p_user_id = p_admin_id THEN
        p_result := 'ERROR: Cannot delete your own account';
        RETURN;
    END IF;
    
    -- Delete all messages involving this user
    DELETE FROM MESSAGES WHERE SENDER_ID = p_user_id OR RECEIVER_ID = p_user_id;
    
    -- Delete all offers involving this user
    DELETE FROM OFFERS WHERE BUYER_ID = p_user_id OR SELLER_ID = p_user_id;
    
    -- Delete all wishlist items
    DELETE FROM WISHLIST WHERE USER_ID = p_user_id;
    
    -- Use CURSOR to delete images for each listing, then listings
    OPEN c_user_listings;
    LOOP
        FETCH c_user_listings INTO v_listing_id;
        EXIT WHEN c_user_listings%NOTFOUND;
        DELETE FROM IMAGES WHERE LISTING_ID = v_listing_id;
        DELETE FROM WISHLIST WHERE LISTING_ID = v_listing_id;
    END LOOP;
    CLOSE c_user_listings;
    
    -- Delete listings owned by user
    DELETE FROM LISTINGS WHERE SELLER_ID = p_user_id;
    
    -- Delete the user
    DELETE FROM USERS WHERE ID = p_user_id;
    
    -- Log admin action
    INSERT INTO ADMIN_ACTIVITY_LOG (ADMIN_ID, ACTION_TYPE, TARGET_TABLE, TARGET_ID, DESCRIPTION)
    VALUES (p_admin_id, 'DELETE_USER', 'USERS', p_user_id, 'Deleted user: ' || v_username);
    
    COMMIT;
    p_result := 'SUCCESS: User ' || v_username || ' and all related data deleted';
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := 'ERROR: User not found';
    WHEN OTHERS THEN
        ROLLBACK;
        p_result := 'ERROR: ' || SQLERRM;
END SP_DELETE_USER_CASCADE;
/

-- Procedure 5: SP_GENERATE_PLATFORM_REPORT
-- Generates a comprehensive platform report using cursors and DBMS_OUTPUT
CREATE OR REPLACE PROCEDURE SP_GENERATE_PLATFORM_REPORT
IS
    v_total_users     NUMBER;
    v_total_listings  NUMBER;
    v_total_offers    NUMBER;
    v_total_messages  NUMBER;
    v_total_value     NUMBER;
    v_avg_price       NUMBER;
    
    -- CURSOR: Category-wise statistics
    CURSOR c_category_stats IS
        SELECT c.NAME, 
               COUNT(l.ID) AS LISTING_COUNT,
               NVL(SUM(l.PRICE), 0) AS TOTAL_VALUE,
               NVL(ROUND(AVG(l.PRICE), 2), 0) AS AVG_PRICE
        FROM CATEGORIES c
        LEFT JOIN LISTINGS l ON c.ID = l.CATEGORY_ID
        GROUP BY c.NAME
        ORDER BY LISTING_COUNT DESC;
    
    -- CURSOR: Top 5 sellers by listing count
    CURSOR c_top_sellers IS
        SELECT u.USERNAME, COUNT(l.ID) AS LISTING_COUNT
        FROM USERS u
        JOIN LISTINGS l ON u.ID = l.SELLER_ID
        GROUP BY u.USERNAME
        ORDER BY LISTING_COUNT DESC
        FETCH FIRST 5 ROWS ONLY;
        
    v_cat_name    VARCHAR2(100);
    v_cat_count   NUMBER;
    v_cat_value   NUMBER;
    v_cat_avg     NUMBER;
    v_seller_name VARCHAR2(50);
    v_seller_cnt  NUMBER;
BEGIN
    -- Get overall stats
    SELECT COUNT(*) INTO v_total_users FROM USERS;
    SELECT COUNT(*) INTO v_total_listings FROM LISTINGS;
    SELECT COUNT(*) INTO v_total_offers FROM OFFERS;
    SELECT COUNT(*) INTO v_total_messages FROM MESSAGES;
    SELECT NVL(SUM(PRICE), 0), NVL(ROUND(AVG(PRICE), 2), 0) 
    INTO v_total_value, v_avg_price FROM LISTINGS;
    
    DBMS_OUTPUT.PUT_LINE('==========================================');
    DBMS_OUTPUT.PUT_LINE('     SWAPNEST PLATFORM REPORT');
    DBMS_OUTPUT.PUT_LINE('==========================================');
    DBMS_OUTPUT.PUT_LINE('Total Users:    ' || v_total_users);
    DBMS_OUTPUT.PUT_LINE('Total Listings: ' || v_total_listings);
    DBMS_OUTPUT.PUT_LINE('Total Offers:   ' || v_total_offers);
    DBMS_OUTPUT.PUT_LINE('Total Messages: ' || v_total_messages);
    DBMS_OUTPUT.PUT_LINE('Total Value:    Rs.' || v_total_value);
    DBMS_OUTPUT.PUT_LINE('Avg Price:      Rs.' || v_avg_price);
    DBMS_OUTPUT.PUT_LINE('------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('CATEGORY-WISE BREAKDOWN:');
    
    -- Use cursor for category stats
    OPEN c_category_stats;
    LOOP
        FETCH c_category_stats INTO v_cat_name, v_cat_count, v_cat_value, v_cat_avg;
        EXIT WHEN c_category_stats%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE('  ' || RPAD(v_cat_name, 15) || ' | Items: ' || v_cat_count || 
                             ' | Value: Rs.' || v_cat_value || ' | Avg: Rs.' || v_cat_avg);
    END LOOP;
    CLOSE c_category_stats;
    
    DBMS_OUTPUT.PUT_LINE('------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('TOP 5 SELLERS:');
    
    -- Use cursor for top sellers
    OPEN c_top_sellers;
    LOOP
        FETCH c_top_sellers INTO v_seller_name, v_seller_cnt;
        EXIT WHEN c_top_sellers%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE('  ' || RPAD(v_seller_name, 20) || ' | Listings: ' || v_seller_cnt);
    END LOOP;
    CLOSE c_top_sellers;
    
    DBMS_OUTPUT.PUT_LINE('==========================================');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error generating report: ' || SQLERRM);
END SP_GENERATE_PLATFORM_REPORT;
/

-- ============================================================
-- SECTION 6: TRIGGERS (Auto-firing Business Rules)
-- ============================================================

-- Trigger 1: TRG_SET_DEFAULT_ROLE
-- Automatically sets ROLE to 'user' if not provided during registration
CREATE OR REPLACE TRIGGER TRG_SET_DEFAULT_ROLE
BEFORE INSERT ON USERS
FOR EACH ROW
BEGIN
    IF :NEW.ROLE IS NULL THEN
        :NEW.ROLE := 'user';
    END IF;
    IF :NEW.IS_BANNED IS NULL THEN
        :NEW.IS_BANNED := 0;
    END IF;
END;
/

-- Trigger 2: TRG_LISTING_STATUS_LOG
-- Logs every listing status change into the audit table
CREATE OR REPLACE TRIGGER TRG_LISTING_STATUS_LOG
AFTER UPDATE OF STATUS ON LISTINGS
FOR EACH ROW
BEGIN
    IF :OLD.STATUS IS NULL OR :OLD.STATUS != :NEW.STATUS THEN
        INSERT INTO LISTING_AUDIT_LOG (LISTING_ID, OLD_STATUS, NEW_STATUS, REMARKS)
        VALUES (:NEW.ID, :OLD.STATUS, :NEW.STATUS, 
                'Status changed from ' || NVL(:OLD.STATUS, 'NULL') || ' to ' || :NEW.STATUS);
    END IF;
END;
/

-- Trigger 3: TRG_AUTO_REJECT_OFFERS_ON_SOLD
-- When listing status changes to 'sold', auto-reject all pending offers
CREATE OR REPLACE TRIGGER TRG_AUTO_REJECT_OFFERS_ON_SOLD
AFTER UPDATE OF STATUS ON LISTINGS
FOR EACH ROW
BEGIN
    IF :NEW.STATUS = 'sold' THEN
        UPDATE OFFERS 
        SET STATUS = 'rejected' 
        WHERE LISTING_ID = :NEW.ID 
        AND (STATUS = 'pending' OR STATUS = 'PENDING');
    END IF;
END;
/

-- Trigger 4: TRG_PREVENT_SELF_OFFER
-- Prevents a user from making an offer on their own listing
CREATE OR REPLACE TRIGGER TRG_PREVENT_SELF_OFFER
BEFORE INSERT ON OFFERS
FOR EACH ROW
DECLARE
    v_seller_id NUMBER;
BEGIN
    SELECT SELLER_ID INTO v_seller_id FROM LISTINGS WHERE ID = :NEW.LISTING_ID;
    IF v_seller_id = :NEW.BUYER_ID THEN
        RAISE_APPLICATION_ERROR(-20001, 'You cannot make an offer on your own listing');
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20002, 'Listing not found');
END;
/

-- Trigger 5: TRG_UPDATE_TIMESTAMP
-- Auto-updates UPDATED_AT timestamp when a listing is modified
CREATE OR REPLACE TRIGGER TRG_UPDATE_TIMESTAMP
BEFORE UPDATE ON LISTINGS
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
END;
/

-- ============================================================
-- VERIFICATION: Test that all objects exist
-- ============================================================
DECLARE
    v_count NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('=== VERIFICATION SUMMARY ===');
    
    -- Check tables
    SELECT COUNT(*) INTO v_count FROM user_tables 
    WHERE table_name IN ('LISTING_AUDIT_LOG', 'ADMIN_ACTIVITY_LOG');
    DBMS_OUTPUT.PUT_LINE('Audit Tables: ' || v_count || '/2');
    
    -- Check indexes
    SELECT COUNT(*) INTO v_count FROM user_indexes 
    WHERE index_name IN ('IDX_LISTINGS_SELLER', 'IDX_LISTINGS_CATEGORY', 'IDX_LISTINGS_STATUS',
                         'IDX_OFFERS_LISTING', 'IDX_OFFERS_STATUS', 'IDX_USERS_EMAIL');
    DBMS_OUTPUT.PUT_LINE('Indexes: ' || v_count || '/6');
    
    -- Check views
    SELECT COUNT(*) INTO v_count FROM user_views 
    WHERE view_name IN ('VW_LISTING_DETAILS', 'VW_USER_DASHBOARD_STATS', 'VW_ADMIN_PLATFORM_OVERVIEW');
    DBMS_OUTPUT.PUT_LINE('Views: ' || v_count || '/3');
    
    -- Check functions
    SELECT COUNT(*) INTO v_count FROM user_objects 
    WHERE object_type = 'FUNCTION' 
    AND object_name IN ('FN_GET_USER_TRUST_SCORE', 'FN_GET_LISTING_COUNT_BY_CATEGORY', 
                        'FN_GET_TOTAL_REVENUE_POTENTIAL', 'FN_GET_USER_ROLE');
    DBMS_OUTPUT.PUT_LINE('Functions: ' || v_count || '/4');
    
    -- Check procedures
    SELECT COUNT(*) INTO v_count FROM user_objects 
    WHERE object_type = 'PROCEDURE' 
    AND object_name IN ('SP_REGISTER_USER', 'SP_CREATE_LISTING', 'SP_ACCEPT_OFFER', 
                        'SP_DELETE_USER_CASCADE', 'SP_GENERATE_PLATFORM_REPORT');
    DBMS_OUTPUT.PUT_LINE('Procedures: ' || v_count || '/5');
    
    -- Check triggers
    SELECT COUNT(*) INTO v_count FROM user_triggers 
    WHERE trigger_name IN ('TRG_SET_DEFAULT_ROLE', 'TRG_LISTING_STATUS_LOG', 
                           'TRG_AUTO_REJECT_OFFERS_ON_SOLD', 'TRG_PREVENT_SELF_OFFER', 'TRG_UPDATE_TIMESTAMP');
    DBMS_OUTPUT.PUT_LINE('Triggers: ' || v_count || '/5');
    
    DBMS_OUTPUT.PUT_LINE('============================');
END;
/

COMMIT;
