const express = require("express");
const Superhero = require("../models/Superhero");
const { getNextSequence } = require("../utils/sequence");
const { ensureAuthenticated } = require("../middleware/auth");

const router = express.Router();

// INDEX route
router.get("/", async (req, res) => {
  try {
    const superheroes = await Superhero.find();
    res.render("superheroes", { superheroes, user: req.user });
  } catch (error) {
    console.error("Error fetching superheroes:", error);
    res.status(500).send("Internal Server Error");
  }
});

// NEW route
router.get("/new", ensureAuthenticated, (req, res) => {
  res.render("new", { user: req.user });
});

// CREATE route
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const superhero = new Superhero({
      _id: await getNextSequence("superheroID"),
      ...req.body,
      createdBy: req.user._id,
    });
    await superhero.save();
    res.redirect("/superheroes");
  } catch (error) {
    console.error("Error creating superhero:", error);
    res.status(500).send("Internal Server Error");
  }
});

// EDIT route
router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id);
    if (!superhero) {
      return res.status(404).send("Superhero not found");
    }
    if (superhero.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect("/unauthorized");
    }
    res.render("edit", { superhero, user: req.user });
  } catch (error) {
    console.error("Error fetching superhero:", error);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE route
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id);

    if (!superhero) {
      return res.status(404).send("Superhero not found");
    }

    if (superhero.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect("/unauthorized");
    }

    await Superhero.findByIdAndDelete(req.params.id);
    res.redirect("/superheroes");
  } catch (error) {
    console.error("Error deleting superhero:", error);
    res.status(500).send("Internal Server Error");
  }
});

// SHOW route
router.get("/:id", async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id);
    if (!superhero) {
      return res.status(404).send("Superhero not found");
    }
    res.render("show", { superhero, user: req.user });
  } catch (error) {
    console.error("Error fetching superhero:", error);
    res.status(500).send("Internal Server Error");
  }
});

// UPDATE route
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    await Superhero.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/superheroes/${req.params.id}`);
  } catch (error) {
    console.error("Error updating superhero:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;