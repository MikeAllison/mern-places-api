const multer = require('multer');
const { v1: uuidv1 } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg'
};

const fileUploader = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, `${uuidv1()}.${ext}`);
    },
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype]; // !! Converts 'undefined' to 'false'
      let error = isValid ? null : new Error('Invalid MIME Type!');
      cb(err, isValid); // If isValid=false, the file will not be accepted
    }
  })
});

module.exports = fileUploader;
