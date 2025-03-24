// routes/resume.js
const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const path = require('path');
const puppeteer = require('puppeteer');

// GET all resumes

router.get('/', async (req, res) => {
    try {
      const resumes = await Resume.getAll();
      res.render('builder', {
        title: 'Resume Dashboard',
        resumes
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  

// POST create new resume
router.post('/create', async (req, res) => {
  const { title } = req.body;
  try {
    const newResume = await Resume.create({ title });

    // Generate thumbnail using Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000/resume/preview/${newResume.id}`, {
      waitUntil: 'networkidle0'
    });

    const screenshotPath = path.join(__dirname, '../public/img/thumbnails', `${newResume.id}.png`);
    await page.setViewport({ width: 1200, height: 1600 });
    await page.screenshot({ path: screenshotPath });
    await browser.close();

    res.redirect(`/resume/edit/${newResume.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating resume');
  }
});

// GET resume by ID (for edit page)
router.get('/edit/:id', async (req, res) => {
  try {
    const resume = await Resume.getById(req.params.id);
    res.render('edit-resume', { resumeData: resume });
  } catch (err) {
    console.error(err);
    res.status(500).send('Resume not found');
  }
});

// POST rename resume
router.post('/:id/rename', async (req, res) => {
  const { newTitle } = req.body;
  try {
    const updated = await Resume.rename(req.params.id, newTitle);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Rename failed');
  }
});

// POST duplicate resume
router.post('/:id/duplicate', async (req, res) => {
  try {
    const copy = await Resume.duplicate(req.params.id);
    res.json(copy);
  } catch (err) {
    console.error(err);
    res.status(500).send('Duplicate failed');
  }
});

// POST toggle lock
router.post('/:id/lock', async (req, res) => {
  const { lock } = req.body;
  try {
    const updated = await Resume.toggleLock(req.params.id, lock);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Lock toggle failed');
  }
});

// DELETE resume
router.delete('/:id', async (req, res) => {
  try {
    const resume = await Resume.getById(req.params.id);
    if (resume.is_locked) {
      return res.status(403).send('Resume is locked and cannot be deleted.');
    }

    const deleted = await Resume.delete(req.params.id);
    res.json(deleted);
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete failed');
  }
});

module.exports = router;
