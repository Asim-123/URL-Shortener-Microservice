const validUrl = require('valid-url');

// Simple in-memory storage
let urls = [];
let counter = 0;

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Extract path
  let path = event.path;
  if (path.startsWith('/.netlify/functions/simple-server')) {
    path = path.replace('/.netlify/functions/simple-server', '');
  }

  console.log('Request:', event.httpMethod, path);

  // POST /api/shorturl
  if (event.httpMethod === 'POST' && path === '/api/shorturl') {
    try {
      const body = JSON.parse(event.body);
      const { url } = body;

      console.log('Received URL:', url);

      // Check if URL is valid
      if (!validUrl.isUri(url)) {
        console.log('Invalid URL detected:', url);
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'invalid url' }),
        };
      }

      // Check if URL already exists
      const existing = urls.find(u => u.original_url === url);
      if (existing) {
        console.log('URL already exists:', existing);
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_url: existing.original_url,
            short_url: existing.short_url,
          }),
        };
      }

      // Create new short URL
      counter++;
      const newUrl = { original_url: url, short_url: counter };
      urls.push(newUrl);

      console.log('Created new URL:', newUrl);

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_url: url,
          short_url: counter,
        }),
      };
    } catch (error) {
      console.log('JSON parse error:', error);
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON' }),
      };
    }
  }

  // GET /api/shorturl/:short_url
  if (event.httpMethod === 'GET' && path.startsWith('/api/shorturl/')) {
    const shortUrlStr = path.split('/').pop();
    const shortUrl = parseInt(shortUrlStr);

    console.log('Looking for short URL:', shortUrl);

    if (isNaN(shortUrl)) {
      console.log('Invalid short URL number:', shortUrlStr);
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid short URL' }),
      };
    }

    const url = urls.find(u => u.short_url === shortUrl);
    console.log('Found URL:', url);

    if (!url) {
      console.log('URL not found for short URL:', shortUrl);
      return {
        statusCode: 404,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Short URL not found' }),
      };
    }

    console.log('Redirecting to:', url.original_url);
    return {
      statusCode: 302,
      headers: { 
        ...headers, 
        'Location': url.original_url,
        'Cache-Control': 'no-cache'
      },
      body: '',
    };
  }

  // GET /api/shorturl (get all URLs)
  if (event.httpMethod === 'GET' && path === '/api/shorturl') {
    console.log('Getting all URLs:', urls);
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(urls.sort((a, b) => a.short_url - b.short_url)),
    };
  }

  // 404 for unknown routes
  console.log('Route not found:', path);
  return {
    statusCode: 404,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not found' }),
  };
}; 