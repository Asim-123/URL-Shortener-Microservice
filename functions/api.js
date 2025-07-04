const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://root:root@cluster0.ev1okht.mongodb.net/micro'; // Replace with your MongoDB connection string
const client = new MongoClient(uri);

// MongoDB will handle the data persistence

exports.handler = async (event, context) => {
  await client.connect();
  const database = client.db('urlShortener');
  const urlsCollection = database.collection('urls');

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Debug logging (commented out for production)
  // console.log('Event received:', {
  //   httpMethod: event.httpMethod,
  //   path: event.path,
  //   body: event.body,
  //   isBase64Encoded: event.isBase64Encoded,
  //   headers: event.headers
  // });

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
      // Handle base64 encoded body (common in Netlify)
      let body = event.body;
      if (event.isBase64Encoded) {
        body = Buffer.from(event.body, 'base64').toString('utf8');
      }
      
      // Check if body exists
      if (!body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Request body is required' })
        };
      }
      
      let url;
      
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(body);
        url = jsonData.url;
      } catch (jsonError) {
        // If JSON parsing fails, try form-encoded data
        try {
          const params = new URLSearchParams(body);
          url = params.get('url');
        } catch (formError) {
          console.error('Failed to parse both JSON and form data:', { jsonError, formError, body });
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid request format' })
          };
        }
      }
      
      // Check if url exists in the parsed data
      if (!url) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'URL is required' })
        };
      }
      
      // Validate URL format
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(url)) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ error: 'invalid url' })
        };
      }
      
      // Check if URL already exists in the database
      const existingUrl = await urlsCollection.findOne({ original_url: url });
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
      
      // Create new short URL - get the next available short_url
      const lastEntry = await urlsCollection.findOne({}, { sort: { short_url: -1 } });
      const shortUrl = lastEntry ? lastEntry.short_url + 1 : 1;
      
      const newEntry = {
        original_url: url,
        short_url: shortUrl
      };
      
      await urlsCollection.insertOne(newEntry);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          original_url: url,
          short_url: shortUrl
        })
      };
    } catch (error) {
      // console.error('Error in POST handler:', error);
      // console.error('Event body:', event.body);
      // console.error('Is base64 encoded:', event.isBase64Encoded);
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid request body',
          details: error.message 
        })
      };
    }
  }

  // Handle GET request (redirect)
  if (event.httpMethod === 'GET') {
    try {
      // Extract short_url from path and handle query parameters
      let path = event.path;
      // Handle both Netlify dev server and production paths
      if (path.includes('/.netlify/functions/api/shorturl/')) {
        path = path.replace('/.netlify/functions/api/shorturl/', '');
      } else if (path.includes('/api/shorturl/')) {
        path = path.replace('/api/shorturl/', '');
      }
      const shortUrl = parseInt(path.split('/')[0]); // Get first part after base path
  
      if (isNaN(shortUrl)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid short URL' })
        };
      }
  
      // Find URL entry in the database
      const urlEntry = await urlsCollection.findOne({ short_url: shortUrl });
  
      if (urlEntry) {
        // Check Accept header to determine response type
        const acceptHeader = event.headers['accept'] || '';
        if (acceptHeader.includes('application/json')) {
          // Return JSON for API/fetch requests
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              original_url: urlEntry.original_url,
              short_url: urlEntry.short_url
            })
          };
        } else {
          // Return 302 redirect for browser navigation (test requirement)
          return {
            statusCode: 302,
            headers: {
              ...headers,
              'Location': urlEntry.original_url
            },
            body: ''
          };
        }
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