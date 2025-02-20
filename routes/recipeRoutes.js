const express = require("express");
const multer = require("multer");
const Recipe = require("../models/Recipe"); // Create this model
const router = express.Router();

// Multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { name, ingredients, instructions } = req.body;
        const image = req.file ? req.file.buffer.toString("base64") : null;

        const newRecipe = new Recipe({
            name,
            ingredients,
            instructions,
            image,
        });

        await newRecipe.save();
        res.status(201).json({ message: "Recipe submitted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error submitting recipe." });
    }
});

module.exports = router;
