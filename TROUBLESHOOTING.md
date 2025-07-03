# Troubleshooting Guide

## Common Issues and Solutions

### 1. MongoDB Connection Issues

**Problem:** API returns 500 errors or "Server error"

**Solutions:**
1. **Check MongoDB Atlas Connection:**
   - Ensure your MongoDB Atlas cluster is running
   - Verify the connection string in Netlify environment variables
   - Make sure your IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for all IPs)

2. **Environment Variable Setup:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `MONGODB_URI` = your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/url-shortener?retryWrites=true&w=majority`

3. **Test MongoDB Connection:**
   ```bash
   # Install dependencies
   npm install
   
   # Run the test script
   node test-api.js
   ```

### 2. API Endpoints Not Working

**Problem:** 404 errors on API calls

**Solutions:**
1. **Check Netlify Function Logs:**
   - Go to Netlify Dashboard → Functions
   - Check the logs for the `server` function
   - Look for connection errors or other issues

2. **Verify Function Deployment:**
   - Ensure `netlify/functions/server.js` exists
   - Check that `netlify.toml` is properly configured
   - Redeploy if necessary

3. **Test Individual Endpoints:**
   ```bash
   # Test POST endpoint
   curl -X POST https://your-app.netlify.app/api/shorturl \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.google.com"}'
   
   # Test GET endpoint (after creating a short URL)
   curl -I https://your-app.netlify.app/api/shorturl/1
   ```

### 3. URL Validation Issues

**Problem:** Valid URLs are being rejected

**Solutions:**
1. **Check URL Format:**
   - URLs must include protocol (http:// or https://)
   - Example: `https://www.example.com` ✅
   - Example: `www.example.com` ❌

2. **Test URL Validation:**
   ```javascript
   const validUrl = require('valid-url');
   console.log(validUrl.isUri('https://www.google.com')); // true
   console.log(validUrl.isUri('invalid-url')); // false
   ```

### 4. Redirect Issues

**Problem:** Short URLs don't redirect properly

**Solutions:**
1. **Check Response Headers:**
   - Ensure 302 status code is returned
   - Verify Location header contains the original URL

2. **Test Redirection:**
   ```bash
   # Create a short URL first
   curl -X POST https://your-app.netlify.app/api/shorturl \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.google.com"}'
   
   # Test the redirect (don't follow redirects)
   curl -I https://your-app.netlify.app/api/shorturl/1
   ```

### 5. CORS Issues

**Problem:** Frontend can't access API

**Solutions:**
1. **Check CORS Headers:**
   - Verify `Access-Control-Allow-Origin: *` is present
   - Ensure preflight OPTIONS requests are handled

2. **Test CORS:**
   ```javascript
   fetch('https://your-app.netlify.app/api/shorturl', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ url: 'https://www.google.com' })
   })
   .then(response => response.json())
   .then(data => console.log(data));
   ```

## Debugging Steps

### Step 1: Check Environment Variables
1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Verify `MONGODB_URI` is set correctly

### Step 2: Check Function Logs
1. Go to Netlify Dashboard
2. Functions → server
3. Check recent invocations for errors

### Step 3: Test Locally
```bash
# Install dependencies
npm install

# Set environment variable
export MONGODB_URI="your_mongodb_connection_string"

# Test the API
node test-api.js
```

### Step 4: Manual API Testing
```bash
# Test 1: Create short URL
curl -X POST https://your-app.netlify.app/api/shorturl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'

# Test 2: Test invalid URL
curl -X POST https://your-app.netlify.app/api/shorturl \
  -H "Content-Type: application/json" \
  -d '{"url": "invalid-url"}'

# Test 3: Test redirection (after creating a short URL)
curl -I https://your-app.netlify.app/api/shorturl/1
```

## Expected Responses

### Successful URL Creation:
```json
{
  "original_url": "https://www.google.com",
  "short_url": 1
}
```

### Invalid URL:
```json
{
  "error": "invalid url"
}
```

### Redirect Response:
- Status: 302
- Headers: `Location: https://www.google.com`

## Common Error Messages

- **"Server error"**: Usually MongoDB connection issue
- **"Not found"**: Route not found, check URL path
- **"Invalid JSON"**: Request body is not valid JSON
- **"Invalid short URL"**: Short URL parameter is not a number

## Getting Help

If you're still having issues:

1. **Check the logs** in Netlify Function dashboard
2. **Run the test script** to identify specific failures
3. **Verify MongoDB connection** string and network access
4. **Test locally** to isolate deployment vs code issues

## Quick Fix Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Environment variable `MONGODB_URI` is set in Netlify
- [ ] IP whitelist includes 0.0.0.0/0 or your IP
- [ ] `netlify/functions/server.js` exists and is deployed
- [ ] `netlify.toml` is properly configured
- [ ] All dependencies are installed (`npm install`)
- [ ] Function logs show no errors 