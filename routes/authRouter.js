const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const router = express.Router();

router.get("/register", (req, res) => {
    res.render("register", { user: req.user });
});

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.redirect("/auth/login");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/login", (req, res) => {
    res.render("login", { user: req.user });
});

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/auth/login",
    })
);

router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.error("Error logging out:", err);
        }
        res.redirect("/");
    });
});

module.exports = router;
