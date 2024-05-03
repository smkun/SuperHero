const mongoose = require("mongoose");
const Superhero = require("../models/Superhero");
require("dotenv").config();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI, {})
    .then(() => {
        console.log("MongoDB connected");
        updateSuperheroes(); // Call the update function after a successful connection
    })
    .catch((err) => console.error("MongoDB connection error:", err));

async function updateSuperheroes() {
    const defaultUserId = new mongoose.Types.ObjectId(
        "663267dd8d78b2bcf1d61a84"
    ); // The ObjectId of the user

    try {
        const result = await Superhero.updateMany(
            { createdBy: { $exists: false } }, // Filter: selects documents without `createdBy`
            { $set: { createdBy: defaultUserId } }, // Update: sets `createdBy` to defaultUserId
            { multi: true } // Ensure the update applies to all matching documents
        );

        console.log("Updated documents:", result.nModified); // Log the number of documents modified
    } catch (error) {
        console.error("Error updating documents:", error);
    } finally {
        mongoose.disconnect(); // Disconnect from MongoDB after the operation
        console.log("MongoDB disconnected");
    }
}
