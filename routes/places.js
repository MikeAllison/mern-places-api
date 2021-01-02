const express = require('express');

const placesController = require('../controllers/places');

const router = express.Router();

router.get('/user/:userId', placesController.getPlacesByUserId);

router.get('/:placeId', placesController.getPlaceById);

router.post('/', placesController.createPlace);

module.exports = router;
