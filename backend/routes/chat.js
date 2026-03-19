const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/send', verifyToken, chatController.sendMessage);
router.get('/conversation', verifyToken, chatController.getConversation);
router.get('/inbox', verifyToken, chatController.getInbox);

module.exports = router;
