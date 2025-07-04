# URL Shortener Microservice

A full-stack JavaScript application that shortens URLs, built with Node.js, Express, and a modern frontend. This project is designed to pass all FreeCodeCamp URL Shortener Microservice test cases.

## Features

- ✅ POST a URL to `/api/shorturl` and get a JSON response with `original_url` and `short_url` properties
- ✅ Visit `/api/shorturl/<short_url>` to be redirected to the original URL
- ✅ Invalid URL validation with proper error response
- ✅ Modern, responsive frontend interface
- ✅ Copy to clipboard functionality
- ✅ Netlify deployment ready

## API Endpoints

### POST /api/shorturl
Creates a shortened URL.

**Request Body:**
```json
{
  "url": "https://www.example.com"
}
```

**Success Response:**
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

### GET /api/shorturl/:short_url
Redirects to the original URL.

**Example:** `/api/shorturl/1` redirects to the original URL with short_url = 1

## Local Development

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd URL-Shortener-Microservice
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Production Build

To start the production server:
```bash
npm start
```

## Deployment

### Netlify Deployment

This project is configured for easy deployment on Netlify:

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Netlify
3. Deploy automatically - no additional configuration needed!

The project includes:
- `netlify.toml` - Netlify configuration
- `functions/api.js` - Serverless function for API endpoints
- Proper redirects for API routes

### Environment Variables

No environment variables are required for basic functionality. The application uses in-memory storage for demonstration purposes.

## Project Structure

```
URL-Shortener-Microservice/
├── public/
│   ├── index.html      # Main frontend page
│   ├── style.css       # Styling
│   └── script.js       # Frontend JavaScript
├── functions/
│   └── api.js          # Netlify serverless function
├── server.js           # Express server (for local development)
├── package.json        # Dependencies and scripts
├── netlify.toml        # Netlify configuration
└── README.md           # This file
```

## Test Cases

This application passes all FreeCodeCamp URL Shortener Microservice test cases:

1. ✅ You can POST a URL to `/api/shorturl` and get a JSON response with `original_url` and `short_url` properties
2. ✅ When you visit `/api/shorturl/<short_url>`, you will be redirected to the original URL
3. ✅ If you pass an invalid URL that doesn't follow the valid `http://www.example.com` format, the JSON response will contain `{ error: 'invalid url' }`

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Deployment:** Netlify (Serverless Functions)
- **Styling:** Custom CSS with responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 