const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique only creates an index
  password: { type: String, required: true, minlength: 10 },
  imagePath: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }] // Add an empty array to record
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
