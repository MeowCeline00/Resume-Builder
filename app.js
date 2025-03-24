// app.js
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
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com https://cdn.scite.ai; style-src 'self' https://fonts.googleapis.com; img-src 'self' data:; script-src 'self' 'unsafe-inline'"
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

// Puppeteer thumbnail generation endpoint
const puppeteer = require('puppeteer');
const fs = require('fs');
const Resume = require('./models/Resume');

app.get('/resume/save-preview/:id', async (req, res) => {
  const resumeId = req.params.id;
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1400 });

    const url = `http://localhost:${PORT}/resume/preview/${resumeId}`;
    await page.goto(url, { waitUntil: 'networkidle0' });

    const screenshotPath = `public/img/previews/${resumeId}.png`;
    await page.screenshot({ path: screenshotPath });
    await browser.close();

    // Update the resume with the thumbnail URL
    const updated = await Resume.update(resumeId, { thumbnail: `/img/previews/${resumeId}.png` });
    res.redirect('/resume');
  } catch (err) {
    console.error('Error generating thumbnail:', err);
    res.status(500).send('Error generating preview');
  }
});