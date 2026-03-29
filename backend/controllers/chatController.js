const db = require('../db');
const oracledb = require('oracledb');

const sendMessage = async (req, res) => {
    const { listingId, receiverId, content } = req.body;
    const senderId = Number(req.user.id);

    if (!listingId || !receiverId || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const sql = `
            INSERT INTO MESSAGES (LISTING_ID, SENDER_ID, RECEIVER_ID, CONTENT)
            VALUES (:listingId, :senderId, :receiverId, :content)
        `;
        await db.execute(sql, { 
            listingId: Number(listingId), 
            senderId, 
            receiverId: Number(receiverId), 
            content 
        });
        res.status(201).json({ message: 'Message sent' });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Error sending message', error: err.message });
    }
};

const getConversation = async (req, res) => {
    const { listingId, otherUserId } = req.query;
    const userId = Number(req.user.id);

    const sql = `
        SELECT m.ID, m.LISTING_ID, m.SENDER_ID, m.RECEIVER_ID, m.CONTENT, 
               m.SENT_AT AS CREATED_AT, u.USERNAME as SENDER_NAME
        FROM MESSAGES m
        JOIN USERS u ON m.SENDER_ID = u.ID
        WHERE m.LISTING_ID = :listingId
        AND ((m.SENDER_ID = :userId AND m.RECEIVER_ID = :otherUserId)
             OR (m.SENDER_ID = :otherUserId2 AND m.RECEIVER_ID = :userId2))
        ORDER BY m.SENT_AT ASC
    `;

    try {
        const result = await db.execute(sql, { 
            listingId: Number(listingId), 
            userId, 
            otherUserId: Number(otherUserId),
            otherUserId2: Number(otherUserId),
            userId2: userId
        }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching conversation:', err);
        res.status(500).json({ message: 'Error fetching conversation', error: err.message });
    }
};

const getInbox = async (req, res) => {
    const userId = Number(req.user.id);
    const sql = `
        SELECT DISTINCT l.ID as LISTING_ID, l.TITLE, 
               CASE WHEN m.SENDER_ID = :userId1 THEN m.RECEIVER_ID ELSE m.SENDER_ID END as OTHER_USER_ID,
               u.USERNAME as OTHER_USER_NAME
        FROM MESSAGES m
        JOIN LISTINGS l ON m.LISTING_ID = l.ID
        JOIN USERS u ON (CASE WHEN m.SENDER_ID = :userId2 THEN m.RECEIVER_ID ELSE m.SENDER_ID END) = u.ID
        WHERE m.SENDER_ID = :userId3 OR m.RECEIVER_ID = :userId4
    `;

    try {
        const result = await db.execute(sql, { 
            userId1: userId, 
            userId2: userId, 
            userId3: userId, 
            userId4: userId 
        }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inbox:', err);
        res.status(500).json({ message: 'Error fetching inbox', error: err.message });
    }
};

module.exports = { sendMessage, getConversation, getInbox };
