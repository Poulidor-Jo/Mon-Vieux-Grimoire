const mongoose = require('mongoose');


const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [{ userId: String, grade: Number }],
  averageRating: {
    type: Number,
    get: function (v) {
      return Math.round(v * 10) / 10;
    },
    required: true,
  },
}, { toJSON: { getters: true } });


module.exports = mongoose.model('Book', bookSchema);