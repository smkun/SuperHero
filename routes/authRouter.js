// Load necessary modules from npm packages
const express = require("express"); // Framework for handling and routing HTTP requests
const passport = require("passport"); // Authentication middleware for Node.js
const User = require("../models/User"); // User model for handling user data in MongoDB
const bcrypt = require("bcrypt"); // Library for hashing and securing passwords

const router = express.Router(); // Create a new router object to manage routes

// Route to serve the registration page
router.get("/register", (req, res) => {
    res.render("register", { user: req.user }); // Render the registration form template and pass any user data if available
});

// Route to handle registration form submission
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body; // Extract username and password from request body
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password using bcrypt
        const user = new User({ username, password: hashedPassword }); // Create a new user instance with hashed password
        await user.save(); // Save the new user to the database
        res.redirect("/auth/login"); // Redirect user to the login page after registration
    } catch (error) {
        console.error("Error registering user:", error); // Log any errors during the registration process
        res.status(500).send("Internal Server Error"); // Respond with error status code and message
    }
});

// Route to serve the login page
router.get("/login", (req, res) => {
    res.render("login", { user: req.user }); // Render the login form template and pass any user data if available
});

// Route to handle login form submission using Passport's 'local' strategy
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/", // Redirect to the home page on successful login
        failureRedirect: "/auth/login", // Redirect back to the login page on failed login
    })
);

// Route to handle user logout
router.get("/logout", (req, res) => {
    req.logout(function (err) { // Passport's logout function to end user session
        if (err) {
            console.error("Error logging out:", err); // Log any errors during the logout process
        }
        res.redirect("/"); // Redirect to the home page after logout
    });
});

module.exports = router; // Export the router to be used by other parts of the application
