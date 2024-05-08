// Define a middleware function to check if the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  // Check if the current user session is authenticated
  if (req.isAuthenticated()) {
      // If the user is authenticated, proceed to the next middleware or request handler
      return next();
  }
  // If the user is not authenticated, redirect them to the login page
  res.redirect("/auth/login");
};

// Export the ensureAuthenticated function so it can be used in other parts of the application
module.exports = { ensureAuthenticated };
