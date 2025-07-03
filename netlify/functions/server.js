const mongoose = require('mongoose');
const validUrl = require('valid-url');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener';

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

let Url;
let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      Url = mongoose.model('Url', urlSchema);
      isConnected = true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    await connectDB();

    const path = event.path.replace('/.netlify/functions/server', '');

    // POST /api/shorturl
    if (event.httpMethod === 'POST' && path === '/api/shorturl') {
      const body = JSON.parse(event.body);
      const { url } = body;

      // Check if URL is valid
      if (!validUrl.isUri(url)) {
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'invalid url' }),
        };
      }

      // Check if URL already exists
      const existingUrl = await Url.findOne({ original_url: url });
      if (existingUrl) {
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_url: existingUrl.original_url,
            short_url: existingUrl.short_url,
          }),
        };
      }

      // Get the next short URL number
      const count = await Url.countDocuments();
      const shortUrl = count + 1;

      // Create new URL document
      const newUrl = new Url({
        original_url: url,
        short_url: shortUrl,
      });

      await newUrl.save();

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_url: url,
          short_url: shortUrl,
        }),
      };
    }

    // GET /api/shorturl/:short_url
    if (event.httpMethod === 'GET' && path.startsWith('/api/shorturl/')) {
      const shortUrl = parseInt(path.split('/').pop());

      if (isNaN(shortUrl)) {
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid short URL' }),
        };
      }

      const url = await Url.findOne({ short_url: shortUrl });

      if (!url) {
        return {
          statusCode: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Short URL not found' }),
        };
      }

      return {
        statusCode: 302,
        headers: { ...headers, Location: url.original_url },
        body: '',
      };
    }

    // GET /api/shorturl (get all URLs)
    if (event.httpMethod === 'GET' && path === '/api/shorturl') {
      const urls = await Url.find().sort({ short_url: 1 });
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(urls),
      };
    }

    // 404 for unknown routes
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('Server error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
}; 