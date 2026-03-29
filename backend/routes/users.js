const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/profile/:userId', userController.getPublicProfile);
router.put('/profile', authMiddleware, upload.single('profilePicture'), userController.updateProfile);

module.exports = router;
