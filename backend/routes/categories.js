const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const verifyToken = require('../middleware/authMiddleware');

// Add new category (unprotected for testing)
router.post('/', categoriesController.createCategory);

module.exports = router;
