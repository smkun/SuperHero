// Importing required modules from npm packages
const express = require("express"); // Express framework for handling HTTP requests
const mongoose = require("mongoose"); // Mongoose for MongoDB object modeling
const methodOverride = require("method-override"); // Allows use of HTTP verbs such as PUT or DELETE in places where the client doesn't support it
const session = require("express-session"); // Sessions middleware for Express
const passport = require("passport"); // Authentication middleware for Node.js
const User = require("./models/User"); // User model for MongoDB

// Import routes from different files
const superheroRouter = require("./routes/superheroRouter"); // Routes for superhero operations
const authRouter = require("./routes/authRouter"); // Routes for authentication operations
const fightRouter = require("./routes/fightRouter"); // Routes for handling fights between superheroes

const app = express(); // Initialize the express application
const port = 3005; // Port number on which the server will listen

// Configuration and middleware setup
require("dotenv").config(); // Load environment variables from .env file
require("./config/passport")(passport); // Passport configuration for authentication

app.use(express.static("public")); // Serve static files from the "public" directory
app.set("view engine", "ejs"); // Set EJS as the template engine for rendering views
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies (form submissions)
app.use(methodOverride("_method")); // Allows forms to simulate PUT/DELETE actions

// Special route to handle favicon.ico requests without logging unnecessary info
app.get("/favicon.ico", (req, res) => res.status(204).end()); // Respond with 204 No Content for favicon.ico requests

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Secret key for signing the session ID cookie
        resave: false, // Avoid resaving sessions that are unchanged
        saveUninitialized: false, // Don't save uninitialized sessions
    })
);
app.use(passport.initialize()); // Initialize Passport for authentication
app.use(passport.session()); // Allow Passport to use "express-session"

// Database connection setup
mongoose.connect(process.env.MONGODB_URI, {}); // Connect to MongoDB using URI from environment variable
const db = mongoose.connection; // Obtain the default connection
db.on("error", console.error.bind(console, "Connection error:")); // Bind error event to log connection errors
db.once("open", () => {
    console.log("Connected to MongoDB"); // Log once the database connection is open
});

// Mounting routers to handle different paths
app.use("/superheroes", superheroRouter); // Use superheroRouter for all requests to /superheroes
app.use("/auth", authRouter); // Use authRouter for all requests to /auth
app.use("/fight", fightRouter); // Use fightRouter for all requests to /fight

// Route definitions
// Home route
app.get("/", (req, res) => {
    res.render("home", { user: req.user }); // Render the home template with user data if logged in
});

// Slideshow route
app.get("/slideshow", (req, res) => {
    res.render("slideshow"); // Render the slideshow page
});

// Unauthorized access route
app.get("/unauthorized", (req, res) => {
    res.render("unauthorized", { user: req.user }); // Render the unauthorized template with user data
});

// Start the server on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`); // Log the server start and the listening port
});
