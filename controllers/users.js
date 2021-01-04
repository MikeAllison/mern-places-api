// const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password'); // Exclude the password
  } catch (error) {
    return next(new HttpError(error, 500));
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
  } catch (error) {
    return next(new HttpError(error, 422));
  }

  if (user) {
    return next(new HttpError('Email address has already been used.', 422));
  }

  user = new User({
    name,
    email,
    password,
    imageUrl: 'https://www.stevensegallery.com/350/350',
    places: []
  });

  try {
    await user.save();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(201).json({ user: user.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError(error, 422));
  }

  if (!user || user.password !== password) {
    return next(new HttpError('Email or password invalid.', 401));
  }

  res.status(200).json({ message: 'Logged in successfully.' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
