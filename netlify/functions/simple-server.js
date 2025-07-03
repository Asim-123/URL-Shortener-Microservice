const validUrl = require('valid-url');

// Simple in-memory storage
let urls = [];
let counter = 0;

// Helper function to parse request body
function parseBody(event) {
  const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
  
  if (!event.body || event.body.trim() === '') {
    return null;
  }

  // Handle JSON
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(event.body);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  // Handle form data
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(event.body);
    return { url: params.get('url') };
  }

  // Handle multipart form data
  if (contentType.includes('multipart/form-data')) {
    // For multipart, we'll try to extract the URL from the body
    // This is a simplified approach - in production you might want a proper multipart parser
    const urlMatch = event.body.match(/name="url"\s*\r?\n\r?\n([^\r\n]+)/);
    if (urlMatch) {
      return { url: urlMatch[1] };
    }
  }

  // Default: try to parse as JSON
  try {
    return JSON.parse(event.body);
  } catch (error) {
    throw new Error(`Unable to parse request body. Expected JSON or form data.`);
  }
}

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
  console.log('Headers:', event.headers);
  console.log('Body:', event.body);

  // POST /api/shorturl
  if (event.httpMethod === 'POST' && path === '/api/shorturl') {
    try {
      // Check if body exists and is not empty
      if (!event.body || event.body.trim() === '') {
        console.log('Empty body received');
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Request body is required' }),
        };
      }

      let body;
      try {
        body = parseBody(event);
      } catch (parseError) {
        console.log('Parse error:', parseError.message);
        console.log('Raw body:', event.body);
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Invalid request format',
            details: parseError.message,
            received: event.body.substring(0, 100) + '...'
          }),
        };
      }

      const { url } = body;

      // Check if url property exists
      if (!url) {
        console.log('No URL provided in request body');
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'URL is required in request body' }),
        };
      }

      console.log('Received URL:', url);

      // Check if URL is valid (custom validation to preserve case)
      const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      if (!urlPattern.test(url)) {
        console.log('Invalid URL detected:', url);
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'invalid url' }),
        };
      }

      // Check if URL already exists (case-insensitive comparison)
      const existing = urls.find(u => u.original_url.toLowerCase() === url.toLowerCase());
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
      console.log('Unexpected error:', error);
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Server error',
          details: error.message
        }),
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
        'Cache-Control': 'no-cache',
        'X-Original-URL': url.original_url
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