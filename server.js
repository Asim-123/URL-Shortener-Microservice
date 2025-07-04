const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3002;

const uri = 'mongodb+srv://root:root@cluster0.ev1okht.mongodb.net/micro'; // Replace with your MongoDB connection string
const client = new MongoClient(uri);

let database, urlsCollection;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
client.connect().then(() => {
  console.log('Connected to MongoDB');
  database = client.db('urlShortener');
  urlsCollection = database.collection('urls');
}).catch(err => console.error('MongoDB connection error:', err));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to create short URL
app.post('/api/shorturl', async (req, res) => {
    const { url } = req.body;

    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(url)) {
        return res.json({ error: 'invalid url' });
    }

    // Check if URL already exists in the database
    const existingUrl = await urlsCollection.findOne({ original_url: url });
    if (existingUrl) {
        return res.json({
            original_url: existingUrl.original_url,
            short_url: existingUrl.short_url
        });
    }

    // Create new short URL - get the next available short_url
    const lastEntry = await urlsCollection.findOne({}, { sort: { short_url: -1 } });
    const shortUrl = lastEntry ? lastEntry.short_url + 1 : 1;
    
    const newEntry = {
        original_url: url,
        short_url: shortUrl
    };

    await urlsCollection.insertOne(newEntry);

    res.json({
        original_url: url,
        short_url: shortUrl
    });
});

// Redirect endpoint for short URLs
app.get('/api/shorturl/:short_url', async (req, res) => {
    const shortUrl = req.params.short_url;

    const urlEntry = await urlsCollection.findOne({ short_url: shortUrl });
    
    if (urlEntry) {
        res.status(302).redirect(urlEntry.original_url);
    } else {
        return res.status(404).json({ error: 'Short URL not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 