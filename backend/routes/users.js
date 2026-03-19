const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profile/:userId', userController.getPublicProfile);

module.exports = router;
