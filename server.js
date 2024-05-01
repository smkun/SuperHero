const express = require("express");
const mongoose = require("mongoose");
const Superhero = require("./models/Superhero");
const methodOverride = require("method-override");
const { getNextSequence } = require("./utils/sequence");
const { handleFight } = require("./utils/fightUtils");
const session = require("express-session");
const passport = require("passport");
const User = require("./models/User");
const bcrypt = require("bcrypt");

const app = express();
const port = 3005;

require("dotenv").config();
require("./config/passport")(passport);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

// Handle favicon.ico requests first to avoid unnecessary processing
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});
// Register and login/logout routes
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.redirect("/login");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/login", (req, res) => {
    res.render("login", { user: req.user });
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
    })
);

// Logout route
app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.error("Error logging out:", err);
        }
        res.redirect("/");
    });
});

// Unauthorized route
app.get("/unauthorized", (req, res) => {
    res.render("unauthorized", { user: req.user });
});

// Home route
app.get("/", (req, res) => {
    res.render("home", { user: req.user });
});

// INDEX route
app.get("/superheroes", async (req, res) => {
    try {
        const superheroes = await Superhero.find();
        res.render("superheroes", { superheroes, user: req.user });
    } catch (error) {
        console.error("Error fetching superheroes:", error);
        res.status(500).send("Internal Server Error");
    }
});

// NEW route
app.get("/new", ensureAuthenticated, (req, res) => {
    res.render("new", { user: req.user });
});

// GET route to display fight form and list of heroes
app.get("/fight", ensureAuthenticated, async (req, res) => {
    try {
        const superheroes = await Superhero.find();
        res.render("fight", { superheroes, user: req.user }); // No fight data passed initially
    } catch (error) {
        console.error("Error fetching superheroes:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST route to handle the fight logic
app.post("/fight", async (req, res) => {
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
app.get("/fight/results", async (req, res) => {
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

// POST route to handle the fight logic and display results
app.post("/fight", async (req, res) => {
    console.log("Received fight request with:", req.body);
    const { hero1Name, hero2Name } = req.body;
    try {
        const hero1 = await Superhero.findOne({ name: hero1Name });
        const hero2 = await Superhero.findOne({ name: hero2Name });

        if (!hero1 || !hero2) {
            return res.status(404).send("One or both heroes not found");
        }

        const { winner, imageUrl } = await handleFight(hero1, hero2);
        res.render("fight", {
            superheroes: await Superhero.find(), // Include this to allow new selections
            hero1,
            hero2,
            winner,
            imageUrl,
            winnerImage: winner.image.url,
        });
    } catch (error) {
        console.error("Error during hero fight:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Dynamic routes for specific superhero handling
// CREATE route
app.post("/", ensureAuthenticated, async (req, res) => {
    try {
        const superhero = new Superhero({
            _id: await getNextSequence("superheroID"),
            ...req.body,
            createdBy: req.user._id,
        });
        await superhero.save();
        res.redirect("/");
    } catch (error) {
        console.error("Error creating superhero:", error);
        res.status(500).send("Internal Server Error");
    }
});

// DELETE route
app.delete("/:id", async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id);

    if (!superhero) {
      return res.status(404).send("Superhero not found");
    }

    if (superhero.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect("/unauthorized");
    }

    await Superhero.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting superhero:", error);
    res.status(500).send("Internal Server Error");
  }
});

// SHOW route
app.get("/:id", async (req, res) => {
    try {
        const superhero = await Superhero.findById(req.params.id);
        res.render("show", { superhero, user: req.user });
    } catch (error) {
        console.error("Error fetching superhero:", error);
        res.status(500).send("Internal Server Error");
    }
});

// EDIT route
app.get("/:id/edit", ensureAuthenticated, async (req, res) => {
    try {
        const superhero = await Superhero.findById(req.params.id);

        if (!superhero) {
            return res.status(404).send("Superhero not found");
        }

        if (superhero.createdBy.toString() !== req.user._id.toString()) {
            return res.redirect("/unauthorized");
        }

        res.render("edit", { superhero });
    } catch (error) {
        console.error("Error fetching superhero:", error);
        res.status(500).send("Internal Server Error");
    }
});

// UPDATE route
app.put("/:id", async (req, res) => {
    try {
        await Superhero.findByIdAndUpdate(req.params.id, req.body);
        res.redirect(`/${req.params.id}`);
    } catch (error) {
        console.error("Error updating superhero:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
