const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeControllers');

// Resume builder form page
router.get('/builder', resumeController.getBuilderPage);

// Submit resume data
router.post('/create', resumeController.createResume);

// Display resume preview
router.get('/preview/:id', resumeController.previewResume);

// PDF-like editor page
router.get('/edit-preview/:id', resumeController.getEditPreviewPage);

// Edit resume
router.get('/edit/:id', resumeController.getEditPage);
router.put('/update/:id', resumeController.updateResume);

// Delete resume
router.delete('/delete/:id', resumeController.deleteResume);

// Download resume as PDF
router.get('/download/:id', resumeController.downloadResume);

// List all saved resumes
router.get('/list', resumeController.getAllResumes);

module.exports = router;