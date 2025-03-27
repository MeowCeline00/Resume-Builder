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

// Helper function to process skills data
const processSkills = (skills) => {
  if (!skills) return [];
  
  // If skills is already an array, return it
  if (Array.isArray(skills)) return skills;
  
  // If skills is a string, split by commas and trim each skill
  if (typeof skills === 'string') {
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill);
  }
  
  // If skills is an object with values property (from form submission)
  if (skills.values && Array.isArray(skills.values)) {
    return skills.values;
  }
  
  return [];
};

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

// Save resume data without preview generation or redirect to preview
router.post('/save/:id', async (req, res) => {
  try {
    const resumeData = {
      personalInfo: req.body.personalInfo || {},
      education: req.body.education || [{}],
      experience: req.body.experience || [{}],
      projects: req.body.projects || [{}],
      skills: processSkills(req.body.skills),
      templateName: req.body.templateName || 'modern'
    };
    
    await Resume.update(req.params.id, resumeData);
    res.redirect('/resume');
  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to save resume: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

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
    
    // Check if the request is an AJAX/JSON request
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.json({
        success: true,
        resume: copy
      });
    }
    
    // For regular form submissions, redirect to the main resume page
    res.redirect('/resume');
  } catch (error) {
    console.error('Error duplicating resume:', error);
    
    // Handle error for AJAX/JSON requests
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Duplicate failed'
      });
    }
    
    // Handle error for regular form submissions
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to duplicate resume: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error : {}
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