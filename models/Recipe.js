const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: { type: String, required: true },
    instructions: { type: String, required: true },
    image: { type: String }, // Store image as Base64
});

module.exports = mongoose.model("Recipe", RecipeSchema);
