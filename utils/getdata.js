const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const Superhero = require("../models/Superhero");
const {getNextSequence} = require("./sequence");

import("node-fetch").then(({ default: fetch }) => {});

require("dotenv").config();

app.set("view engine", "ejs");

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

mongoose.connect(process.env.MONGODB_URI, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});

const superheroIds = [
    332, 332
]; // Array of superhero IDs to retrieve from the API

async function populateDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {});
  
      for (const superheroId of superheroIds) {
        const response = await fetch(
          `https://superheroapi.com/api/${process.env.SUPERHERO_API_KEY}/${superheroId}`
        );
        const superheroData = await response.json();
  
        const powerstats = {
          intelligence: parseInt(superheroData.powerstats.intelligence, 10),
          strength: parseInt(superheroData.powerstats.strength, 10),
          speed: parseInt(superheroData.powerstats.speed, 10),
          durability: parseInt(superheroData.powerstats.durability, 10),
          power: parseInt(superheroData.powerstats.power, 10),
          combat: parseInt(superheroData.powerstats.combat, 10),
        };
  
        const superheroUpdate = {
          $set: {
            powerstats: powerstats,
            biography: {
              "full-name": superheroData.biography["full-name"],
            },
            image: {
              url: superheroData.image.url,
            },
          },
          $setOnInsert: {
            _id: await getNextSequence("superheroID"),
          },
        };
  
        const options = {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        };
  
        const result = await Superhero.findOneAndUpdate(
          { name: superheroData.name },
          superheroUpdate,
          options
        );
  
        console.log(
          `Superhero ${superheroData.name} ${result.upserted ? 'inserted' : 'updated'} successfully!`
        );
      }
  
      console.log("Database populated successfully!");
    } catch (error) {
      console.error("Error populating database:", error);
    } finally {
      await mongoose.disconnect();
    }
  }

populateDatabase();
