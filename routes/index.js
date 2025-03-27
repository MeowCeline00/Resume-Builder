// routes/index.js
const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Home'
  });
});

// About page route
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About'
  });
});


module.exports = router;