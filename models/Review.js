const mongoose = require('mongoose');

// ✅ Define Review Schema
const ReviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true }, // Added location field
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
