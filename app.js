// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const fs = require('fs');
require('dotenv').config();

// Import routes
const indexRoutes = require('./routes/index');
const resumeRoutes = require('./routes/resume');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure required directories exist
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, 'public/img/thumbnails'),
    path.join(__dirname, 'public/img/templates'),
    path.join(__dirname, 'public/img/previews'),
    path.join(__dirname, 'public/img/icons')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

ensureDirectories();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Content Security Policy with less restrictive settings
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  );  
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/resume', resumeRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).render('error', {
    title: 'Error',
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});