const deleteListing = async (req, res) => {
    const { id } = req.params;
    const sellerId = Number(req.user.id);
    if (!sellerId) {
        return res.status(401).json({ message: 'Unauthorized: missing user id' });
    }
    try {
        // Check ownership
        const checkSql = `SELECT SELLER_ID FROM LISTINGS WHERE ID = :id`;
        const checkResult = await db.execute(checkSql, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        if (checkResult.rows[0].SELLER_ID !== sellerId) {
            return res.status(403).json({ message: 'Forbidden: not your listing' });
        }
        // Delete related records in correct order
        await db.execute(`DELETE FROM IMAGES WHERE LISTING_ID = :id`, { id });
        await db.execute(`DELETE FROM WISHLIST WHERE LISTING_ID = :id`, { id });
        await db.execute(`DELETE FROM OFFERS WHERE LISTING_ID = :id`, { id });
        await db.execute(`DELETE FROM MESSAGES WHERE LISTING_ID = :id`, { id });
        await db.execute(`DELETE FROM LISTINGS WHERE ID = :id`, { id });
        res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
        console.error('Error deleting listing:', err);
        res.status(500).json({ message: 'Error deleting listing', error: err.message });
    }
};
const db = require('../db');
const oracledb = require('oracledb');

const getListings = async (req, res) => {
    const { category, search } = req.query;
    let sql = `
        SELECT l.ID, 
               l.TITLE, 
               l.PRICE, 
               l.CONDITION, 
               l.LOCATION,
               c.NAME AS CATEGORY_NAME, 
               MIN(i.IMAGE_URL) AS IMAGE_URL
        FROM LISTINGS l
        JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
        LEFT JOIN IMAGES i ON l.ID = i.LISTING_ID
        WHERE 1=1
    `;
    const binds = {};

    if (category) {
        sql += ` AND c.NAME = :category`;
        binds.category = category;
    }

    if (search) {
        sql += ` AND (LOWER(l.TITLE) LIKE :search OR LOWER(l.DESCRIPTION) LIKE :search)`;
        binds.search = `%${search.toLowerCase()}%`;
    }

    sql += ` GROUP BY l.ID, l.TITLE, l.PRICE, l.CONDITION, l.LOCATION, c.NAME, l.CREATED_AT`;
    sql += ` ORDER BY l.CREATED_AT DESC`;

    try {
        const result = await db.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching listings:', err);
        res.status(500).json({ message: 'Error fetching listings', error: err.message, detailed: 'Check if LISTINGS and CATEGORIES tables exist and DB is connected.' });
    }
};

const getListingById = async (req, res) => {
    const { id } = req.params;
    const listingSql = `
        SELECT l.*, c.NAME as CATEGORY_NAME, u.USERNAME as SELLER_NAME, u.EMAIL as SELLER_EMAIL
        FROM LISTINGS l
        JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
        JOIN USERS u ON l.SELLER_ID = u.ID
        WHERE l.ID = :id
    `;
    
    const imagesSql = `SELECT IMAGE_URL FROM IMAGES WHERE LISTING_ID = :id`;

    try {
        const listingResult = await db.execute(listingSql, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        if (listingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const imagesResult = await db.execute(imagesSql, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        const listing = listingResult.rows[0];
        listing.IMAGES = imagesResult.rows.map(img => img.IMAGE_URL);
        
        res.json(listing);
    } catch (err) {
        console.error('Error fetching listing details:', err);
        res.status(500).json({ message: 'Error fetching listing details', error: err.message });
    }
};

const createListing = async (req, res) => {
    console.log('--- Create Listing Request ---');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    if (!req.body) {
        return res.status(400).json({ message: 'Request body is missing. Ensure multipart/form-data is being sent correctly.' });
    }
    
    const { title, description, price, location, condition, categoryId } = req.body;
    const sellerId = Number(req.user.id);
    
    if (!sellerId) {
        console.error('JWT payload missing id:', req.user);
        return res.status(400).json({ message: 'Invalid user token: missing id in JWT payload.' });
    }

    if (!title || !price || !categoryId || !location || !condition) {
        console.error('Missing required fields:', { title, price, categoryId, location, condition });
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const sql = `
            INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CONDITION, CATEGORY_ID, SELLER_ID)
            VALUES (:title, :description, :price, :location, :condition, :categoryId, :sellerId)
            RETURNING ID INTO :id
        `;
        
        // Convert to proper types for Oracle
        const binds = {
            title, 
            description, 
            price: Number(price), 
            location, 
            condition, 
            categoryId: Number(categoryId), 
            sellerId,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        console.log('Executing INSERT with binds:', binds);
        const result = await db.execute(sql, binds);

        const listingId = result.outBinds.id[0];
        console.log('Created listing with ID:', listingId);

        // Handle image upload from multer
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            console.log('Inserting image URL:', imageUrl);
            await db.execute(`INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (:listingId, :imageUrl)`, {
                listingId, imageUrl
            });
        }

        res.status(201).json({ message: 'Listing created successfully', id: listingId });
    } catch (err) {
        console.error('Error creating listing. Full error:', err);
        if (err && err.errorNum && err.message) {
            console.error('Oracle DB Error Details:', err.errorNum, err.message);
        }
        res.status(500).json({ message: 'Error creating listing', error: err.message, details: err });
    }
};

const updateListing = async (req, res) => {
    console.log('--- Update Listing Request ---');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!req.body) {
        return res.status(400).json({ message: 'Request body is missing.' });
    }

    const { id } = req.params;
    const { title, description, price, location, condition, categoryId } = req.body;
    const sellerId = Number(req.user.id);

    if (!sellerId) {
        return res.status(401).json({ message: 'Unauthorized: missing user id' });
    }

    try {
        // Check ownership
        const checkSql = `SELECT SELLER_ID FROM LISTINGS WHERE ID = :id`;
        const checkResult = await db.execute(checkSql, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (checkResult.rows[0].SELLER_ID !== sellerId) {
            return res.status(403).json({ message: 'Forbidden: not your listing' });
        }

        // Update listing
        const updateSql = `
            UPDATE LISTINGS 
            SET TITLE = :title, 
                DESCRIPTION = :description, 
                PRICE = :price, 
                LOCATION = :location, 
                CONDITION = :condition, 
                CATEGORY_ID = :categoryId
            WHERE ID = :id
        `;
        
        const binds = {
            title, 
            description, 
            price: Number(price), 
            location, 
            condition, 
            categoryId: Number(categoryId), 
            id: Number(id)
        };

        console.log('Executing UPDATE with binds:', binds);
        await db.execute(updateSql, binds);

        // Handle image update if a new file was uploaded
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            console.log('Updating image URL:', imageUrl);
            // Check if image exists
            const imgCheck = await db.execute(`SELECT * FROM IMAGES WHERE LISTING_ID = :id`, { id });
            if (imgCheck.rows.length > 0) {
                await db.execute(`UPDATE IMAGES SET IMAGE_URL = :imageUrl WHERE LISTING_ID = :id`, {
                    imageUrl, id
                });
            } else {
                await db.execute(`INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (:id, :imageUrl)`, {
                    id, imageUrl
                });
            }
        }

        res.json({ message: 'Listing updated successfully' });
    } catch (err) {
        console.error('Error updating listing. Full error:', err);
        res.status(500).json({ message: 'Error updating listing', error: err.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const result = await db.execute(`SELECT * FROM CATEGORIES ORDER BY NAME`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Error fetching categories', error: err.message });
    }
};

const getMyListings = async (req, res) => {
    const sellerId = Number(req.user.id);
    if (!sellerId) {
        console.error('JWT payload missing id for my-listings:', req.user);
        return res.status(400).json({ message: 'Invalid user token: missing id in JWT payload.' });
    }
    const sql = `
        SELECT l.ID, l.TITLE, l.PRICE, l.CONDITION, l.LOCATION, c.NAME AS CATEGORY_NAME,
               (SELECT MIN(i.IMAGE_URL) FROM IMAGES i WHERE i.LISTING_ID = l.ID) AS IMAGE_URL
        FROM LISTINGS l
        JOIN CATEGORIES c ON l.CATEGORY_ID = c.ID
        WHERE l.SELLER_ID = :sellerId
        ORDER BY l.CREATED_AT DESC
    `;
    try {
        const result = await db.execute(sql, { sellerId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching my listings:', err);
        res.status(500).json({ message: 'Error fetching my listings', error: err.message });
    }
};

module.exports = { getListings, getListingById, createListing, getCategories, getMyListings, deleteListing, updateListing };
