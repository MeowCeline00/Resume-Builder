// routes/index.js
const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Home'
  });
});

// About page route - uncomment when about.ejs is available
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About'
  });
});

// Contact page route - uncomment when contact.ejs is available
router.get('/contact', (req, res) => {
  res.render('error', { 
    title: 'Contact',
    message: 'Contact page is under construction'
  });
});

module.exports = router;