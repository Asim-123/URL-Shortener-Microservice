const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for URLs (in production, use a database)
let urlDatabase = [];
let urlCounter = 1;

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to create short URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  
  // Validate URL format
  const urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }
  
  // Check if URL already exists
  const existingUrl = urlDatabase.find(entry => entry.original_url === url);
  if (existingUrl) {
    return res.json({
      original_url: existingUrl.original_url,
      short_url: existingUrl.short_url
    });
  }
  
  // Create new short URL
  const shortUrl = urlCounter;
  const newEntry = {
    original_url: url,
    short_url: shortUrl
  };
  
  urlDatabase.push(newEntry);
  urlCounter++;
  
  res.json({
    original_url: url,
    short_url: shortUrl
  });
});

// Redirect endpoint for short URLs
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  
  if (urlEntry) {
    res.send(urlEntry.original_url);
  } else {
    res.status(404).json({ error: 'Short URL not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 