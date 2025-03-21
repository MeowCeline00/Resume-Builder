const Resume = require('../models/Resume');
const pdfGenerator = require('../utils/pdfGenerator');

const resumeController = {
  // Render the resume builder page
  getBuilderPage: (req, res) => {
    res.render('builder', {
      title: 'Build Your Resume',
      edit: false,
      resumeData: {
        personalInfo: {},
        education: [{}],
        experience: [{}],
        skills: {
          technical: [],
          soft: []
        }
      }
    });
  },

  // Create a new resume
  createResume: async (req, res) => {
    try {
      const resumeData = {
        personalInfo: req.body.personalInfo,
        education: req.body.education || [{}],
        experience: req.body.experience || [{}],
        skills: req.body.skills || { technical: [], soft: [] },
        templateName: req.body.templateName || 'modern'
      };

      const newResume = await Resume.create(resumeData);
      res.redirect(`/resume/preview/${newResume.id}`);
    } catch (error) {
      console.error('Error creating resume:', error);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to create resume' 
      });
    }
  },

  // Preview a resume
  previewResume: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      
      if (!resume) {
        return res.status(404).render('error', { 
          title: 'Not Found',
          message: 'Resume not found' 
        });
      }

      // Parse JSON strings into objects if needed
      const resumeData = {
        id: resume.id,
        personalInfo: typeof resume.personal_info === 'string' ? JSON.parse(resume.personal_info) : resume.personal_info,
        education: typeof resume.education === 'string' ? JSON.parse(resume.education) : resume.education,
        experience: typeof resume.experience === 'string' ? JSON.parse(resume.experience) : resume.experience,
        skills: typeof resume.skills === 'string' ? JSON.parse(resume.skills) : resume.skills,
        templateName: resume.template_name
      };

      res.render(`templates/${resumeData.templateName}`, {
        title: 'Resume Preview',
        resume: resumeData
      });
    } catch (error) {
      console.error('Error previewing resume:', error);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to load resume preview' 
      });
    }
  },

  // Get the PDF-like editor page
  getEditPreviewPage: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      
      if (!resume) {
        return res.status(404).render('error', { 
          title: 'Not Found',
          message: 'Resume not found' 
        });
      }

      // Parse JSON strings into objects if needed
      const resumeData = {
        id: resume.id,
        personalInfo: typeof resume.personal_info === 'string' ? JSON.parse(resume.personal_info) : resume.personal_info,
        education: typeof resume.education === 'string' ? JSON.parse(resume.education) : resume.education,
        experience: typeof resume.experience === 'string' ? JSON.parse(resume.experience) : resume.experience,
        skills: typeof resume.skills === 'string' ? JSON.parse(resume.skills) : resume.skills,
        templateName: resume.template_name
      };

      res.render('edit-preview', {
        title: 'Edit PDF Preview',
        resume: resumeData
      });
    } catch (error) {
      console.error('Error loading edit preview page:', error);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to load edit preview page' 
      });
    }
  },

  // Get the edit page for a resume
  getEditPage: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      
      if (!resume) {
        return res.status(404).render('error', { 
          title: 'Not Found',
          message: 'Resume not found' 
        });
      }

      // Parse JSON strings into objects if needed
      const resumeData = {
        id: resume.id,
        personalInfo: typeof resume.personal_info === 'string' ? JSON.parse(resume.personal_info) : resume.personal_info,
        education: typeof resume.education === 'string' ? JSON.parse(resume.education) : resume.education,
        experience: typeof resume.experience === 'string' ? JSON.parse(resume.experience) : resume.experience,
        skills: typeof resume.skills === 'string' ? JSON.parse(resume.skills) : resume.skills,
        templateName: resume.template_name
      };

      res.render('builder', {
        title: 'Edit Your Resume',
        edit: true,
        resumeData
      });
    } catch (error) {
      console.error('Error loading edit page:', error);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to load edit page' 
      });
    }
  },

  // Update a resume
  updateResume: async (req, res) => {
    try {
      const resumeData = {
        personalInfo: req.body.personalInfo,
        education: req.body.education || [{}],
        experience: req.body.experience || [{}],
        skills: req.body.skills || { technical: [], soft: [] },
        templateName: req.body.templateName || 'modern'
      };

      const updatedResume = await Resume.update(req.params.id, resumeData);
      res.redirect(`/resume/preview/${updatedResume.id}`);
    } catch (error) {
      console.error('Error updating resume:', error);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to update resume' 
      });
    }
  },

  // Delete a resume
  deleteResume: async (req, res) => {
    try {
      await Resume.delete(req.params.id);
      res.redirect('/resume/list');
    } catch (error) {
      console.error('Error deleting resume:', error);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to delete resume' 
      });
    }
  },

  // Download resume as PDF
  downloadResume: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      
      if (!resume) {
        return res.status(404).render('error', { 
          title: 'Not Found',
          message: 'Resume not found' 
        });
      }

      // Parse JSON strings into objects if needed
      const resumeData = {
        id: resume.id,
        personalInfo: typeof resume.personal_info === 'string' ? JSON.parse(resume.personal_info) : resume.personal_info,
        education: typeof resume.education === 'string' ? JSON.parse(resume.education) : resume.education,
        experience: typeof resume.experience === 'string' ? JSON.parse(resume.experience) : resume.experience,
        skills: typeof resume.skills === 'string' ? JSON.parse(resume.skills) : resume.skills,
        templateName: resume.template_name
      };

      // Generate PDF using the template
      const pdfBuffer = await pdfGenerator.generatePDF(resumeData);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${resumeData.personalInfo.name.replace(/\s+/g, '_')}_resume.pdf`);
      
      // Send the PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error downloading resume:', error);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to download resume' 
      });
    }
  },

  // Get all resumes
  getAllResumes: async (req, res) => {
    try {
      const resumes = await Resume.getAll();
      
      // Transform data for display
      const resumeList = resumes.map(resume => ({
        id: resume.id,
        name: typeof resume.personal_info === 'string' 
          ? JSON.parse(resume.personal_info).name 
          : resume.personal_info.name,
        templateName: resume.template_name,
        createdAt: resume.created_at
      }));

      res.render('resume-list', {
        title: 'My Resumes',
        resumes: resumeList
      });
    } catch (error) {
      console.error('Error fetching resumes:', error);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to load resumes' 
      });
    }
  }
};

module.exports = resumeController; 