require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const bcrypt = require("bcryptjs"); 
const app = express();
app.use(express.json());
app.use(cors());

// ✅ Serve static files (e.g., images, favicon)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve favicon explicitly to fix 404 error
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

// ✅ Define User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// ✅ Define Recipe Schema
const RecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: { type: String, required: true },
    instructions: { type: String, required: true }
});
const Recipe = mongoose.model("Recipe", RecipeSchema);

// ✅ Define Pastry Shop Schema
const PastryShopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, required: true },
    description: { type: String, required: true }
});
const PastryShop = mongoose.model("PastryShop", PastryShopSchema);

// ✅ Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Signup API
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, Email, and Password are required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Login API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.json({ message: "Login successful!" });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Submit Recipe API
app.post('/api/recipes', async (req, res) => {
    try {
        const { name, ingredients, instructions } = req.body;
        if (!name || !ingredients || !instructions) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newRecipe = new Recipe({ name, ingredients, instructions });
        await newRecipe.save();
        res.status(201).json({ message: "Recipe submitted successfully!" });
    } catch (error) {
        console.error("❌ Recipe Submission Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Get All Recipes API
app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find().lean();
        res.json({ success: true, recipes });
    } catch (error) {
        console.error("❌ Fetching Recipes Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Multer Storage (Uploads to Cloudinary)
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "pastry_images",  // Cloudinary folder name
        format: async (req, file) => "png", // Convert all uploads to PNG
        public_id: (req, file) => file.originalname.split(".")[0] // Use original filename
    }
});
const upload = multer({ storage });

// ✅ Image Schema
const ImageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    description: { type: String } // Optional description field
});
const Image = mongoose.model("Image", ImageSchema);

// ✅ Upload Image API
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const newImage = new Image({ imageUrl: req.file.path });
        await newImage.save();

        res.status(201).json({ message: "Image uploaded successfully!", imageUrl: req.file.path });
    } catch (error) {
        console.error("❌ Image Upload Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Get All Uploaded Images API
app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json({ success: true, images });
    } catch (error) {
        console.error("❌ Fetching Images Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// ✅ Catch-all route for unknown endpoints (returns JSON instead of HTML)
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
