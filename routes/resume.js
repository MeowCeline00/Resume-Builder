// routes/resume.js
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');

// Ensure thumbnail directories exist
const createDirsIfNotExist = () => {
  const dirs = [
    path.join(__dirname, '../public/img/thumbnails'),
    path.join(__dirname, '../public/img/templates'),
    path.join(__dirname, '../public/img/previews'),
    path.join(__dirname, '../public/img/icons')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

createDirsIfNotExist();

// List all resumes
router.get('/', resumeController.getAllResumes);

// New resume form
router.get('/new', resumeController.getNewResumePage);

// Builder page
router.get('/builder', resumeController.getBuilderPage);

// Create resume
router.post('/create', resumeController.createResume);

// Edit resume page
router.get('/edit/:id', resumeController.getEditPage);

// Update resume
router.post('/update/:id', resumeController.updateResume);

// Preview resume
router.get('/preview/:id', resumeController.previewResume);

// Download resume as PDF
router.get('/download/:id', resumeController.downloadResume);

// Delete resume
router.post('/delete/:id', resumeController.deleteResume);
router.delete('/:id', resumeController.deleteResume);

// Save preview as thumbnail
router.get('/save-preview/:id', resumeController.saveResumePreview);

// Rename resume
router.post('/:id/rename', async (req, res) => {
  try {
    const { newTitle } = req.body;
    const updated = await Resume.rename(req.params.id, newTitle);
    res.json(updated);
  } catch (error) {
    console.error('Error renaming resume:', error);
    res.status(500).send('Rename failed');
  }
});

// Duplicate resume
router.post('/:id/duplicate', async (req, res) => {
  try {
    const copy = await Resume.duplicate(req.params.id);
    res.json(copy);
  } catch (error) {
    console.error('Error duplicating resume:', error);
    res.status(500).send('Duplicate failed');
  }
});

// Toggle lock status
router.post('/:id/lock', async (req, res) => {
  try {
    const { lock } = req.body;
    const updated = await Resume.toggleLock(req.params.id, lock);
    res.json(updated);
  } catch (error) {
    console.error('Error toggling lock:', error);
    res.status(500).send('Lock toggle failed');
  }
});

module.exports = router;