const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
  name: {
    type: String,
    max: 255
  },
  number: {
    type: String,
    require: true,
    max: 255
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);