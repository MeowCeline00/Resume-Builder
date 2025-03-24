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

// List all resumes - This will be the main dashboard
router.get('/', resumeController.getBuilderPage);

// Redirect /builder to the main resume page to prevent duplicate pages
router.get('/builder', (req, res) => {
  res.redirect('/resume');
});

// New resume form
router.get('/new', resumeController.getNewResumePage);

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
    if (!newTitle) {
      return res.status(400).json({ 
        success: false,
        error: 'New title is required'
      });
    }
    
    const updated = await Resume.rename(req.params.id, newTitle);
    res.json({
      success: true,
      resume: updated
    });
  } catch (error) {
    console.error('Error renaming resume:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Rename failed'
    });
  }
});

// Duplicate resume
router.post('/:id/duplicate', async (req, res) => {
  try {
    const copy = await Resume.duplicate(req.params.id);
    res.json({
      success: true,
      resume: copy
    });
  } catch (error) {
    console.error('Error duplicating resume:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Duplicate failed'
    });
  }
});

// Toggle lock status
router.post('/:id/lock', async (req, res) => {
  try {
    const { lock } = req.body;
    if (lock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Lock status is required'
      });
    }
    
    const updated = await Resume.toggleLock(req.params.id, !!lock);
    res.json({
      success: true,
      resume: updated
    });
  } catch (error) {
    console.error('Error toggling lock:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lock toggle failed'
    });
  }
});

module.exports = router;