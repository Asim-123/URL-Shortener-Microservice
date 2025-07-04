# URL Shortener Microservice

A full-stack JavaScript URL shortener microservice similar to FreeCodeCamp's example. Built with Node.js, Express, MongoDB, and deployed on Netlify.

## Features

- ✅ Shorten URLs with a simple API
- ✅ Redirect short URLs to original URLs
- ✅ Advanced URL validation (format + DNS lookup)
- ✅ Modern, responsive web interface
- ✅ MongoDB database for persistence
- ✅ Netlify deployment ready
- ✅ CORS enabled for cross-origin requests

## API Endpoints

### 1. Create Short URL
**POST** `/api/shorturl`

**Request Body:**
```json
{
  "url": "https://www.example.com"
}
```

**Response:**
```json
{
  "original_url": "https://www.example.com",
  "short_url": 1
}
```

**Error Response:**
```json
{
  "error": "invalid url"
}
```

**Validation Details:**
- URL format validation (must start with http:// or https://)
- DNS lookup validation (domain must exist and be reachable)
- Case-insensitive duplicate detection

### 2. Redirect to Original URL
**GET** `/api/shorturl/:short_url`

Redirects to the original URL (e.g., `/api/shorturl/1` redirects to the original URL with short_url = 1)

### 3. Get All URLs (for testing)
**GET** `/api/shorturl`

Returns all shortened URLs in the database.

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd url-shortener-microservice
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/url-shortener
   PORT=3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/shorturl

## Netlify Deployment

### Prerequisites
- Netlify account
- MongoDB Atlas (or other cloud MongoDB service)

### Deployment Steps

1. **Set up MongoDB Atlas:**
   - Create a free MongoDB Atlas account
   - Create a new cluster
   - Get your connection string

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build settings:
     - Build command: `npm install`
     - Publish directory: `public`
     - Functions directory: `netlify/functions`

3. **Configure Environment Variables:**
   In Netlify dashboard, go to Site settings > Environment variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```

4. **Deploy:**
   - Push your code to GitHub
   - Netlify will automatically deploy

### Netlify Configuration

The `netlify.toml` file is already configured to:
- Install dependencies
- Serve static files from `public` directory
- Route API requests to serverless functions
- Handle CORS and redirects

## Testing

### Manual Testing

1. **Test URL shortening:**
   ```bash
   curl -X POST https://your-app.netlify.app/api/shorturl \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.google.com"}'
   ```

2. **Test URL redirection:**
   Visit `https://your-app.netlify.app/api/shorturl/1` in your browser

3. **Test invalid URL:**
   ```bash
   curl -X POST https://your-app.netlify.app/api/shorturl \
     -H "Content-Type: application/json" \
     -d '{"url": "invalid-url"}'
   ```

### Automated Testing

To add automated tests, you can use tools like:
- Jest for unit testing
- Supertest for API testing
- Cypress for end-to-end testing

## Project Structure

```
url-shortener-microservice/
├── public/                 # Static files (frontend)
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── netlify/
│   └── functions/
│       └── server.js      # Netlify serverless function
├── server.js              # Local development server
├── package.json           # Dependencies and scripts
├── netlify.toml          # Netlify configuration
└── README.md             # This file
```

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Deployment:** Netlify (serverless functions)
- **URL Validation:** valid-url package
- **Styling:** Custom CSS with responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development.

## Support

If you encounter any issues:
1. Check the MongoDB connection
2. Verify environment variables are set correctly
3. Check Netlify function logs
4. Ensure all dependencies are installed

---

**Happy coding! 🚀** 