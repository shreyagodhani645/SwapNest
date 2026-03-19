const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, wishlistController.getWishlist);
router.post('/', verifyToken, wishlistController.addToWishlist);
router.get('/check/:listing_id', verifyToken, wishlistController.checkWishlist);
router.delete('/:listing_id', verifyToken, wishlistController.removeFromWishlist);

module.exports = router;
