// Import necessary modules and libraries
const LocalStrategy = require("passport-local").Strategy; // Local authentication strategy
const User = require("../models/User"); // User model for accessing the user database
const bcrypt = require("bcrypt"); // Library for hashing and comparing passwords

// Module exports a function that configures passport
module.exports = function (passport) {
  // Use a local strategy with Passport
  passport.use(
    // Create a new instance of LocalStrategy
    new LocalStrategy(async (username, password, done) => {
      try {
        // Attempt to find a user by username
        const user = await User.findOne({ username: username });
        // If no user is found, return with "Incorrect username" message
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        // If a user is found, compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        // If the password does not match, return with "Incorrect password" message
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }
        // If the password matches, return the user object
        return done(null, user);
      } catch (error) {
        // In case of any other errors, pass the error to the done function
        return done(error);
      }
    })
  );

  // Serialize the user ID to the session
  passport.serializeUser((user, done) => {
    // Save user ID to the session store
    done(null, user.id);
  });

  // Deserialize the user from the session ID
  passport.deserializeUser(async (id, done) => {
    try {
      // Find the user by ID from the database
      const user = await User.findById(id);
      // Return the user object
      done(null, user);
    } catch (error) {
      // Handle errors if user fetching fails
      done(error);
    }
  });
};
