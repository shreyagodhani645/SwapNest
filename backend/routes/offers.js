const express = require('express');
const router = express.Router();
const offersController = require('../controllers/offersController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, offersController.createOffer);
router.get('/my-listings', verifyToken, offersController.getMyListingsOffers);
router.patch('/:id', verifyToken, offersController.updateOfferStatus);

module.exports = router;
