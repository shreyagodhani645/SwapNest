const db = require('../db');
const oracledb = require('oracledb');

const sendMessage = async (req, res) => {
    const { listingId, receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!listingId || !receiverId || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const sql = `
            INSERT INTO MESSAGES (LISTING_ID, SENDER_ID, RECEIVER_ID, CONTENT)
            VALUES (:listingId, :senderId, :receiverId, :content)
        `;
        await db.execute(sql, { listingId, senderId, receiverId, content });
        res.status(201).json({ message: 'Message sent' });
    } catch (err) {
        res.status(500).json({ message: 'Error sending message', error: err.message });
    }
};

const getConversation = async (req, res) => {
    const { listingId, otherUserId } = req.query;
    const userId = req.user.id;

    const sql = `
        SELECT m.*, u.USERNAME as SENDER_NAME
        FROM MESSAGES m
        JOIN USERS u ON m.SENDER_ID = u.ID
        WHERE m.LISTING_ID = :listingId
        AND ((m.SENDER_ID = :userId AND m.RECEIVER_ID = :otherUserId)
             OR (m.SENDER_ID = :otherUserId AND m.RECEIVER_ID = :userId))
        ORDER BY m.CREATED_AT ASC
    `;

    try {
        const result = await db.execute(sql, { listingId, userId, otherUserId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching conversation', error: err.message });
    }
};

const getInbox = async (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT DISTINCT l.ID as LISTING_ID, l.TITLE, 
               CASE WHEN m.SENDER_ID = :userId THEN m.RECEIVER_ID ELSE m.SENDER_ID END as OTHER_USER_ID,
               u.USERNAME as OTHER_USER_NAME
        FROM MESSAGES m
        JOIN LISTINGS l ON m.LISTING_ID = l.ID
        JOIN USERS u ON (CASE WHEN m.SENDER_ID = :userId THEN m.RECEIVER_ID ELSE m.SENDER_ID END) = u.ID
        WHERE m.SENDER_ID = :userId OR m.RECEIVER_ID = :userId
    `;

    try {
        const result = await db.execute(sql, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching inbox', error: err.message });
    }
};

module.exports = { sendMessage, getConversation, getInbox };
