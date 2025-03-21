const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

// Routes for resumes
router.get('/', resumeController.getAllResumes);
router.get('/builder', resumeController.getBuilderPage);
router.get('/new', resumeController.getNewResumePage);
router.post('/create', resumeController.createResume);
router.get('/edit/:id', resumeController.getEditPage);
router.post('/update/:id', resumeController.updateResume);
router.post('/delete/:id', resumeController.deleteResume);
router.get('/preview/:id', resumeController.previewResume);
router.get('/download/:id', resumeController.downloadResume);

module.exports = router;
