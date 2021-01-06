const express = require('express');
const { check } = require('express-validator');

const fileUploader = require('../middleware/file-upload');

const usersController = require('../controllers/users');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  fileUploader.single('image'),
  [
    (check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 10 }),
    check('name').not().isEmpty())
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
