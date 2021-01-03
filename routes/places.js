const express = require('express');

const placesController = require('../controllers/places');

const router = express.Router();

router.get('/user/:userId', placesController.getPlacesByUserId);

router.get('/:placeId', placesController.getPlaceById);
router.patch('/:placeId', placesController.updatePlace);
router.delete('/:placeId', placesController.deletePlace);

router.post('/', placesController.createPlace);

module.exports = router;
