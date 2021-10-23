const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    required: true,
    type: String
  },
  userType: {
    required: true,
    type: String,
  },
  createdBy: {
    required: true,
    type: String,
  },
  updatedBy: {
    required: true,
    type: String,
  }
}, { timestamps: true, minimize: false });

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);