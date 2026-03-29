const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/categories', listingsController.getCategories);
router.get('/my-listings', authMiddleware, listingsController.getMyListings);
router.get('/:id', listingsController.getListingById);
router.get('/', listingsController.getListings);

// Protected routes  
router.post('/', authMiddleware, upload.single('image'), listingsController.createListing);
router.put('/:id', authMiddleware, upload.single('image'), listingsController.updateListing);
router.delete('/:id', authMiddleware, listingsController.deleteListing);
router.patch('/:id/status', authMiddleware, listingsController.updateListingStatus);

module.exports = router;
