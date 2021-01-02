const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places');
const usersRoutes = require('./routes/users');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || 'An unkown error occurred.' });
});

app.use(usersRoutes);

app.listen(5000);
