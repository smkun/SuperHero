const express = require("express");
const Superhero = require("../models/Superhero"); // Model for superhero data
const { handleFight } = require("../utils/fightUtils"); // Utility function to handle the fight logic

const router = express.Router(); // Create a new router to manage routes

// GET route to display the fight form and list all superheroes
router.get("/", async (req, res) => {
    try {
        const superheroes = await Superhero.find(); // Fetch all superheroes from the database
        res.render("fight", { superheroes, user: req.user }); // Render the fight page with the list of superheroes and user info
    } catch (error) {
        console.error("Error fetching superheroes:", error); // Log error if there's an issue fetching superheroes
        res.status(500).send("Internal Server Error"); // Send error response
    }
});

// API endpoint to get a list of superhero names
router.get("/api/superheroes", async (req, res) => {
    try {
        const superheroes = await Superhero.find({}, "name"); // Fetch only the names of all superheroes
        res.json(superheroes); // Send the names as a JSON response
    } catch (error) {
        console.error("Error fetching superhero names:", error); // Log error if there's an issue fetching names
        res.status(500).send("Internal Server Error"); // Send error response
    }
});

// POST route to handle the actual fight logic between two selected superheroes
router.post("/", async (req, res) => {
    console.log("Received fight request with:", req.body); // Log the received request body
    const { hero1Name, hero2Name } = req.body; // Destructure the names of the heroes from the request body
    try {
        const hero1 = await Superhero.findOne({ name: hero1Name }); // Fetch first superhero from the database
        const hero2 = await Superhero.findOne({ name: hero2Name }); // Fetch second superhero from the database

        if (!hero1 || !hero2) { // Check if both superheroes were found
            return res.status(404).send("One or both heroes not found"); // Send an error if one or both are not found
        }

        const { winner, imageUrl } = await handleFight(hero1, hero2); // Process the fight and determine the winner and image URL
        // Redirect to the results page with URL-encoded parameters to display the results
        res.redirect(
            `/fight/results?hero1=${encodeURIComponent(
                hero1.name
            )}&hero2=${encodeURIComponent(
                hero2.name
            )}&winner=${encodeURIComponent(
                winner.name
            )}&imageUrl=${encodeURIComponent(
                imageUrl
            )}&winnerImage=${encodeURIComponent(winner.image.url)}`
        );
    } catch (error) {
        console.error("Error during hero fight:", error); // Log any errors during the fight processing
        res.status(500).send("Internal Server Error"); // Send error response
    }
});

// GET route for displaying fight results based on the query parameters
router.get("/results", async (req, res) => {
    const { hero1, hero2, winner, imageUrl, winnerImage } = req.query; // Destructure parameters from the query
    res.render("fightResults", { // Render the fight results page
        hero1Name: hero1, // Pass first hero's name
        hero2Name: hero2, // Pass second hero's name
        winnerName: winner, // Pass winner's name
        imageUrl, // Pass the URL of the image associated with the fight
        winnerImage, // Pass the image URL of the winner
        user: req.user // Pass user data for access control and display
    });
});

module.exports = router; // Export the router to be used in the main application
