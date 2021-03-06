const fs = require('fs');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordinatesFromAddress = require('../util/geocoding');

const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  let place;
  try {
    place = await Place.findById(req.params.placeId).exec();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  if (!place) {
    return next(new HttpError('Could not find a place with that ID.', 404));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  let places;
  try {
    places = await Place.find({ creator: req.params.userId }).exec();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places for that user.', 404));
  }

  res
    .status(200)
    .json({ places: places.map((place) => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, address } = req.body;

  let user;
  try {
    user = await User.findById(req.userData.userId); // This comes from middleware/check-auth
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  if (!user) {
    return next(new HttpError('Could not find user.', 404));
  }

  let coordinates;
  try {
    coordinates = await getCoordinatesFromAddress(address);
  } catch (err) {
    return next(err);
  }

  const newPlace = new Place({
    title,
    description,
    imagePath: req.file.path,
    coordinates: coordinates,
    address,
    creator: user
  });

  try {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    await newPlace.save({ session: dbSession });
    user.places.push(newPlace);
    await user.save({ session: dbSession });
    await dbSession.commitTransaction();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res.status(201).json({ place: newPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findById(req.params.placeId).exec();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  if (!place) {
    return next(new HttpError('Could not find a place with that ID.', 404));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError('You are not authorized to edit this place.', 401)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  let place;
  try {
    place = await Place.findById(req.params.placeId).populate('creator');
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  if (!place) {
    return next(
      new HttpError(`Could not find place with ID ${req.params.placeId}.`, 404)
    );
  }

  if (place.creator.id !== req.userData.userId) {
    return next(
      new HttpError('You are not authorized to delete this place.', 401)
    );
  }

  try {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    await place.remove({ session: dbSession });
    place.creator.places.remove(place);
    await place.creator.save({ session: dbSession });
    await dbSession.commitTransaction();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  // Delete associated image
  fs.unlink(place.imagePath, (err) => {
    if (err) {
      console.log(err);
    }
  });

  res
    .status(200)
    .json({ message: `Place with ID ${req.params.placeId} has been deleted.` });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
