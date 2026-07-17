const db = require('../db');

// ============================================================
// DASHBOARD STATS (Uses VW_ADMIN_PLATFORM_OVERVIEW view)
// ============================================================

// GET /api/admin/stats — Full platform overview from the view
const getDashboardStats = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT * FROM VW_ADMIN_PLATFORM_OVERVIEW`,
            []
        );
        
        if (result.rows.length === 0) {
            // Fallback to manual queries if view doesn't exist
            const [usersRes, listingsRes, offersRes, messagesRes] = await Promise.all([
                db.execute(`SELECT COUNT(*) AS COUNT FROM USERS`, []),
                db.execute(`SELECT COUNT(*) AS COUNT FROM LISTINGS`, []),
                db.execute(`SELECT COUNT(*) AS COUNT FROM OFFERS`, []),
                db.execute(`SELECT COUNT(*) AS COUNT FROM MESSAGES`, [])
            ]);
            return res.json({
                users: usersRes.rows[0].COUNT,
                listings: listingsRes.rows[0].COUNT,
                offers: offersRes.rows[0].COUNT,
                messages: messagesRes.rows[0].COUNT
            });
        }

        const row = result.rows[0];
        res.json({
            users: row.TOTAL_USERS,
            admins: row.TOTAL_ADMINS,
            bannedUsers: row.BANNED_USERS,
            listings: row.TOTAL_LISTINGS,
            activeListings: row.ACTIVE_LISTINGS,
            soldListings: row.SOLD_LISTINGS,
            reservedListings: row.RESERVED_LISTINGS,
            offers: row.TOTAL_OFFERS,
            pendingOffers: row.PENDING_OFFERS,
            acceptedOffers: row.ACCEPTED_OFFERS,
            messages: row.TOTAL_MESSAGES,
            categories: row.TOTAL_CATEGORIES,
            wishlisted: row.TOTAL_WISHLISTED,
            totalActiveValue: row.TOTAL_ACTIVE_VALUE,
            avgListingPrice: row.AVG_LISTING_PRICE
        });
    } catch (err) {
        // Fallback if view doesn't exist yet
        try {
            const [usersRes, listingsRes, offersRes, messagesRes] = await Promise.all([
                db.execute(`SELECT COUNT(*) AS COUNT FROM USERS`, []),
                db.execute(`SELECT COUNT(*) AS COUNT FROM LISTINGS`, []),
                db.execute(`SELECT COUNT(*) AS COUNT FROM OFFERS`, []),
                db.execute(`SELECT COUNT(*) AS COUNT FROM MESSAGES`, [])
            ]);
            res.json({
                users: usersRes.rows[0].COUNT, listings: listingsRes.rows[0].COUNT,
                offers: offersRes.rows[0].COUNT, messages: messagesRes.rows[0].COUNT
            });
        } catch (fallbackErr) {
            res.status(500).json({ message: 'Error fetching stats', error: fallbackErr.message });
        }
    }
};

// ============================================================
// USER MANAGEMENT (Uses VW_USER_DASHBOARD_STATS view)
// ============================================================

// GET /api/admin/users — List all users with stats
const getAllUsers = async (req, res) => {
    const { search } = req.query;
    try {
        let sql = `
            SELECT USER_ID AS ID, USERNAME, EMAIL, ROLE, IS_BANNED, CREATED_AT, 
                   LISTING_COUNT, OFFER_COUNT, MESSAGES_SENT, WISHLIST_COUNT, TRUST_SCORE
            FROM VW_USER_DASHBOARD_STATS
        `;
        const binds = {};

        if (search) {
            sql += ` WHERE LOWER(USERNAME) LIKE :search OR LOWER(EMAIL) LIKE :search`;
            binds.search = `%${search.toLowerCase()}%`;
        }

        sql += ` ORDER BY CREATED_AT DESC`;

        const result = await db.execute(sql, binds);
        res.json(result.rows);
    } catch (err) {
        // Fallback if view doesn't exist
        try {
            let sql = `
                SELECT u.ID, u.USERNAME, u.EMAIL, u.ROLE, u.CREATED_AT,
                       (SELECT COUNT(*) FROM LISTINGS l WHERE l.SELLER_ID = u.ID) AS LISTING_COUNT
                FROM USERS u
            `;
            const binds = {};
            if (search) {
                sql += ` WHERE LOWER(u.USERNAME) LIKE :search OR LOWER(u.EMAIL) LIKE :search`;
                binds.search = `%${search.toLowerCase()}%`;
            }
            sql += ` ORDER BY u.CREATED_AT DESC`;
            const result = await db.execute(sql, binds);
            res.json(result.rows);
        } catch (fallbackErr) {
            res.status(500).json({ message: 'Error fetching users', error: fallbackErr.message });
        }
    }
};

// DELETE /api/admin/users/:id — Delete user using stored procedure
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    try {
        // Try using stored procedure first
        const result = await db.execute(
            `SELECT fn_delete_user_cascade(:userId, :adminId) AS result`,
            {
                userId: Number(id),
                adminId: Number(adminId)
            }
        );
        const msg = result.rows[0].RESULT;
        if (msg.startsWith('ERROR')) {
            return res.status(400).json({ message: msg });
        }
        res.json({ message: msg });
    } catch (err) {
        // Fallback to manual deletion
        try {
            if (parseInt(id) === req.user.id) {
                return res.status(400).json({ message: 'Cannot delete your own account' });
            }
            await db.execute(`DELETE FROM MESSAGES WHERE SENDER_ID = :id OR RECEIVER_ID = :id`, { id });
            await db.execute(`DELETE FROM OFFERS WHERE BUYER_ID = :id OR SELLER_ID = :id`, { id });
            await db.execute(`DELETE FROM WISHLIST WHERE USER_ID = :id`, { id });
            await db.execute(`DELETE FROM IMAGES WHERE LISTING_ID IN (SELECT ID FROM LISTINGS WHERE SELLER_ID = :id)`, { id });
            await db.execute(`DELETE FROM LISTINGS WHERE SELLER_ID = :id`, { id });
            await db.execute(`DELETE FROM USERS WHERE ID = :id`, { id });
            res.json({ message: 'User deleted successfully' });
        } catch (fallbackErr) {
            res.status(500).json({ message: 'Error deleting user', error: fallbackErr.message });
        }
    }
};

// PATCH /api/admin/users/:id/ban — Toggle ban status
const toggleUserBan = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;

    if (parseInt(id) === adminId) {
        return res.status(400).json({ message: 'Cannot ban yourself' });
    }

    try {
        // Get current ban status
        const checkResult = await db.execute(
            `SELECT IS_BANNED, USERNAME, ROLE FROM USERS WHERE ID = :id`,
            { id }
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = checkResult.rows[0];
        if (user.ROLE === 'admin') {
            return res.status(400).json({ message: 'Cannot ban an admin user' });
        }

        const newStatus = user.IS_BANNED === 1 ? 0 : 1;
        await db.execute(`UPDATE USERS SET IS_BANNED = :status WHERE ID = :id`, { status: newStatus, id });

        // Log the action
        try {
            await db.execute(
                `INSERT INTO ADMIN_ACTIVITY_LOG (ADMIN_ID, ACTION_TYPE, TARGET_TABLE, TARGET_ID, DESCRIPTION)
                 VALUES (:adminId, :action, 'USERS', :targetId, :desc)`,
                {
                    adminId,
                    action: newStatus === 1 ? 'BAN_USER' : 'UNBAN_USER',
                    targetId: Number(id),
                    desc: `${newStatus === 1 ? 'Banned' : 'Unbanned'} user: ${user.USERNAME}`
                }
            );
        } catch (logErr) { /* audit log table may not exist yet */ }

        res.json({
            message: `User ${newStatus === 1 ? 'banned' : 'unbanned'} successfully`,
            isBanned: newStatus
        });
    } catch (err) {
        res.status(500).json({ message: 'Error toggling ban', error: err.message });
    }
};

// PATCH /api/admin/users/:id/role — Change user role (promote/demote)
const changeUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    if (parseInt(id) === adminId) {
        return res.status(400).json({ message: 'Cannot change your own role' });
    }

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be admin or user.' });
    }

    try {
        const checkResult = await db.execute(
            `SELECT USERNAME FROM USERS WHERE ID = :id`,
            { id }
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        await db.execute(`UPDATE USERS SET ROLE = :role WHERE ID = :id`, { role, id });

        // Log admin action
        try {
            await db.execute(
                `INSERT INTO ADMIN_ACTIVITY_LOG (ADMIN_ID, ACTION_TYPE, TARGET_TABLE, TARGET_ID, DESCRIPTION)
                 VALUES (:adminId, :action, 'USERS', :targetId, :desc)`,
                {
                    adminId,
                    action: role === 'admin' ? 'PROMOTE_USER' : 'DEMOTE_USER',
                    targetId: Number(id),
                    desc: `Changed role to ${role} for user: ${checkResult.rows[0].USERNAME}`
                }
            );
        } catch (logErr) { /* audit log table may not exist yet */ }

        res.json({ message: `User role changed to ${role}` });
    } catch (err) {
        res.status(500).json({ message: 'Error changing role', error: err.message });
    }
};

// ============================================================
// LISTING MANAGEMENT
// ============================================================

// GET /api/admin/listings — All listings with filters
const getAllListings = async (req, res) => {
    const { search, status, category } = req.query;
    try {
        let sql = `
            SELECT l.ID, l.TITLE, l.PRICE, l.LOCATION, l.ITEM_CONDITION, l.STATUS, l.CREATED_AT,
                   u.USERNAME AS SELLER_NAME,
                   c.NAME AS CATEGORY_NAME,
                   (SELECT MIN(i.IMAGE_URL) FROM IMAGES i WHERE i.LISTING_ID = l.ID) AS IMAGE_URL
            FROM LISTINGS l
            JOIN USERS u ON l.SELLER_ID = u.ID
            LEFT JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
            WHERE 1=1
        `;
        const binds = {};

        if (search) {
            sql += ` AND (LOWER(l.TITLE) LIKE :search OR LOWER(u.USERNAME) LIKE :search)`;
            binds.search = `%${search.toLowerCase()}%`;
        }
        if (status) {
            sql += ` AND l.STATUS = :status`;
            binds.status = status;
        }
        if (category) {
            sql += ` AND c.NAME = :category`;
            binds.category = category;
        }

        sql += ` ORDER BY l.CREATED_AT DESC`;

        const result = await db.execute(sql, binds);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching listings', error: err.message });
    }
};

// DELETE /api/admin/listings/:id — Delete any listing
const deleteAnyListing = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    try {
        // Get listing info for logging
        const listingInfo = await db.execute(
            `SELECT TITLE FROM LISTINGS WHERE ID = :id`, { id }
        );

        await db.execute(`DELETE FROM IMAGES WHERE LISTING_ID = :id`, { id });
        await db.execute(`DELETE FROM WISHLIST WHERE LISTING_ID = :id`, { id });
        await db.execute(`DELETE FROM OFFERS WHERE LISTING_ID = :id`, { id });
        await db.execute(`DELETE FROM MESSAGES WHERE LISTING_ID = :id`, { id });
        await db.execute(`DELETE FROM LISTINGS WHERE ID = :id`, { id });

        // Log admin action
        try {
            const title = listingInfo.rows.length > 0 ? listingInfo.rows[0].TITLE : 'Unknown';
            await db.execute(
                `INSERT INTO ADMIN_ACTIVITY_LOG (ADMIN_ID, ACTION_TYPE, TARGET_TABLE, TARGET_ID, DESCRIPTION)
                 VALUES (:adminId, 'DELETE_LISTING', 'LISTINGS', :targetId, :desc)`,
                { adminId, targetId: Number(id), desc: `Deleted listing: ${title}` }
            );
        } catch (logErr) { /* audit log may not exist */ }

        res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting listing', error: err.message });
    }
};

// PATCH /api/admin/listings/:id/status — Change listing status
const changeListingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'sold', 'reserved', 'removed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        await db.execute(`UPDATE LISTINGS SET STATUS = :status WHERE ID = :id`, { status, id });
        res.json({ message: `Listing status changed to ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Error changing status', error: err.message });
    }
};

// ============================================================
// OFFER MANAGEMENT
// ============================================================

// GET /api/admin/offers — All offers across the platform
const getAllOffers = async (req, res) => {
    try {
        const sql = `
            SELECT o.ID, o.LISTING_ID, o.BUYER_ID, o.SELLER_ID, 
                   o.OFFER_PRICE, o.STATUS, o.CREATED_AT,
                   b.USERNAME AS BUYER_NAME,
                   s.USERNAME AS SELLER_NAME,
                   l.TITLE AS LISTING_TITLE,
                   l.PRICE AS LISTING_PRICE
            FROM OFFERS o
            JOIN USERS b ON o.BUYER_ID = b.ID
            JOIN USERS s ON o.SELLER_ID = s.ID
            JOIN LISTINGS l ON o.LISTING_ID = l.ID
            ORDER BY o.CREATED_AT DESC
        `;
        const result = await db.execute(sql, []);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching offers', error: err.message });
    }
};

// DELETE /api/admin/offers/:id — Delete any offer
const deleteOffer = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute(`DELETE FROM OFFERS WHERE ID = :id`, { id });
        res.json({ message: 'Offer deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting offer', error: err.message });
    }
};

// ============================================================
// CATEGORY MANAGEMENT (CRUD)
// ============================================================

// GET /api/admin/categories — All categories with listing counts (uses function)
const getCategoryStats = async (req, res) => {
    try {
        const sql = `
            SELECT c.ID, c.NAME, 
                   COUNT(l.ID) AS LISTING_COUNT,
                   COALESCE(SUM(l.PRICE), 0) AS TOTAL_VALUE,
                   COALESCE(ROUND(AVG(l.PRICE), 2), 0) AS AVG_PRICE
            FROM CATEGORIES c
            LEFT JOIN LISTINGS l ON c.ID = l.CATEGORY_ID AND (l.STATUS = 'active' OR l.STATUS IS NULL)
            GROUP BY c.ID, c.NAME
            ORDER BY LISTING_COUNT DESC
        `;
        const result = await db.execute(sql, []);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories', error: err.message });
    }
};

// POST /api/admin/categories — Create new category
const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    try {
        await db.execute(`INSERT INTO CATEGORIES (NAME) VALUES (:name)`, { name: name.trim() });
        res.status(201).json({ message: 'Category created successfully' });
    } catch (err) {
        if (err.code === '23505' || err.errorNum === 1) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Error creating category', error: err.message });
    }
};

// PUT /api/admin/categories/:id — Update category name
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    try {
        await db.execute(`UPDATE CATEGORIES SET NAME = :name WHERE ID = :id`, { name: name.trim(), id });
        res.json({ message: 'Category updated' });
    } catch (err) {
        if (err.code === '23505' || err.errorNum === 1) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: 'Error updating category', error: err.message });
    }
};

// DELETE /api/admin/categories/:id — Delete category
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if category has listings
        const check = await db.execute(
            `SELECT COUNT(*) AS CNT FROM LISTINGS WHERE CATEGORY_ID = :id`, { id }
        );
        if (check.rows[0].CNT > 0) {
            return res.status(400).json({ 
                message: `Cannot delete: ${check.rows[0].CNT} listings use this category. Reassign them first.` 
            });
        }
        await db.execute(`DELETE FROM CATEGORIES WHERE ID = :id`, { id });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting category', error: err.message });
    }
};

// ============================================================
// AUDIT LOGS
// ============================================================

// GET /api/admin/audit-log — Listing status change history
const getAuditLog = async (req, res) => {
    try {
        const sql = `
            SELECT a.ID, a.LISTING_ID, a.OLD_STATUS, a.NEW_STATUS, 
                   a.CHANGED_AT, a.REMARKS,
                   l.TITLE AS LISTING_TITLE
            FROM LISTING_AUDIT_LOG a
            LEFT JOIN LISTINGS l ON a.LISTING_ID = l.ID
            ORDER BY a.CHANGED_AT DESC
            FETCH FIRST 100 ROWS ONLY
        `;
        const result = await db.execute(sql, []);
        res.json(result.rows);
    } catch (err) {
        // Table may not exist yet
        res.json([]);
    }
};

// GET /api/admin/activity-log — Admin action history
const getAdminActivityLog = async (req, res) => {
    try {
        const sql = `
            SELECT a.ID, a.ADMIN_ID, a.ACTION_TYPE, a.TARGET_TABLE, 
                   a.TARGET_ID, a.DESCRIPTION, a.ACTION_AT,
                   u.USERNAME AS ADMIN_NAME
            FROM ADMIN_ACTIVITY_LOG a
            LEFT JOIN USERS u ON a.ADMIN_ID = u.ID
            ORDER BY a.ACTION_AT DESC
            FETCH FIRST 100 ROWS ONLY
        `;
        const result = await db.execute(sql, []);
        res.json(result.rows);
    } catch (err) {
        // Table may not exist yet
        res.json([]);
    }
};

// ============================================================
// REPORTS & ANALYTICS
// ============================================================

// GET /api/admin/reports/category-stats — Detailed category analytics
const getCategoryReport = async (req, res) => {
    try {
        const sql = `
            SELECT c.NAME AS CATEGORY_NAME,
                   COUNT(l.ID) AS TOTAL_LISTINGS,
                   COUNT(CASE WHEN l.STATUS = 'active' OR l.STATUS IS NULL THEN 1 END) AS ACTIVE_COUNT,
                   COUNT(CASE WHEN l.STATUS = 'sold' THEN 1 END) AS SOLD_COUNT,
                   COALESCE(SUM(l.PRICE), 0) AS TOTAL_VALUE,
                   COALESCE(ROUND(AVG(l.PRICE), 2), 0) AS AVG_PRICE,
                   COALESCE(MIN(l.PRICE), 0) AS MIN_PRICE,
                   COALESCE(MAX(l.PRICE), 0) AS MAX_PRICE
            FROM CATEGORIES c
            LEFT JOIN LISTINGS l ON c.ID = l.CATEGORY_ID
            GROUP BY c.NAME
            ORDER BY TOTAL_LISTINGS DESC
        `;
        const result = await db.execute(sql, []);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching report', error: err.message });
    }
};

// GET /api/admin/reports/top-sellers — Top sellers by listing count
const getTopSellers = async (req, res) => {
    try {
        const sql = `
            SELECT u.ID, u.USERNAME, u.EMAIL,
                   COUNT(l.ID) AS LISTING_COUNT,
                   COALESCE(SUM(l.PRICE), 0) AS TOTAL_VALUE,
                   COUNT(CASE WHEN l.STATUS = 'sold' THEN 1 END) AS SOLD_COUNT
            FROM USERS u
            JOIN LISTINGS l ON u.ID = l.SELLER_ID
            GROUP BY u.ID, u.USERNAME, u.EMAIL
            ORDER BY LISTING_COUNT DESC
            FETCH FIRST 10 ROWS ONLY
        `;
        const result = await db.execute(sql, []);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching top sellers', error: err.message });
    }
};

// GET /api/admin/reports/recent-activity — Recent platform activity
const getRecentActivity = async (req, res) => {
    try {
        const [recentListings, recentOffers, recentUsers] = await Promise.all([
            db.execute(`
                SELECT 'NEW_LISTING' AS TYPE, l.TITLE AS DESCRIPTION, l.CREATED_AT, u.USERNAME
                FROM LISTINGS l JOIN USERS u ON l.SELLER_ID = u.ID
                ORDER BY l.CREATED_AT DESC FETCH FIRST 10 ROWS ONLY
            `, []),
            db.execute(`
                SELECT 'NEW_OFFER' AS TYPE, l.TITLE || ' (Rs.' || o.OFFER_PRICE || ')' AS DESCRIPTION, 
                       o.CREATED_AT, u.USERNAME
                FROM OFFERS o JOIN LISTINGS l ON o.LISTING_ID = l.ID JOIN USERS u ON o.BUYER_ID = u.ID
                ORDER BY o.CREATED_AT DESC FETCH FIRST 10 ROWS ONLY
            `, []),
            db.execute(`
                SELECT 'NEW_USER' AS TYPE, USERNAME AS DESCRIPTION, CREATED_AT, USERNAME
                FROM USERS ORDER BY CREATED_AT DESC FETCH FIRST 10 ROWS ONLY
            `, [])
        ]);

        const all = [
            ...recentListings.rows,
            ...recentOffers.rows,
            ...recentUsers.rows
        ].sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT)).slice(0, 20);

        res.json(all);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching recent activity', error: err.message });
    }
};

// GET /api/admin/reports/db-objects — List all DBMS objects for report
const getDBObjects = async (req, res) => {
    try {
        const [tables, views, indexes, procedures, functions, triggers, sequences] = await Promise.all([
            db.execute(`SELECT table_name AS TABLE_NAME FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`, []),
            db.execute(`SELECT table_name AS VIEW_NAME FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name`, []),
            db.execute(`SELECT indexname AS INDEX_NAME, tablename AS TABLE_NAME FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname`, []),
            db.execute(`SELECT routine_name AS OBJECT_NAME, 'VALID' AS STATUS FROM information_schema.routines WHERE routine_type = 'PROCEDURE' AND routine_schema = 'public' ORDER BY routine_name`, []),
            db.execute(`SELECT routine_name AS OBJECT_NAME, 'VALID' AS STATUS FROM information_schema.routines WHERE routine_type = 'FUNCTION' AND routine_schema = 'public' ORDER BY routine_name`, []),
            db.execute(`SELECT trigger_name AS TRIGGER_NAME, event_object_table AS TABLE_NAME, 'ENABLED' AS STATUS FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY trigger_name`, []),
            db.execute(`SELECT sequence_name AS SEQUENCE_NAME, 0 AS LAST_NUMBER FROM information_schema.sequences WHERE sequence_schema = 'public' ORDER BY sequence_name`, [])
        ]);

        res.json({
            tables: tables.rows,
            views: views.rows,
            indexes: indexes.rows,
            procedures: procedures.rows,
            functions: functions.rows,
            triggers: triggers.rows,
            sequences: sequences.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching DB objects', error: err.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    toggleUserBan,
    changeUserRole,
    getAllListings,
    deleteAnyListing,
    changeListingStatus,
    getAllOffers,
    deleteOffer,
    getCategoryStats,
    createCategory,
    updateCategory,
    deleteCategory,
    getAuditLog,
    getAdminActivityLog,
    getCategoryReport,
    getTopSellers,
    getRecentActivity,
    getDBObjects
};
