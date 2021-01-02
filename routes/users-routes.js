const express = require('express');

const router = express.Router();

router.get('/:userId', (req, res, next) => {
  const userId = req.params.userId;
  const place = DUMMY_PLACES.find((place) => place.id === placeId);
  res.json({ place });
});

module.exports = router;
