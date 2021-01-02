const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building 1',
    description: 'Famous skyscraper',
    imageUrl:
      'https://marvel-b1-cdn.bc0a.com/f00000000179470/www.esbnyc.com/sites/default/files/styles/on_single_feature/public/2020-02/Green%20lights.jpg?itok=nRbtw3hG',
    address: '20 W 34th St, New York, NY 10001',
    coordinates: {
      lat: 40.7484405,
      lng: -73.9878531
    },
    creatorId: 'u1'
  },
  {
    id: 'p2',
    title: 'Empire State Building 2',
    description: 'Famous skyscraper',
    imageUrl:
      'https://marvel-b1-cdn.bc0a.com/f00000000179470/www.esbnyc.com/sites/default/files/styles/on_single_feature/public/2020-02/Green%20lights.jpg?itok=nRbtw3hG',
    address: '20 W 34th St, New York, NY 10001',
    coordinates: {
      lat: 40.7484405,
      lng: -73.9878531
    },
    creatorId: 'u1'
  }
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.placeId;
  const place = DUMMY_PLACES.find((place) => place.id === placeId);

  if (!place) {
    return next(new HttpError('Could not find a place with that ID.', 404));
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.userId;
  const places = DUMMY_PLACES.filter((places) => places.creatorId === userId);

  if (places.length === 0) {
    return next(new HttpError('Could not find places for that user ID.', 404));
  }

  res.json({ places });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
