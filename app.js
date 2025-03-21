const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
require('dotenv').config();

// Import routes
const indexRoutes = require('./routes/index');
const resumeRoutes = require('./routes/resume');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com;"
  );
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/resume', resumeRoutes);


// Error handler (modify in app.js)
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
  console.log(`Server running on http://localhost:${PORT}`);
});
