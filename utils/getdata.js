const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const Superhero = require("../models/Superhero");
const { getNextSequence } = require("./sequence");
const { exec } = require("child_process");
const path = require("path");

import("node-fetch").then(({ default: fetch }) => {});

require("dotenv").config();

app.set("view engine", "ejs");

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

mongoose.connect(process.env.MONGODB_URI, {
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});

const superheroIds = [
    701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731
]; // Array of superhero IDs to retrieve from the API

async function populateDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {});
        for (const superheroId of superheroIds) {
            const response = await fetch(
                `https://superheroapi.com/api/${process.env.SUPERHERO_API_KEY}/${superheroId}`
            );
            const superheroData = await response.json();

            // Function to replace "null" values with a random number between 1 and 100
            const replaceNullWithRandom = (value) => {
                return value === "null"
                    ? Math.floor(Math.random() * 100) + 1
                    : parseInt(value, 10);
            };

            const powerstats = {
                intelligence: replaceNullWithRandom(
                    superheroData.powerstats.intelligence
                ),
                strength: replaceNullWithRandom(
                    superheroData.powerstats.strength
                ),
                speed: replaceNullWithRandom(superheroData.powerstats.speed),
                durability: replaceNullWithRandom(
                    superheroData.powerstats.durability
                ),
                power: replaceNullWithRandom(superheroData.powerstats.power),
                combat: replaceNullWithRandom(superheroData.powerstats.combat),
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
        }
        console.log("Database populated successfully!");

        // Execute updateData.js to set createdBy field
        const updateDataPath = path.join(__dirname, "updateData.js");
        exec(`node ${updateDataPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(
                    `Error executing updateData.js: ${error.message}`
                );
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    } catch (error) {
        console.error("Error populating database:", error);
    } finally {
        await mongoose.disconnect();
    }
}

populateDatabase();
