const { v4: uuidv4 } = require('uuid');

const HttpError = require('../models/http-error');

const USERS = [
  {
    id: 'u1',
    name: 'User 1',
    email: 'user1@asdf.com',
    password: 'asdf1234',
    imageUrl: 'https://www.stevensegallery.com/350/350',
    places: 3
  },
  {
    id: 'u2',
    name: 'User 2',
    email: 'user2@asdf.com',
    password: 'asdf1234',
    imageUrl: 'https://www.stevensegallery.com/350/350',
    places: 2
  }
];

const getUsers = (req, res, next) => {
  if (USERS.length === 0) {
    return next(new HttpError('No users exist.', 404));
  }

  res.status(200).json({ users: USERS });
};

const signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
    imageUrl: 'https://www.stevensegallery.com/350/350',
    places: 0
  };

  USERS.push(newUser);

  res.status(201).json({ user: newUser });
};

const login = (req, res, next) => {
  const user = USERS.find((user) => user.email === req.body.email);

  if (!user || user.password !== req.body.password) {
    return next(new HttpError('Email or password invalid.', 404));
  }

  res.status(200).json({ message: 'Logged in successfully.' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
