const mongoose = require('mongoose');

const powerStatsSchema = new mongoose.Schema(
  {
    intelligence: String,
    strength: String,
    speed: String,
    durability: String,
    power: String,
    combat: String,
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
});

const Superhero = mongoose.model('Superhero', superheroSchema, 'superheroes');

module.exports = Superhero;