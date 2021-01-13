const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

const User = require('../models/user');

const PRIVATE_KEY = 'privatekeygoeshere';

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password'); // Exclude the password
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(res.status(400).json({ errors: errors.array() }));
  }

  const { name, email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError(err, 422));
  }

  if (user) {
    return next(new HttpError('Email address has already been used.', 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12); // Second arg is number of salting rounds
  } catch {
    return next(new HttpError('Could not create user, please try again.', 500));
  }

  user = new User({
    name,
    email,
    password: hashedPassword,
    imagePath: req.file.path,
    places: []
  });

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: user.id, email: user.email },
      PRIVATE_KEY,
      {
        expiresIn: '1h'
      }
    );
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res.status(201).json({ userId: user.id, email: user.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError(err, 422));
  }

  if (!user) {
    return next(new HttpError('Email or password invalid.', 403));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next(
      new HttpError(
        'There was a problem with the request.  Please try again.',
        500
      )
    );
  }

  if (!isValidPassword) {
    return next(new HttpError('Email or password invalid.', 403));
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: user.id, email: user.email },
      PRIVATE_KEY,
      {
        expiresIn: '1h'
      }
    );
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res.status(200).json({ userId: user.id, email: user.email, token: token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
