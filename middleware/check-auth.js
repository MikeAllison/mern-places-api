const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

const PRIVATE_KEY = 'privatekeygoeshere';

module.exports = (req, res, next) => {
  // Before a POST, browser tests the request by sending an OPTIONS request
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const authToken = req.headers.authorization.split(' ')[1]; // Authoriztion: Bearer authToken

    if (!authToken) {
      throw new Error('Authentiction failed.');
    }

    const decodedToken = jwt.verify(authToken, PRIVATE_KEY);
    req.userData = { userId: decodedToken.userId }; // Dynamically add new prop to the req object
    next();
  } catch (err) {
    return next(new HttpError('Authentication failed.', 403));
  }
};
