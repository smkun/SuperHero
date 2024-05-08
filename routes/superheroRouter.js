const express = require("express");
const Superhero = require("../models/Superhero"); // Import the superhero model
const { getNextSequence } = require("../utils/sequence"); // Function to get the next sequence for unique ID generation
const { ensureAuthenticated } = require("../middleware/auth"); // Middleware to ensure routes are accessed by authenticated users

const router = express.Router(); // Create a new router instance

// INDEX route - List all superheroes
router.get("/", async (req, res) => {
  try {
    const superheroes = await Superhero.find(); // Fetch all superheroes from the database
    res.render("superheroes", { superheroes, user: req.user }); // Render the superheroes page with fetched data and user info
  } catch (error) {
    console.error("Error fetching superheroes:", error); // Log errors if fetching fails
    res.status(500).send("Internal Server Error"); // Respond with an error status
  }
});

// NEW route - Show a form to create a new superhero
router.get("/new", ensureAuthenticated, (req, res) => {
  res.render("new", { user: req.user }); // Render the form for creating a new superhero, ensuring the user is authenticated
});

// CREATE route - Post a new superhero
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    // Create a new superhero with a unique ID and data from the request body
    const superhero = new Superhero({
      _id: await getNextSequence("superheroID"), // Get a unique ID for the new superhero
      ...req.body, // Spread operator to include all data from the request body
      createdBy: req.user._id, // Store the ID of the user creating the superhero
    });
    await superhero.save(); // Save the new superhero in the database
    res.redirect("/superheroes"); // Redirect to the list of superheroes
  } catch (error) {
    console.error("Error creating superhero:", error); // Log errors if creation fails
    res.status(500).send("Internal Server Error"); // Respond with an error status
  }
});

// EDIT route - Show a form to edit an existing superhero
router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id); // Find the superhero by ID
    if (!superhero) {
      return res.status(404).send("Superhero not found"); // If no superhero is found, send a 404 error
    }
    if (superhero.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect("/unauthorized"); // If the superhero was not created by the current user, redirect to unauthorized page
    }
    res.render("edit", { superhero, user: req.user }); // Render the edit form with the superhero data and user info
  } catch (error) {
    console.error("Error fetching superhero:", error); // Log errors if fetching fails
    res.status(500).send("Internal Server Error"); // Respond with an error status
  }
});

// DELETE route - Delete an existing superhero
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id); // Find the superhero by ID

    if (!superhero) {
      return res.status(404).send("Superhero not found"); // If no superhero is found, send a 404 error
    }

    if (superhero.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect("/unauthorized"); // If the superhero was not created by the current user, redirect to unauthorized page
    }

    await Superhero.findByIdAndDelete(req.params.id); // Delete the superhero
    res.redirect("/superheroes"); // Redirect to the list of superheroes
  } catch (error) {
    console.error("Error deleting superhero:", error); // Log errors if deletion fails
    res.status(500).send("Internal Server Error"); // Respond with an error status
  }
});

// SHOW route - Display a single superhero
router.get("/:id", async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id); // Find the superhero by ID
    if (!superhero) {
      return res.status(404).send("Superhero not found"); // If no superhero is found, send a 404 error
    }
    res.render("show", { superhero, user: req.user }); // Render the page to show detailed info about the superhero
  } catch (error) {
    console.error("Error fetching superhero:", error); // Log errors if fetching fails
    res.status(500).send("Internal Server Error"); // Respond with an error status
  }
});

// UPDATE route - Update an existing superhero
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    await Superhero.findByIdAndUpdate(req.params.id, req.body); // Update the superhero with data from the request body
    res.redirect(`/superheroes/${req.params.id}`); // Redirect to the updated superhero's page
  } catch (error) {
    console.error("Error updating superhero:", error); // Log errors if updating fails
    res.status(500).send("Internal Server Error"); // Respond with an error status
  }
});

module.exports = router; // Export the router so it can be used by the main app module
