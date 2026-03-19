const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


router.get('/', listingsController.getListings);
router.get('/my-listings', verifyToken, listingsController.getMyListings);
router.get('/categories', listingsController.getCategories);

router.get('/:id', listingsController.getListingById);
router.post('/', verifyToken, upload.single('image'), listingsController.createListing);
router.put('/:id', verifyToken, upload.single('image'), listingsController.updateListing);
router.delete('/:id', verifyToken, listingsController.deleteListing);

module.exports = router;
