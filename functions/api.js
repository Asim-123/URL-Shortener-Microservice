// In-memory storage (in production, use a database)
let urlDatabase = [];
let urlCounter = 1;

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Handle POST request (create short URL)
  if (event.httpMethod === 'POST') {
    try {
      const { url } = JSON.parse(event.body);
      
      // Validate URL format
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(url)) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ error: 'invalid url' })
        };
      }
      
      // Check if URL already exists
      const existingUrl = urlDatabase.find(entry => entry.original_url === url);
      if (existingUrl) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            original_url: existingUrl.original_url,
            short_url: existingUrl.short_url
          })
        };
      }
      
      // Create new short URL
      const shortUrl = urlCounter;
      const newEntry = {
        original_url: url,
        short_url: shortUrl
      };
      
      urlDatabase.push(newEntry);
      urlCounter++;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          original_url: url,
          short_url: shortUrl
        })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }
  }

  // Handle GET request (redirect)
  if (event.httpMethod === 'GET') {
    try {
      // Extract short_url from path
      const pathParts = event.path.split('/');
      const shortUrl = parseInt(pathParts[pathParts.length - 1]);
      
      if (isNaN(shortUrl)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid short URL' })
        };
      }
      
      // Find the URL entry
      const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
      
      if (urlEntry) {
        return {
          statusCode: 302,
          headers: {
            ...headers,
            'Location': urlEntry.original_url
          },
          body: ''
        };
      } else {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Short URL not found' })
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
}; 