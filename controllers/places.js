// const { v4: uuidv4 } = require('uuid');
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
  } catch (error) {
    return next(new HttpError(error, 500));
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
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places for that user ID.', 404));
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

  const { title, description, imageUrl, address } = req.body;

  let user;
  try {
    user = await User.findOne(); // TO-DO - Make work with auth
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  if (!user) {
    return next(new HttpError('Could not find user.', 404));
  }

  let coordinates;
  try {
    coordinates = await getCoordinatesFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    imageUrl,
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
  } catch (error) {
    return next(new HttpError(error, 500));
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
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  if (!place) {
    return next(new HttpError('Could not find a place with that ID.', 404));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  let place;
  try {
    place = await Place.findById(req.params.placeId).populate('creator');
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  if (!place) {
    return next(
      new HttpError(`Could not find place with ID ${req.params.placeId}.`, 404)
    );
  }

  try {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    await place.remove({ session: dbSession });
    place.creator.places.remove(place);
    await place.creator.save({ session: dbSession });
    await dbSession.commitTransaction();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res
    .status(200)
    .json({ message: `Place with ID ${req.params.placeId} has been deleted.` });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
