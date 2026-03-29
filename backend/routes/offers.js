const express = require('express');
const router = express.Router();
const offersController = require('../controllers/offersController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, offersController.createOffer);
router.patch('/:id', authMiddleware, offersController.updateOfferStatus);
router.get('/my-listings', authMiddleware, offersController.getMyListingsOffers);
router.get('/my-sent', authMiddleware, offersController.getMySentOffers);

module.exports = router;
