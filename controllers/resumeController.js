// controllers/resumeController.js
const Resume = require('../models/Resume');
const pdfGenerator = require('../utils/pdfGenerator');
const generateThumbnail = require('../utils/generateThumbnails');

/**
 * Safely parse JSON data, returning an empty object if parsing fails
 * @param {string|object} data - The data to parse
 * @returns {object} - Parsed JSON or empty object if parsing fails
 */
function safeParseJSON(data) {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return {};
  }
}

const resumeController = {
  /**
   * Get all resumes and render the resume list page
   */
  getAllResumes: async (req, res) => {
    try {
      const resumes = await Resume.getAll() || [];
      const resumeList = resumes.map(resume => ({
        id: resume.id,
        name: safeParseJSON(resume.personal_info).name || resume.name || 'Unnamed Resume',
        templateName: resume.template_name,
        updatedAt: new Date(resume.updated_at).toDateString(),
        is_locked: resume.is_locked,
        thumbnail_url: resume.thumbnail_url
      }));

      res.render('resume-list', { title: 'Resumes', resumes: resumeList });
    } catch (error) {
      console.error('Error fetching resumes:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load resumes' });
    }
  },

  /**
   * Render the builder page with available resumes
   */
  getBuilderPage: async (req, res) => {
    try {
      const resumes = await Resume.getAll() || [];
      res.render('builder', {
        title: 'Resume Builder',
        resumes: resumes.map(resume => ({
          id: resume.id,
          name: resume.name || safeParseJSON(resume.personal_info).name || 'Unnamed Resume',
          updatedAt: new Date(resume.updated_at).toLocaleDateString(),
          is_locked: resume.is_locked,
          thumbnail_url: resume.thumbnail_url
        }))
      });
    } catch (error) {
      console.error('Error loading builder page:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load builder page' });
    }
  },

  /**
   * Render the page for creating a new resume
   */
  getNewResumePage: (req, res) => {
    res.render('new-resume', {
      title: 'Create New Resume',
      resumeData: {
        personalInfo: {},
        education: [{}],
        experience: [{}],
        projects: [{}],
        skills: { technical: [], soft: [] }
      }
    });
  },

  /**
   * Create a new resume from submitted data
   */
  createResume: async (req, res) => {
    try {
      // Extract the title from the request body
      const title = req.body.title || 'Untitled Resume';
      
      const resumeData = {
        title: title, 
        personalInfo: req.body.personalInfo || {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          jobTitle: ""
        },
        education: req.body.education || [{}],
        experience: req.body.experience || [{}],
        projects: req.body.projects || [{}],
        skills: req.body.skills || { technical: [], soft: [] },
        templateName: req.body.templateName || 'modern'
      };
      
      const newResume = await Resume.create(resumeData);
      
      // Respond with JSON for AJAX requests or redirect for form submissions
      if (req.xhr || req.headers.accept.includes('application/json')) {
        res.json({ success: true, id: newResume.id });
      } else {
        res.redirect(`/resume/edit/${newResume.id}`);
      }
    } catch (error) {
      console.error('Error creating resume:', error);
      
      // Handle errors for both AJAX and form submissions
      if (req.xhr || req.headers.accept.includes('application/json')) {
        res.status(500).json({ success: false, error: error.message });
      } else {
        res.status(500).render('error', { 
          title: 'Error', 
          message: 'Failed to create resume',
          error: process.env.NODE_ENV === 'development' ? error : {}
        });
      }
    }
  },

  /**
   * Render the edit page for a specific resume
   */
  getEditPage: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).render('error', { title: 'Not Found', message: 'Resume not found' });
      }
      
      res.render('edit-resume', {
        title: 'Edit Resume',
        resumeData: {
          id: resume.id,
          personalInfo: safeParseJSON(resume.personal_info),
          education: safeParseJSON(resume.education),
          experience: safeParseJSON(resume.experience),
          projects: safeParseJSON(resume.projects || '[]'),
          skills: safeParseJSON(resume.skills),
          templateName: resume.template_name,
          name: resume.name
        }
      });
    } catch (error) {
      console.error('Error loading edit page:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load edit page' });
    }
  },

  /**
   * Update an existing resume with submitted data
   */
  updateResume: async (req, res) => {
    try {
      console.log("Updating resume...", req.params.id);
      
      const resumeData = {
        personalInfo: req.body.personalInfo || {},
        education: req.body.education || [{}],
        experience: req.body.experience || [{}],
        projects: req.body.projects || [{}],
        skills: req.body.skills || { technical: [], soft: [] },
        templateName: req.body.templateName || 'modern'
      };
      
      // Log the data being updated
      console.log("Update data:", JSON.stringify(resumeData, null, 2));
      
      const updatedResume = await Resume.update(req.params.id, resumeData);
  
      // Generate the thumbnail
      try {
        const previewUrl = `${req.protocol}://${req.get('host')}/resume/preview/${updatedResume.id}`;
        await generateThumbnail(updatedResume.id, previewUrl);
      } catch (thumbnailError) {
        console.error('Error generating thumbnail:', thumbnailError);
        // Continue even if thumbnail generation fails
      }
  
      // Redirect to preview page
      res.redirect(`/resume/preview/${updatedResume.id}`);
    } catch (error) {
      console.error('Error updating resume:', error);
      res.status(500).render('error', { 
        title: 'Error', 
        message: 'Failed to update resume: ' + error.message,
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  },

  /**
   * Delete a resume by ID
   */
  deleteResume: async (req, res) => {
    try {
      await Resume.delete(req.params.id);
      
      // Check if this is an AJAX request
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.json({ success: true });
      }
      
      res.redirect('/resume');
    } catch (error) {
      console.error('Error deleting resume:', error);
      
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.status(500).render('error', { title: 'Error', message: 'Failed to delete resume' });
    }
  },

  /**
   * Preview a resume by ID
   */
  previewResume: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).render('error', { title: 'Not Found', message: 'Resume not found' });
      }
  
      const resumeData = {
        id: resume.id,
        personalInfo: safeParseJSON(resume.personal_info),
        education: safeParseJSON(resume.education),
        experience: safeParseJSON(resume.experience),
        projects: safeParseJSON(resume.projects || '[]'),
        skills: safeParseJSON(resume.skills),
        templateName: resume.template_name,
        name: resume.name
      };
  
      // ✅ Convert string to array for safe EJS iteration
      if (typeof resumeData.skills.technical === 'string') {
        resumeData.skills.technical = resumeData.skills.technical.split(',').map(s => s.trim());
      }
      if (typeof resumeData.skills.soft === 'string') {
        resumeData.skills.soft = resumeData.skills.soft.split(',').map(s => s.trim());
      }
  
      res.render('preview-resume', { title: 'Preview Resume', resume: resumeData });
    } catch (error) {
      console.error('Error loading preview page:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load preview' });
    }
  },
  

  /**
   * Download a resume as PDF
   */
  downloadResume: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).render('error', { title: 'Not Found', message: 'Resume not found' });
      }
      
      const resumeData = {
        id: resume.id,
        personalInfo: safeParseJSON(resume.personal_info),
        education: safeParseJSON(resume.education),
        experience: safeParseJSON(resume.experience),
        projects: safeParseJSON(resume.projects || '[]'),
        skills: safeParseJSON(resume.skills),
        templateName: resume.template_name,
        name: resume.name
      };
      
      const pdfBuffer = await pdfGenerator.generatePDF(resumeData);
      
      const fileName = resumeData.personalInfo.firstName 
        ? `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName || 'resume'}.pdf`
        : `${resumeData.name || 'resume'}.pdf`;
        
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error downloading resume:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to download PDF' });
    }
  },

  /**
   * Generate and save a thumbnail of the resume preview
   */
  saveResumePreview: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).render('error', { title: 'Not Found', message: 'Resume not found' });
      }
  
      const previewUrl = `${req.protocol}://${req.get('host')}/resume/preview/${resume.id}`;
      await generateThumbnail(resume.id, previewUrl);
  
      res.redirect('/resume');
    } catch (error) {
      console.error('Error saving resume preview:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to save preview' });
    }
  }  
};

module.exports = resumeController;