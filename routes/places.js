const express = require('express');
const { check } = require('express-validator');

const fileUploader = require('../middleware/file-upload');

const placesController = require('../controllers/places');

const router = express.Router();

router.get('/user/:userId', placesController.getPlacesByUserId);

router.get('/:placeId', placesController.getPlaceById);
router.patch(
  '/:placeId',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesController.updatePlace
);
router.delete('/:placeId', placesController.deletePlace);

router.post(
  '/',
  fileUploader.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty()
  ],
  placesController.createPlace
);

module.exports = router;
