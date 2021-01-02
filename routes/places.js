const express = require('express');

const placesControllers = require('../controllers/places');

const router = express.Router();

router.get('/user/:userId', placesControllers.getPlacesByUserId);

router.get('/:placeId', placesControllers.getPlaceById);

// router.post('', (req, res, next) => {
//   console.log('/api/places/user/userId');
//   res.json({ message: 'api/places/user/userId' });
// });

module.exports = router;
