const express = require("express");
const Superhero = require("../models/Superhero");
const { handleFight } = require("../utils/fightUtils");

const router = express.Router();

// GET route to display fight form and list of heroes
router.get("/", async (req, res) => {
    try {
        const superheroes = await Superhero.find();
        res.render("fight", { superheroes, user: req.user }); // No fight data passed initially
    } catch (error) {
        console.error("Error fetching superheroes:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/api/superheroes", async (req, res) => {
    try {
        const superheroes = await Superhero.find({}, "name");
        res.json(superheroes);
    } catch (error) {
        console.error("Error fetching superhero names:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST route to handle the fight logic
router.post("/", async (req, res) => {
    console.log("Received fight request with:", req.body);
    const { hero1Name, hero2Name } = req.body;
    try {
        const hero1 = await Superhero.findOne({ name: hero1Name });
        const hero2 = await Superhero.findOne({ name: hero2Name });

        if (!hero1 || !hero2) {
            return res.status(404).send("One or both heroes not found");
        }

        const { winner, imageUrl } = await handleFight(hero1, hero2);
        // Use URL encoding to pass parameters safely
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
        console.error("Error during hero fight:", error);
        res.status(500).send("Internal Server Error");
    }
});

// GET route for displaying fight results
router.get("/results", async (req, res) => {
    const { hero1, hero2, winner, imageUrl, winnerImage } = req.query;
    res.render("fightResults", {
        hero1Name: hero1,
        hero2Name: hero2,
        winnerName: winner,
        imageUrl,
        winnerImage,
        user: req.user,
    });
});

module.exports = router;
