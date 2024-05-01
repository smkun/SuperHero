const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const Superhero = require("./models/Superhero");
const {getNextSequence} = require("./utils/sequence");

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
   23,75,156,185,196,638,490,717
]; // Array of superhero IDs to retrieve from the API

async function populateDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
        });

        for (const superheroId of superheroIds) {
            const response = await fetch(
                `https://superheroapi.com/api/${process.env.SUPERHERO_API_KEY}/${superheroId}`
            );
            const superheroData = await response.json();

            const superhero = new Superhero({
                _id: await getNextSequence("superheroID"),
                name: superheroData.name,
                powerstats: superheroData.powerstats,
                biography: {
                    "full-name": superheroData.biography["full-name"],
                },
                image: {
                    url: superheroData.image.url,
                },
            });

            await superhero.save();
            console.log(
                `Superhero ${superheroData.name} populated successfully!`
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
