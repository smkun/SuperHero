const mongoose = require('mongoose');

const powerStatsSchema = new mongoose.Schema(
  {
    intelligence: Number,
    strength: Number,
    speed: Number,
    durability: Number,
    power: Number,
    combat: Number,
  },
  { _id: false }
);

const superheroSchema = new mongoose.Schema({
  _id: Number, // Specify the type of _id as Number
  name: {
    type: String,
    required: true,
  },
  powerstats: powerStatsSchema,
  biography: {
    'full-name': String,
  },
  image: {
    url: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Superhero = mongoose.model('Superhero', superheroSchema, 'superheroes');

module.exports = Superhero;