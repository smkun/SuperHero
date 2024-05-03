const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const User = require("./models/User");

const superheroRouter = require("./routes/superheroRouter");
const authRouter = require("./routes/authRouter");
const fightRouter = require("./routes/fightRouter");

const app = express();
const port = 3005;

require("dotenv").config();
require("./config/passport")(passport);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

// Mount routers
app.use("/superheroes", superheroRouter);
app.use("/auth", authRouter);
app.use("/fight", fightRouter);

// Home route
app.get("/", (req, res) => {
    res.render("home", { user: req.user });
});

// Slideshow route
app.get("/slideshow", (req, res) => {
    res.render("slideshow");
});

// Unauthorized route
app.get("/unauthorized", (req, res) => {
    res.render("unauthorized", { user: req.user });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
