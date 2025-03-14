const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Resume Builder - Create Professional Resumes' 
  });
});

// About page route
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About Resume Builder' 
  });
});

module.exports = router;