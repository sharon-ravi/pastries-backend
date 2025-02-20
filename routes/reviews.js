const express = require('express');
const router = express.Router();
const Review = require('../models/Review'); // Import Review Model

// ✅ Submit a new review
router.post('/', async (req, res) => {
    try {
        const { name, location, rating, comment } = req.body;
        
        // Validate input
        if (!name || !location || !rating || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create a new review
        const newReview = new Review({ name, location, rating, comment });
        await newReview.save();

        res.status(201).json({ message: "Review submitted successfully!" });
    } catch (error) {
        console.error("❌ Review Submission Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().lean();
        res.json({ success: true, reviews });
    } catch (error) {
        console.error("❌ Fetching Reviews Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
