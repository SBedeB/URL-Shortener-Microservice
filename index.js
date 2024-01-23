require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Middleware for logging requests
app.use((req, res, next) => {
  const method = req.method;
  const path = req.path;
  const ip = req.ip;

  // Include project URL in the log for POST requests
  const url = method === 'POST' ? `${process.env.PROJECT_URL}${path}` : path;

  console.log(`${method} ${url} - ${ip}`);
  next();
});

// Middleware for Serving Static Files
app.use('/public', express.static(`${process.cwd()}/public`));

// Use body-parser to Parse POST Requests
// Mount body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Placeholder for storing original URLs and corresponding short URLs
const urlStorage = {};

// Route to serve HTML file
app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// Route to handle POST requests for creating short URLs
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate the URL format
  const isValidUrl = /^(ftp|http|https):\/\/[^ "]+$/.test(originalUrl);

  if (!isValidUrl) {
    return res.json({ error: 'invalid url' });
  }

  // Generate a unique short URL (replace with your own implementation)
  const shortUrl = Object.keys(urlStorage).length + 1;

  // Store the original URL and corresponding short URL
  urlStorage[shortUrl] = originalUrl;

  // Respond with JSON containing original_url and short_url properties
  res.json({ original_url: originalUrl, short_url: shortUrl });
});

// Route to redirect to the original URL based on the short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlStorage[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'invalid short url' });
  }

  // Redirect to the original URL
  res.redirect(originalUrl);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
