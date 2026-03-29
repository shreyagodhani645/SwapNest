# SwapNest — Online Second-Hand Marketplace
## Database Management System Project Report

---

**Subject:** Database Management Systems (DBMS)  
**Semester:** 6th Semester  
**Academic Year:** 2025–2026  
**Project Title:** SwapNest — Online Second-Hand Marketplace  
**Technology Stack:** React.js (Vite) + Node.js (Express) + Oracle Database 21c XE  

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [System Architecture](#3-system-architecture)
4. [Database Design](#4-database-design)
5. [Tables & Schema](#5-tables--schema)
6. [Sequences](#6-sequences)
7. [Indexes](#7-indexes)
8. [Views](#8-views)
9. [Stored Procedures](#9-stored-procedures)
10. [Functions](#10-functions)
11. [Triggers](#11-triggers)
12. [Cursors](#12-cursors)
13. [Application Features](#13-application-features)
14. [Admin Panel Features](#14-admin-panel-features)
15. [API Documentation](#15-api-documentation)
16. [How to Run the Project](#16-how-to-run-the-project)
17. [Testing Guide](#17-testing-guide)
18. [Conclusion & Future Scope](#18-conclusion--future-scope)

---

## 1. Abstract

SwapNest is a full-stack online second-hand marketplace platform designed to demonstrate comprehensive implementation of DBMS concepts using Oracle Database. The application enables users to buy, sell, and negotiate pre-owned items through a feature-rich web interface. Key DBMS concepts implemented include **Tables (9), Sequences (7), Indexes (7), Views (3), Stored Procedures (5), Functions (4), Triggers (5), and Cursors** — all tightly integrated into the application's business logic. The platform features user authentication with role-based access control, real-time chat via WebSockets, an offer/negotiation system, wishlist management, and a comprehensive admin dashboard with audit logging. The project showcases how advanced database objects can be used in a production-grade application to enforce business rules, optimize performance, and maintain data integrity.

---

## 2. Introduction

### 2.1 Problem Statement
The second-hand goods market lacks a structured, trustworthy online platform where users can list, browse, negotiate, and purchase pre-owned items with confidence. Existing solutions often lack integrated negotiation features, real-time communication, and robust admin oversight.

### 2.2 Objectives
- Design and implement a **normalized relational database** using Oracle DB
- Demonstrate all core DBMS concepts: **Tables, Sequences, Indexes, Views, Stored Procedures, Functions, Triggers, and Cursors**
- Build a full-stack web application with user authentication, CRUD operations, and real-time features
- Implement a comprehensive **admin panel** with audit logging and analytics
- Ensure data integrity through constraints, triggers, and stored procedures

### 2.3 Scope
The project covers user registration/login, listing management, category management, offer/negotiation system, real-time chat, wishlist functionality, user profiles with trust scores, and full administrative control with audit trails.

---

## 3. System Architecture

### 3.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js (Vite) | Single Page Application UI |
| **Backend** | Node.js + Express.js | REST API Server |
| **Database** | Oracle Database 21c XE | Relational Data Storage |
| **Real-time** | Socket.io | WebSocket Chat |
| **Auth** | JWT + bcrypt | Token-based Authentication |
| **File Upload** | Multer | Image Upload Handling |
| **Containerization** | Docker | Oracle DB Container |

### 3.2 Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                       │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────────────┐ │
│  │  React.js   │  │  Axios   │  │    Socket.io Client  │ │
│  │  (Vite SPA) │  │  (HTTP)  │  │    (WebSocket)       │ │
│  └──────┬──────┘  └────┬─────┘  └──────────┬──────────┘ │
└─────────┼──────────────┼───────────────────┼────────────┘
          │              │                   │
          ▼              ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│                  SERVER (Node.js + Express)               │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │
│  │   Routes   │ │ Middleware │ │   Controllers       │   │
│  │ /api/auth  │ │  JWT Auth  │ │  authController     │   │
│  │ /api/list  │ │  Admin     │ │  listingsController │   │
│  │ /api/offer │ │  Upload    │ │  adminController    │   │
│  │ /api/admin │ │            │ │  offersController   │   │
│  │ /api/chat  │ │            │ │  chatController     │   │
│  └────────────┘ └────────────┘ └──────────┬─────────┘   │
│                                           │              │
│                    ┌──────────────────────┘              │
│                    ▼                                      │
│           ┌────────────────┐                             │
│           │  Oracle DB     │                             │
│           │  Connection    │                             │
│           │  Pool (db.js)  │                             │
│           └───────┬────────┘                             │
└───────────────────┼──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│            ORACLE DATABASE 21c XE (Docker)               │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Tables  │ │ Views   │ │ Triggers │ │  Stored      │ │
│  │ (9)     │ │ (3)     │ │ (5)      │ │  Procedures  │ │
│  ├─────────┤ ├─────────┤ ├──────────┤ │  (5)         │ │
│  │Indexes  │ │Functions│ │Sequences │ ├──────────────┤ │
│  │ (7)     │ │ (4)     │ │ (7)      │ │  Cursors     │ │
│  └─────────┘ └─────────┘ └──────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 3.3 ER Diagram

```
    ┌──────────┐       ┌───────────────┐       ┌──────────────┐
    │  USERS   │       │   LISTINGS    │       │  CATEGORIES  │
    ├──────────┤       ├───────────────┤       ├──────────────┤
    │*ID       │──┐    │*ID            │    ┌──│*ID           │
    │ USERNAME │  │    │ TITLE         │    │  │ NAME         │
    │ EMAIL    │  │    │ DESCRIPTION   │    │  └──────────────┘
    │ PASSWORD │  ├───▶│ SELLER_ID(FK) │    │
    │ PHONE    │  │    │ CATEGORY_ID(FK)│◀──┘
    │ ROLE     │  │    │ PRICE         │
    │ IS_BANNED│  │    │ LOCATION      │
    │CREATED_AT│  │    │ STATUS        │
    └──────────┘  │    │ ITEM_CONDITION│
         │        │    │ CREATED_AT    │
         │        │    │ UPDATED_AT    │
         │        │    └───────┬───────┘
         │        │            │
         │        │     ┌──────┴──────┐
         │        │     │             │
    ┌────┴────┐   │  ┌──┴─────┐  ┌───┴──────┐
    │WISHLIST │   │  │ IMAGES │  │  OFFERS  │
    ├─────────┤   │  ├────────┤  ├──────────┤
    │*USER_ID │   │  │*ID     │  │*ID       │
    │*LIST_ID │   │  │LIST_ID │  │ LIST_ID  │
    │ ADDED_AT│   │  │IMG_URL │  │ BUYER_ID │
    └─────────┘   │  └────────┘  │ SELLER_ID│
                  │              │OFFER_PRICE│
    ┌─────────┐   │              │ STATUS   │
    │MESSAGES │   │              │CREATED_AT│
    ├─────────┤   │              └──────────┘
    │*ID      │   │
    │LIST_ID  │◀──┤   ┌──────────────────┐
    │SENDER_ID│◀──┤   │LISTING_AUDIT_LOG │
    │RECV_ID  │◀──┘   ├──────────────────┤
    │ CONTENT │       │*ID               │
    │ IS_READ │       │ LISTING_ID       │
    │CREATED_AT│      │ OLD_STATUS       │
    └─────────┘       │ NEW_STATUS       │
                      │ CHANGED_AT       │
                      │ REMARKS          │
    ┌──────────────────┴─┐
    │ADMIN_ACTIVITY_LOG  │
    ├────────────────────┤
    │*ID                 │
    │ ADMIN_ID           │
    │ ACTION_TYPE        │
    │ TARGET_TABLE       │
    │ TARGET_ID          │
    │ DESCRIPTION        │
    │ ACTION_AT          │
    └────────────────────┘
```

---

## 4. Database Design

### 4.1 Normalization

The database is designed in **Third Normal Form (3NF)**:

- **1NF:** All columns contain atomic values. No repeating groups. Each table has a primary key.
- **2NF:** All non-key attributes are fully dependent on the primary key. No partial dependencies (composite keys in WISHLIST have both columns as the key).
- **3NF:** No transitive dependencies. Category name is in a separate CATEGORIES table (not repeated in LISTINGS). Seller info is in USERS (not duplicated in LISTINGS).

### 4.2 Constraints Used

| Constraint Type | Usage |
|----------------|-------|
| **PRIMARY KEY** | Every table has an auto-generated ID (except WISHLIST which uses composite PK) |
| **FOREIGN KEY** | 12 foreign key relationships across tables |
| **NOT NULL** | Essential columns like USERNAME, EMAIL, PASSWORD, TITLE, PRICE |
| **UNIQUE** | USERNAME and EMAIL in USERS, NAME in CATEGORIES |
| **DEFAULT** | STATUS defaults to 'active', ROLE defaults to 'user', IS_BANNED defaults to 0 |
| **ON DELETE CASCADE** | Deleting a user cascades to their listings, messages, and wishlist |
| **CHECK (via Trigger)** | TRG_PREVENT_SELF_OFFER prevents users from making offers on their own listings |

---

## 5. Tables & Schema

The database consists of **9 tables**. Below are the complete CREATE TABLE statements:

### Table 1: USERS
```sql
CREATE TABLE USERS (
    ID              NUMBER DEFAULT USERS_SEQ.NEXTVAL PRIMARY KEY,
    USERNAME        VARCHAR2(50) NOT NULL UNIQUE,
    EMAIL           VARCHAR2(100) NOT NULL UNIQUE,
    PASSWORD        VARCHAR2(255) NOT NULL,
    PHONE           VARCHAR2(20),
    PROFILE_PICTURE VARCHAR2(500),
    ROLE            VARCHAR2(20) DEFAULT 'user',
    IS_BANNED       NUMBER(1) DEFAULT 0,
    CREATED_AT      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** Stores user account information including authentication data, profile details, and role-based access control.

### Table 2: CATEGORIES
```sql
CREATE TABLE CATEGORIES (
    ID   NUMBER DEFAULT CATEGORIES_SEQ.NEXTVAL PRIMARY KEY,
    NAME VARCHAR2(100) NOT NULL UNIQUE
);
```
**Purpose:** Master table for product categories. Ensures normalized design by separating category names from listings.

### Table 3: LISTINGS
```sql
CREATE TABLE LISTINGS (
    ID             NUMBER DEFAULT LISTINGS_SEQ.NEXTVAL PRIMARY KEY,
    TITLE          VARCHAR2(255) NOT NULL,
    DESCRIPTION    CLOB,
    PRICE          NUMBER(10, 2) NOT NULL,
    LOCATION       VARCHAR2(255),
    ITEM_CONDITION VARCHAR2(50),
    STATUS         VARCHAR2(20) DEFAULT 'active',
    CATEGORY_ID    NUMBER,
    SELLER_ID      NUMBER NOT NULL,
    CREATED_AT     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_LISTING_CATEGORY FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORIES(ID),
    CONSTRAINT FK_LISTING_SELLER FOREIGN KEY (SELLER_ID) REFERENCES USERS(ID) ON DELETE CASCADE
);
```
**Purpose:** Core table storing all marketplace listings with price, location, condition, and status tracking.

### Table 4: IMAGES
```sql
CREATE TABLE IMAGES (
    ID         NUMBER DEFAULT IMAGES_SEQ.NEXTVAL PRIMARY KEY,
    LISTING_ID NUMBER NOT NULL,
    IMAGE_URL  VARCHAR2(2000) NOT NULL,
    CONSTRAINT FK_IMAGE_LISTING FOREIGN KEY (LISTING_ID) REFERENCES LISTINGS(ID) ON DELETE CASCADE
);
```
**Purpose:** Stores image URLs for listings. Supports multiple images per listing (1:N relationship).

### Table 5: WISHLIST
```sql
CREATE TABLE WISHLIST (
    USER_ID    NUMBER NOT NULL,
    LISTING_ID NUMBER NOT NULL,
    ADDED_AT   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (USER_ID, LISTING_ID),
    CONSTRAINT FK_WISHLIST_USER FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_WISHLIST_LISTING FOREIGN KEY (LISTING_ID) REFERENCES LISTINGS(ID) ON DELETE CASCADE
);
```
**Purpose:** Many-to-many relationship table allowing users to save listings to their wishlist. Uses composite primary key.

### Table 6: OFFERS
```sql
CREATE TABLE OFFERS (
    ID          NUMBER DEFAULT OFFERS_SEQ.NEXTVAL PRIMARY KEY,
    LISTING_ID  NUMBER NOT NULL,
    BUYER_ID    NUMBER NOT NULL,
    SELLER_ID   NUMBER NOT NULL,
    OFFER_PRICE NUMBER(10, 2) NOT NULL,
    STATUS      VARCHAR2(20) DEFAULT 'PENDING',
    CREATED_AT  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_OFFER_LISTING FOREIGN KEY (LISTING_ID) REFERENCES LISTINGS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_OFFER_BUYER FOREIGN KEY (BUYER_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_OFFER_SELLER FOREIGN KEY (SELLER_ID) REFERENCES USERS(ID) ON DELETE CASCADE
);
```
**Purpose:** Stores price negotiation offers between buyers and sellers. Status can be PENDING, accepted, or rejected.

### Table 7: MESSAGES
```sql
CREATE TABLE MESSAGES (
    ID          NUMBER DEFAULT MESSAGES_SEQ.NEXTVAL PRIMARY KEY,
    LISTING_ID  NUMBER NOT NULL,
    SENDER_ID   NUMBER NOT NULL,
    RECEIVER_ID NUMBER NOT NULL,
    CONTENT     CLOB NOT NULL,
    IS_READ     NUMBER(1) DEFAULT 0,
    CREATED_AT  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_MSG_LISTING FOREIGN KEY (LISTING_ID) REFERENCES LISTINGS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_MSG_SENDER FOREIGN KEY (SENDER_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_MSG_RECEIVER FOREIGN KEY (RECEIVER_ID) REFERENCES USERS(ID) ON DELETE CASCADE
);
```
**Purpose:** Stores chat messages between users in the context of specific listings.

### Table 8: LISTING_AUDIT_LOG
```sql
CREATE TABLE LISTING_AUDIT_LOG (
    ID         NUMBER DEFAULT AUDIT_LOG_SEQ.NEXTVAL PRIMARY KEY,
    LISTING_ID NUMBER NOT NULL,
    OLD_STATUS VARCHAR2(20),
    NEW_STATUS VARCHAR2(20),
    CHANGED_BY NUMBER,
    CHANGED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    REMARKS    VARCHAR2(500)
);
```
**Purpose:** Audit trail table populated by the `TRG_LISTING_STATUS_LOG` trigger. Records every listing status change for accountability and debugging.

### Table 9: ADMIN_ACTIVITY_LOG
```sql
CREATE TABLE ADMIN_ACTIVITY_LOG (
    ID           NUMBER DEFAULT ADMIN_LOG_SEQ.NEXTVAL PRIMARY KEY,
    ADMIN_ID     NUMBER NOT NULL,
    ACTION_TYPE  VARCHAR2(50) NOT NULL,
    TARGET_TABLE VARCHAR2(50),
    TARGET_ID    NUMBER,
    DESCRIPTION  VARCHAR2(1000),
    ACTION_AT    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** Logs all admin actions (user deletion, banning, role changes) for security audit and accountability.

---

## 6. Sequences

Sequences are used to auto-generate unique primary key values for all tables.

| # | Sequence Name | Used By | Start | Increment |
|---|--------------|---------|-------|-----------|
| 1 | `USERS_SEQ` | USERS.ID | 1 | 1 |
| 2 | `CATEGORIES_SEQ` | CATEGORIES.ID | 1 | 1 |
| 3 | `LISTINGS_SEQ` | LISTINGS.ID | 1 | 1 |
| 4 | `IMAGES_SEQ` | IMAGES.ID | 1 | 1 |
| 5 | `MESSAGES_SEQ` | MESSAGES.ID | 1 | 1 |
| 6 | `OFFERS_SEQ` | OFFERS.ID | 1 | 1 |
| 7 | `AUDIT_LOG_SEQ` | LISTING_AUDIT_LOG.ID | 1 | 1 |
| 8 | `ADMIN_LOG_SEQ` | ADMIN_ACTIVITY_LOG.ID | 1 | 1 |

**Usage Example:**
```sql
CREATE SEQUENCE USERS_SEQ START WITH 1 INCREMENT BY 1;
-- Used as default value: ID NUMBER DEFAULT USERS_SEQ.NEXTVAL PRIMARY KEY
```

---

## 7. Indexes

Indexes are used to improve query performance on frequently searched columns.

| # | Index Name | Table | Column(s) | Purpose |
|---|-----------|-------|-----------|---------|
| 1 | `IDX_LISTINGS_SELLER` | LISTINGS | SELLER_ID | Fast lookup of listings by seller |
| 2 | `IDX_LISTINGS_CATEGORY` | LISTINGS | CATEGORY_ID | Fast category-based filtering |
| 3 | `IDX_LISTINGS_STATUS` | LISTINGS | STATUS | Fast status-based filtering |
| 4 | `IDX_OFFERS_LISTING` | OFFERS | LISTING_ID | Fast offer lookup per listing |
| 5 | `IDX_OFFERS_STATUS` | OFFERS | STATUS | Fast offer status filtering |
| 6 | `IDX_USERS_EMAIL` | USERS | EMAIL | Fast login lookup by email |
| 7 | `IDX_CHAT_USERS` | MESSAGES | (SENDER_ID, RECEIVER_ID, LISTING_ID) | Fast chat retrieval (composite) |

**Creation Example:**
```sql
CREATE INDEX IDX_LISTINGS_SELLER ON LISTINGS(SELLER_ID);
CREATE INDEX IDX_USERS_EMAIL ON USERS(EMAIL);
CREATE INDEX IDX_CHAT_USERS ON MESSAGES(SENDER_ID, RECEIVER_ID, LISTING_ID);
```

**Why Indexes Matter:**
- Without `IDX_USERS_EMAIL`, every login would do a full table scan on USERS
- Without `IDX_LISTINGS_SELLER`, fetching "My Listings" would scan the entire LISTINGS table
- The composite index `IDX_CHAT_USERS` optimizes the chat retrieval query which filters on three columns simultaneously

---

## 8. Views

Views are pre-built SQL queries that simplify complex joins and aggregations.

### View 1: VW_LISTING_DETAILS
```sql
CREATE OR REPLACE VIEW VW_LISTING_DETAILS AS
SELECT 
    l.ID, l.TITLE, l.DESCRIPTION, l.PRICE, l.LOCATION,
    l.ITEM_CONDITION, l.STATUS, l.CREATED_AT, l.UPDATED_AT,
    c.ID AS CATEGORY_ID, c.NAME AS CATEGORY_NAME,
    u.ID AS SELLER_ID, u.USERNAME AS SELLER_NAME, u.EMAIL AS SELLER_EMAIL,
    (SELECT MIN(i.IMAGE_URL) FROM IMAGES i WHERE i.LISTING_ID = l.ID) AS IMAGE_URL
FROM LISTINGS l
JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
JOIN USERS u ON l.SELLER_ID = u.ID;
```
**Purpose:** Combines listing data with category name, seller info, and first image URL. Used by the admin dashboard to display listings without writing complex joins each time.

### View 2: VW_USER_DASHBOARD_STATS
```sql
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
FROM USERS u;
```
**Purpose:** Aggregates per-user statistics including listing count, offer count, messages sent, and computed trust score. Used by the admin panel to display user management data.

### View 3: VW_ADMIN_PLATFORM_OVERVIEW
```sql
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
    (SELECT COUNT(*) FROM MESSAGES) AS TOTAL_MESSAGES,
    (SELECT COUNT(*) FROM CATEGORIES) AS TOTAL_CATEGORIES,
    (SELECT NVL(SUM(PRICE), 0) FROM LISTINGS WHERE STATUS = 'active' OR STATUS IS NULL) AS TOTAL_ACTIVE_VALUE,
    (SELECT NVL(ROUND(AVG(PRICE), 2), 0) FROM LISTINGS) AS AVG_LISTING_PRICE
FROM DUAL;
```
**Purpose:** Single-row view that provides all platform statistics in one query. The admin dashboard stats endpoint calls `SELECT * FROM VW_ADMIN_PLATFORM_OVERVIEW` instead of executing 10+ separate COUNT queries.

---

## 9. Stored Procedures

Stored procedures encapsulate complex business logic on the database side for atomicity and reuse.

### Procedure 1: SP_REGISTER_USER
```sql
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
END SP_REGISTER_USER;
```
**Purpose:** Registers a new user with duplicate username/email validation. Returns result message and user ID through OUT parameters.

### Procedure 2: SP_CREATE_LISTING
```sql
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
END SP_CREATE_LISTING;
```
**Purpose:** Creates a listing and optionally inserts an image in a single atomic transaction. Guarantees that either both succeed or both roll back.

### Procedure 3: SP_ACCEPT_OFFER (Uses Cursor)
```sql
CREATE OR REPLACE PROCEDURE SP_ACCEPT_OFFER(
    p_offer_id IN NUMBER, p_seller_id IN NUMBER, p_result OUT VARCHAR2
) IS
    v_listing_id NUMBER; v_offer_seller NUMBER; v_offer_status VARCHAR2(20);
    CURSOR c_competing IS
        SELECT ID FROM OFFERS WHERE LISTING_ID = v_listing_id 
        AND ID != p_offer_id AND (STATUS = 'pending' OR STATUS = 'PENDING');
    v_cid NUMBER;
BEGIN
    SELECT LISTING_ID, SELLER_ID, STATUS INTO v_listing_id, v_offer_seller, v_offer_status
    FROM OFFERS WHERE ID = p_offer_id;
    
    IF v_offer_seller != p_seller_id THEN p_result := 'ERROR: Only seller can accept'; RETURN; END IF;
    IF v_offer_status NOT IN ('pending','PENDING') THEN p_result := 'ERROR: Not pending'; RETURN; END IF;
    
    UPDATE OFFERS SET STATUS = 'accepted' WHERE ID = p_offer_id;
    
    OPEN c_competing; 
    LOOP 
        FETCH c_competing INTO v_cid; 
        EXIT WHEN c_competing%NOTFOUND;
        UPDATE OFFERS SET STATUS = 'rejected' WHERE ID = v_cid;
    END LOOP; 
    CLOSE c_competing;
    
    UPDATE LISTINGS SET STATUS = 'reserved' WHERE ID = v_listing_id;
    COMMIT; 
    p_result := 'SUCCESS: Offer accepted, competing offers rejected';
EXCEPTION
    WHEN NO_DATA_FOUND THEN p_result := 'ERROR: Offer not found';
    WHEN OTHERS THEN ROLLBACK; p_result := 'ERROR: ' || SQLERRM;
END SP_ACCEPT_OFFER;
```
**Purpose:** Atomically accepts an offer, uses a **CURSOR** to iterate over and reject all competing pending offers, and marks the listing as reserved. Demonstrates cursor-based row-by-row processing.

### Procedure 4: SP_DELETE_USER_CASCADE (Uses Cursor)
```sql
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
END SP_DELETE_USER_CASCADE;
```
**Purpose:** Complete user deletion that uses a **CURSOR** to iterate through user's listings and delete associated images. Also logs the action to ADMIN_ACTIVITY_LOG.

### Procedure 5: SP_GENERATE_PLATFORM_REPORT (Uses Cursors)
```sql
CREATE OR REPLACE PROCEDURE SP_GENERATE_PLATFORM_REPORT IS
    CURSOR c_cats IS SELECT c.NAME, COUNT(l.ID) CNT, NVL(SUM(l.PRICE),0) VAL
        FROM CATEGORIES c LEFT JOIN LISTINGS l ON c.ID = l.CATEGORY_ID 
        GROUP BY c.NAME ORDER BY CNT DESC;
    CURSOR c_sellers IS SELECT u.USERNAME, COUNT(l.ID) CNT FROM USERS u 
        JOIN LISTINGS l ON u.ID = l.SELLER_ID GROUP BY u.USERNAME 
        ORDER BY CNT DESC FETCH FIRST 5 ROWS ONLY;
BEGIN
    -- Outputs platform statistics using DBMS_OUTPUT
    -- Uses two cursors: one for category breakdown, one for top sellers
    DBMS_OUTPUT.PUT_LINE('=== SWAPNEST PLATFORM REPORT ===');
    -- ... (iterates through cursors)
END SP_GENERATE_PLATFORM_REPORT;
```
**Purpose:** Generates a text-based platform report using **DBMS_OUTPUT** and **two cursors** for category-wise breakdown and top sellers ranking.

---

## 10. Functions

Functions return computed values and are called from SQL queries and application code.

### Function 1: FN_GET_USER_TRUST_SCORE
```sql
CREATE OR REPLACE FUNCTION FN_GET_USER_TRUST_SCORE(p_user_id IN NUMBER)
RETURN NUMBER IS
    v_listing_count NUMBER; v_offer_count NUMBER; v_message_count NUMBER;
    v_trust_score NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_listing_count FROM LISTINGS WHERE SELLER_ID = p_user_id;
    SELECT COUNT(*) INTO v_offer_count FROM OFFERS WHERE BUYER_ID = p_user_id OR SELLER_ID = p_user_id;
    SELECT COUNT(*) INTO v_message_count FROM MESSAGES WHERE SENDER_ID = p_user_id;
    v_trust_score := (v_listing_count * 12) + (v_offer_count * 2) + (v_message_count * 1);
    IF v_trust_score > 100 THEN v_trust_score := 100; END IF;
    RETURN v_trust_score;
END;
```
**Usage in Application:**
```javascript
// In userController.js
const trustResult = await db.execute(
    `SELECT FN_GET_USER_TRUST_SCORE(:userId) AS TRUST_SCORE FROM DUAL`, { userId }
);
```
**Purpose:** Calculates a trust score (0-100) based on user's platform activity. Called from the profile page.

### Function 2: FN_GET_LISTING_COUNT_BY_CATEGORY
```sql
CREATE OR REPLACE FUNCTION FN_GET_LISTING_COUNT_BY_CATEGORY(p_category_id IN NUMBER)
RETURN NUMBER IS
    v_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_count FROM LISTINGS 
    WHERE CATEGORY_ID = p_category_id AND (STATUS = 'active' OR STATUS IS NULL);
    RETURN v_count;
END;
```
**Purpose:** Returns the count of active listings in a given category. Used in admin category management.

### Function 3: FN_GET_TOTAL_REVENUE_POTENTIAL
```sql
CREATE OR REPLACE FUNCTION FN_GET_TOTAL_REVENUE_POTENTIAL RETURN NUMBER IS
    v_total NUMBER := 0;
BEGIN
    SELECT NVL(SUM(PRICE), 0) INTO v_total FROM LISTINGS 
    WHERE STATUS = 'active' OR STATUS IS NULL;
    RETURN v_total;
END;
```
**Purpose:** Returns the total price sum of all active listings — the platform's revenue potential.

### Function 4: FN_GET_USER_ROLE
```sql
CREATE OR REPLACE FUNCTION FN_GET_USER_ROLE(p_user_id IN NUMBER) RETURN VARCHAR2 IS
    v_role VARCHAR2(20);
BEGIN
    SELECT NVL(ROLE, 'user') INTO v_role FROM USERS WHERE ID = p_user_id;
    RETURN v_role;
EXCEPTION WHEN NO_DATA_FOUND THEN RETURN 'unknown';
END;
```
**Purpose:** Returns the role of a user by their ID. Handles the case where user doesn't exist.

---

## 11. Triggers

Triggers automatically execute business logic when specific database events occur.

### Trigger 1: TRG_SET_DEFAULT_ROLE (BEFORE INSERT)
```sql
CREATE OR REPLACE TRIGGER TRG_SET_DEFAULT_ROLE
BEFORE INSERT ON USERS FOR EACH ROW
BEGIN
    IF :NEW.ROLE IS NULL THEN :NEW.ROLE := 'user'; END IF;
    IF :NEW.IS_BANNED IS NULL THEN :NEW.IS_BANNED := 0; END IF;
END;
```
**Event:** Fires before every INSERT on USERS  
**Purpose:** Automatically sets ROLE to 'user' and IS_BANNED to 0 if not provided during registration. Ensures data consistency.

### Trigger 2: TRG_LISTING_STATUS_LOG (AFTER UPDATE)
```sql
CREATE OR REPLACE TRIGGER TRG_LISTING_STATUS_LOG
AFTER UPDATE OF STATUS ON LISTINGS FOR EACH ROW
BEGIN
    IF :OLD.STATUS IS NULL OR :OLD.STATUS != :NEW.STATUS THEN
        INSERT INTO LISTING_AUDIT_LOG (LISTING_ID, OLD_STATUS, NEW_STATUS, REMARKS)
        VALUES (:NEW.ID, :OLD.STATUS, :NEW.STATUS, 
                'Status: ' || NVL(:OLD.STATUS,'NULL') || ' -> ' || :NEW.STATUS);
    END IF;
END;
```
**Event:** Fires after STATUS column is updated on LISTINGS  
**Purpose:** Creates an audit trail by logging every status change into LISTING_AUDIT_LOG. Visible in the admin panel's Audit Log tab.

### Trigger 3: TRG_AUTO_REJECT_OFFERS_ON_SOLD (AFTER UPDATE)
```sql
CREATE OR REPLACE TRIGGER TRG_AUTO_REJECT_OFFERS_ON_SOLD
AFTER UPDATE OF STATUS ON LISTINGS FOR EACH ROW
BEGIN
    IF :NEW.STATUS = 'sold' THEN
        UPDATE OFFERS SET STATUS = 'rejected' 
        WHERE LISTING_ID = :NEW.ID AND (STATUS = 'pending' OR STATUS = 'PENDING');
    END IF;
END;
```
**Event:** Fires after STATUS column is updated on LISTINGS  
**Purpose:** When a listing is marked as 'sold', automatically rejects all pending offers for that listing. Prevents stale offers.

### Trigger 4: TRG_PREVENT_SELF_OFFER (BEFORE INSERT)
```sql
CREATE OR REPLACE TRIGGER TRG_PREVENT_SELF_OFFER
BEFORE INSERT ON OFFERS FOR EACH ROW
DECLARE v_seller NUMBER;
BEGIN
    SELECT SELLER_ID INTO v_seller FROM LISTINGS WHERE ID = :NEW.LISTING_ID;
    IF v_seller = :NEW.BUYER_ID THEN
        RAISE_APPLICATION_ERROR(-20001, 'Cannot offer on own listing');
    END IF;
END;
```
**Event:** Fires before every INSERT on OFFERS  
**Purpose:** Database-level validation that prevents users from making offers on their own listings. Uses RAISE_APPLICATION_ERROR for validation.

### Trigger 5: TRG_UPDATE_TIMESTAMP (BEFORE UPDATE)
```sql
CREATE OR REPLACE TRIGGER TRG_UPDATE_TIMESTAMP
BEFORE UPDATE ON LISTINGS FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := CURRENT_TIMESTAMP;
END;
```
**Event:** Fires before every UPDATE on LISTINGS  
**Purpose:** Automatically updates the UPDATED_AT timestamp whenever a listing is modified. Tracks last modification time without application code changes.

---

## 12. Cursors

Cursors are used inside stored procedures to iterate over result sets row by row.

### Cursor Usage in SP_ACCEPT_OFFER
```sql
CURSOR c_competing_offers(c_listing_id NUMBER, c_offer_id NUMBER) IS
    SELECT ID FROM OFFERS 
    WHERE LISTING_ID = c_listing_id AND ID != c_offer_id 
    AND (STATUS = 'pending' OR STATUS = 'PENDING');

-- Usage:
OPEN c_competing_offers(v_listing_id, p_offer_id);
LOOP
    FETCH c_competing_offers INTO v_competing_id;
    EXIT WHEN c_competing_offers%NOTFOUND;
    UPDATE OFFERS SET STATUS = 'rejected' WHERE ID = v_competing_id;
END LOOP;
CLOSE c_competing_offers;
```
**Cursor attributes used:** `%NOTFOUND` — checks if the last fetch returned no rows.

### Cursor Usage in SP_DELETE_USER_CASCADE
```sql
CURSOR c_user_listings IS
    SELECT ID FROM LISTINGS WHERE SELLER_ID = p_user_id;

-- Used to iterate over all listings owned by the user and delete dependent images
```

### Cursor Usage in SP_GENERATE_PLATFORM_REPORT
```sql
CURSOR c_category_stats IS
    SELECT c.NAME, COUNT(l.ID) AS LISTING_COUNT, NVL(SUM(l.PRICE), 0) AS TOTAL_VALUE
    FROM CATEGORIES c LEFT JOIN LISTINGS l ON c.ID = l.CATEGORY_ID
    GROUP BY c.NAME ORDER BY LISTING_COUNT DESC;

CURSOR c_top_sellers IS
    SELECT u.USERNAME, COUNT(l.ID) AS LISTING_COUNT
    FROM USERS u JOIN LISTINGS l ON u.ID = l.SELLER_ID
    GROUP BY u.USERNAME ORDER BY LISTING_COUNT DESC FETCH FIRST 5 ROWS ONLY;
```

---

## 13. Application Features

### 13.1 User Authentication
- **Signup** with username, email, password validation
- **Login** with JWT token-based authentication (24-hour expiry)
- Bcrypt password hashing (10 salt rounds)
- Banned user check during login (uses IS_BANNED column)

### 13.2 Listing Management
- **Create** listings with title, description, price, location, condition, category, and image upload
- **Edit** existing listings (ownership verified)
- **Delete** listings with cascade cleanup
- **Status management**: active → sold/reserved
- Advanced **search & filter**: by category, price range, location, condition, sort order

### 13.3 Offer/Negotiation System
- Buyers can **submit offers** with custom prices
- Sellers can **accept or reject** offers
- Accepting an offer uses **SP_ACCEPT_OFFER** procedure which atomically rejects competing offers
- Self-offer prevention via **TRG_PREVENT_SELF_OFFER** trigger

### 13.4 Real-time Chat (WebSocket)
- Socket.io-based real-time messaging
- Per-listing, per-user chat rooms
- JWT-authenticated socket connections
- Inbox view showing all conversations

### 13.5 Wishlist
- Add/remove listings from wishlist
- Duplicate prevention (composite primary key)
- Wishlist page with saved items

### 13.6 User Profiles
- Public profile pages with listings
- Trust score calculation using **FN_GET_USER_TRUST_SCORE** function
- Profile editing (username, phone, profile picture)

### 13.7 Categories
- Pre-seeded categories (Electronics, Furniture, Books, Clothing, Sports)
- Admin can add/edit/delete categories

---

## 14. Admin Panel Features

The admin panel is accessible at `/admin/login` and provides comprehensive platform management:

### 14.1 Dashboard Overview
- Platform-wide statistics from **VW_ADMIN_PLATFORM_OVERVIEW** view
- 8 stat cards: users, listings, offers, messages, categories, sold items, revenue potential, avg price

### 14.2 User Management
- View all users with stats from **VW_USER_DASHBOARD_STATS** view
- **Search** users by username or email
- **Ban/Unban** users (banned users cannot login)
- **Promote/Demote** users (user ↔ admin role)
- **Delete** users with cascade (uses **SP_DELETE_USER_CASCADE** procedure)
- Trust score visualization per user

### 14.3 Listing Management
- View all listings with search and filters
- Change listing status (active/sold/reserved/removed)
- Delete any listing
- Status changes are logged by **TRG_LISTING_STATUS_LOG** trigger

### 14.4 Offer Management
- View all offers across the platform
- See buyer, seller, offer price, listing price, status
- Delete any offer

### 14.5 Category Management (CRUD)
- Create new categories
- Edit existing category names
- Delete categories (with listing count validation)
- Category analytics: listing count, total value, average price

### 14.6 Audit Log
- **Listing Audit Log**: Shows all listing status changes (populated by trigger)
- **Admin Activity Log**: Shows all admin actions (populated by stored procedures)

### 14.7 Reports & Analytics
- Category-wise analytics: total, active, sold listings, min/max/avg prices
- Top 10 sellers by listing count
- Recent platform activity feed
- **Database Objects Summary**: Lists all tables, views, procedures, functions, triggers, indexes, and sequences

---

## 15. API Documentation

### Authentication APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Listing APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Get all listings (with filters) |
| GET | `/api/listings/:id` | Get listing details |
| POST | `/api/listings` | Create new listing (auth required) |
| PUT | `/api/listings/:id` | Update listing (owner only) |
| DELETE | `/api/listings/:id` | Delete listing (owner only) |
| PATCH | `/api/listings/:id/status` | Update listing status |
| GET | `/api/listings/my-listings` | Get my listings |
| GET | `/api/listings/categories` | Get all categories |

### Offer APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/offers` | Create offer |
| PATCH | `/api/offers/:id` | Accept/reject offer |
| GET | `/api/offers/my-listings` | Offers on my listings |
| GET | `/api/offers/my-sent` | Offers I've sent |

### Chat APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message |
| GET | `/api/chat/conversation` | Get conversation |
| GET | `/api/chat/inbox` | Get inbox |

### Wishlist APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wishlist` | Add to wishlist |
| DELETE | `/api/wishlist/:listing_id` | Remove from wishlist |
| GET | `/api/wishlist` | Get my wishlist |
| GET | `/api/wishlist/check/:listing_id` | Check if wishlisted |

### User APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId` | Get public profile |
| PUT | `/api/users/profile` | Update own profile |

### Admin APIs (Requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform overview stats |
| GET | `/api/admin/users` | List all users with stats |
| DELETE | `/api/admin/users/:id` | Delete user (stored procedure) |
| PATCH | `/api/admin/users/:id/ban` | Ban/unban user |
| PATCH | `/api/admin/users/:id/role` | Change user role |
| GET | `/api/admin/listings` | List all listings |
| DELETE | `/api/admin/listings/:id` | Delete any listing |
| PATCH | `/api/admin/listings/:id/status` | Change listing status |
| GET | `/api/admin/offers` | List all offers |
| DELETE | `/api/admin/offers/:id` | Delete any offer |
| GET | `/api/admin/categories` | Category stats |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| GET | `/api/admin/audit-log` | Listing audit log |
| GET | `/api/admin/activity-log` | Admin activity log |
| GET | `/api/admin/reports/categories` | Category analytics |
| GET | `/api/admin/reports/top-sellers` | Top sellers report |
| GET | `/api/admin/reports/recent-activity` | Recent activity feed |
| GET | `/api/admin/reports/db-objects` | Database objects summary |

**Total: 38 API Endpoints**

---

## 16. How to Run the Project

### Prerequisites
1. **Node.js** v18+ installed
2. **Docker Desktop** installed and running
3. **Oracle Instant Client** configured for `oracledb` npm package

### Step 1: Start Oracle Database (Docker)
```bash
docker start oracle-db
```
If container doesn't exist:
```bash
docker run -d --name oracle-db -p 1521:1521 -e ORACLE_PWD=project123 container-registry.oracle.com/database/express:21.3.0-xe
```

### Step 2: Setup Database Schema
```bash
# Connect to Oracle
docker exec -it oracle-db sqlplus project/project123@XEPDB1

# Run the schema files in order:
@/path/to/patch_db.sql
@/path/to/migration_v2.sql
@/path/to/seed_data.sql
```

### Step 3: Create DBMS Objects (Procedures, Functions, Triggers, Views, Indexes)
```bash
cd backend
node setup_dbms_objects.js
```
This script creates all 5 procedures, 4 functions, 5 triggers, 3 views, 7 indexes, and 2 audit tables.

### Step 4: Create Admin User
```bash
cd backend
node create_admin.js
```
Default admin credentials: `admin@swapnest.com` / `admin123`

### Step 5: Install Dependencies
```bash
# From project root
npm run install-all
```

### Step 6: Configure Environment Variables
Create `backend/.env`:
```env
DB_USER=project
DB_PASSWORD=project123
DB_CONNECTION_STRING=localhost:1521/XEPDB1
JWT_SECRET=swapnest_secret_key_2024
PORT=5000
```

### Step 7: Start the Application
```bash
# From project root (starts both backend & frontend)
npm start
```
Or use the batch file:
```bash
run_swapnest.bat
```

### Step 8: Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Admin Login:** http://localhost:5173/admin/login

---

## 17. Testing Guide

### 17.1 Test User Registration & Login
1. Go to http://localhost:5173/signup
2. Register with username, email, password
3. Login at http://localhost:5173/login
4. Verify JWT token is stored in localStorage

### 17.2 Test Listing Management
1. Click "Post Listing" → fill all fields → Submit
2. Go to "My Listings" → verify listing appears
3. Edit listing → change price/title → Save
4. Change status to "Sold" → verify it disappears from homepage
5. **Verify trigger:** Check admin Audit Log for the status change entry

### 17.3 Test Offer System
1. Login as User B → browse User A's listing
2. Click "Make Offer" → enter price → Submit
3. Login as User A → check "Offers on My Listings"
4. Accept the offer → verify:
   - Offer status changes to "accepted"
   - Any competing offers are auto-rejected (by SP_ACCEPT_OFFER cursor)
   - Listing status changes to "reserved" (by procedure)

### 17.4 Test Self-Offer Prevention
1. Try making an offer on your own listing
2. **Expected:** Error "Cannot offer on own listing" from TRG_PREVENT_SELF_OFFER trigger

### 17.5 Test Chat
1. On a listing detail page, click "Chat with Seller"
2. Send messages → verify real-time delivery
3. Check inbox for conversation list

### 17.6 Test Admin Panel
1. Login at http://localhost:5173/admin/login (admin@swapnest.com / admin123)
2. **Overview tab:** Verify all stats load
3. **Users tab:** Search users, ban a user, try logging in as banned user (should fail)
4. **Listings tab:** Change a listing status, check Audit Log tab
5. **Categories tab:** Add new category, edit name, delete empty category
6. **Reports tab:** Check category analytics, top sellers, DB objects summary

### 17.7 Test Ban Functionality
1. Admin bans User X
2. User X tries to login → should see "Your account has been banned"
3. Admin unbans User X
4. User X can now login again

### 17.8 Verify Database Objects
Run in SQL*Plus:
```sql
-- Check all objects
SELECT OBJECT_TYPE, OBJECT_NAME, STATUS FROM USER_OBJECTS 
WHERE OBJECT_TYPE IN ('TABLE','VIEW','PROCEDURE','FUNCTION','TRIGGER','INDEX','SEQUENCE')
ORDER BY OBJECT_TYPE, OBJECT_NAME;
```

---

## 18. Conclusion & Future Scope

### 18.1 Conclusion
SwapNest successfully demonstrates the practical application of core DBMS concepts in a real-world web application:

- **9 normalized tables** with proper constraints and relationships
- **8 sequences** for auto-generated primary keys
- **7 indexes** for query performance optimization
- **3 views** for simplified complex queries
- **5 stored procedures** with atomic transaction management
- **4 functions** for reusable computations
- **5 triggers** for automatic business rule enforcement
- **Cursors** used inside procedures for row-by-row processing

The project demonstrates how database-level logic (procedures, triggers, functions) can complement application-level code to create a robust, maintainable system.

### 18.2 DBMS Concepts Summary Table

| DBMS Concept | Count | Examples |
|-------------|-------|---------|
| Tables | 9 | USERS, LISTINGS, OFFERS, MESSAGES, WISHLIST, CATEGORIES, IMAGES, LISTING_AUDIT_LOG, ADMIN_ACTIVITY_LOG |
| Sequences | 8 | USERS_SEQ, LISTINGS_SEQ, OFFERS_SEQ, MESSAGES_SEQ, etc. |
| Indexes | 7 | IDX_LISTINGS_SELLER, IDX_USERS_EMAIL, IDX_CHAT_USERS, etc. |
| Views | 3 | VW_LISTING_DETAILS, VW_USER_DASHBOARD_STATS, VW_ADMIN_PLATFORM_OVERVIEW |
| Stored Procedures | 5 | SP_REGISTER_USER, SP_CREATE_LISTING, SP_ACCEPT_OFFER, SP_DELETE_USER_CASCADE, SP_GENERATE_PLATFORM_REPORT |
| Functions | 4 | FN_GET_USER_TRUST_SCORE, FN_GET_LISTING_COUNT_BY_CATEGORY, FN_GET_TOTAL_REVENUE_POTENTIAL, FN_GET_USER_ROLE |
| Triggers | 5 | TRG_SET_DEFAULT_ROLE, TRG_LISTING_STATUS_LOG, TRG_AUTO_REJECT_OFFERS_ON_SOLD, TRG_PREVENT_SELF_OFFER, TRG_UPDATE_TIMESTAMP |
| Cursors | 4 | Used in SP_ACCEPT_OFFER, SP_DELETE_USER_CASCADE, SP_GENERATE_PLATFORM_REPORT (2) |
| Constraints | 12+ | PK, FK, NOT NULL, UNIQUE, DEFAULT, ON DELETE CASCADE |
| Normalization | 3NF | All tables in Third Normal Form |

### 18.3 Future Scope
- Payment gateway integration (Razorpay/Stripe)
- Email notifications for offers and messages
- Advanced recommendation engine using user activity
- Mobile application (React Native)
- Analytics dashboard with charts (Chart.js)
- Multi-image upload support
- Location-based search with maps integration

---

*End of Report*
