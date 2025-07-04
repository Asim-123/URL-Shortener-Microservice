const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const dns = require('dns');
const { promisify } = require('util');
require('dotenv').config();

// Promisify dns.lookup for async/await usage
const dnsLookup = promisify(dns.lookup);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage
const urls = [];
let urlCounter = 0;

// DNS validation function
async function validateUrlWithDNS(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Perform DNS lookup to verify the hostname exists
    await dnsLookup(hostname);
    return true;
  } catch (error) {
    console.log(`DNS validation failed for ${url}:`, error.message);
    return false;
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// POST /api/shorturl
app.post('/api/shorturl', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Check if URL is valid (custom validation to preserve case)
    const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!urlPattern.test(url)) {
      return res.json({ error: 'invalid url' });
    }
    
    // Validate URL with DNS lookup
    const isDnsValid = await validateUrlWithDNS(url);
    if (!isDnsValid) {
      return res.json({ error: 'invalid url' });
    }
    
    // Check if URL already exists (case-insensitive comparison)
    const existingUrl = urls.find(u => 
      u.original_url.toLowerCase() === url.toLowerCase()
    );
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }
    
    // Get the next short URL number
    urlCounter++;
    const shortUrl = urlCounter;
    
    // Create new URL entry
    const newUrl = {
      original_url: url,
      short_url: shortUrl
    };
    
    urls.push(newUrl);
    
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
    
    const url = urls.find(u => u.short_url === shortUrl);
    
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
    const sortedUrls = urls.sort((a, b) => a.short_url - b.short_url);
    res.json(sortedUrls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 