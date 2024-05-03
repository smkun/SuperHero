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

mongoose.connect(process.env.MONGODB_URI, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});

const superheroIds = [
    332, 332, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
    39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
    58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
    77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
    96, 97, 98, 99, 100,
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
