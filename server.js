const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const validUrl = require('valid-url');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// URL Schema
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    required: true,
    unique: true
  }
});

const Url = mongoose.model('Url', urlSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// POST /api/shorturl
app.post('/api/shorturl', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Check if URL is valid
    if (!validUrl.isUri(url)) {
      return res.json({ error: 'invalid url' });
    }
    
    // Check if URL already exists
    const existingUrl = await Url.findOne({ original_url: url });
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }
    
    // Get the next short URL number
    const count = await Url.countDocuments();
    const shortUrl = count + 1;
    
    // Create new URL document
    const newUrl = new Url({
      original_url: url,
      short_url: shortUrl
    });
    
    await newUrl.save();
    
    res.json({
      original_url: url,
      short_url: shortUrl
    });
    
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const shortUrl = parseInt(req.params.short_url);
    
    if (isNaN(shortUrl)) {
      return res.status(400).json({ error: 'Invalid short URL' });
    }
    
    const url = await Url.findOne({ short_url: shortUrl });
    
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    res.redirect(url.original_url);
    
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all URLs (for testing)
app.get('/api/shorturl', async (req, res) => {
  try {
    const urls = await Url.find().sort({ short_url: 1 });
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 