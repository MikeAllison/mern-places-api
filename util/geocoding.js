const axios = require('axios');

const HttpError = require('../models/http-error');

API_KEY = 'AIzaSyBIKiTW8RLcYbS-GNEOgVKSXaWWbMYxjqU';

const getCoordinatesFromAddress = async (address) => {
  const response = await axios(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find the coordinates for the specified location',
      422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
};

module.exports = getCoordinatesFromAddress;
