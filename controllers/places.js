const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordinatesFromAddress = require('../util/geocoding');

const PLACES = [
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
  const place = PLACES.find((place) => place.id === req.params.placeId);

  if (!place) {
    return next(new HttpError('Could not find a place with that ID.', 404));
  }

  res.status(200).json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const places = PLACES.filter(
    (places) => places.creatorId === req.params.userId
  );

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places for that user ID.', 404));
  }

  res.status(200).json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, imageUrl, address, creatorId } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordinatesFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = {
    id: uuidv4(),
    title,
    description,
    imageUrl,
    coordinates: coordinates,
    address,
    creatorId
  };

  PLACES.push(newPlace);

  res.status(201).json({ place: newPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description } = req.body;

  const index = PLACES.findIndex((place) => place.id === req.params.placeId);

  if (index === -1) {
    return next(new HttpError('Place not found.', 404));
  }

  // Create a copy of the object so it can be updated all at once
  const updatedPlace = {
    ...PLACES.find((place) => place.id === req.params.placeId)
  };

  updatedPlace.title = title;
  updatedPlace.description = description;

  PLACES[index] = req.body.place;

  res.status(200).json({ place: PLACES[index] });
};

const deletePlace = (req, res, next) => {
  const index = PLACES.findIndex((place) => place.id === req.params.placeId);

  if (index === -1) {
    return next(new HttpError('Place not found.', 404));
  }

  PLACES.splice(index, 1);

  res
    .status(200)
    .json({ message: `Place with ID ${req.params.placeId} has been deleted.` });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
