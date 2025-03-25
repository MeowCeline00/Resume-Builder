// controllers/resumeController.js
const Resume = require('../models/Resume');
const pdfGenerator = require('../utils/pdfGenerator');
const generateThumbnail = require('../utils/generateThumbnails');

/**
 * Process skills from form data into structured arrays
 */
function processSkills(skillsData) {
  if (!skillsData) return { technical: [], soft: [] };

  const result = { technical: [], soft: [] };

  // Process technical skills
  if (skillsData.technical) {
    if (Array.isArray(skillsData.technical)) {
      result.technical = skillsData.technical;
    } else if (typeof skillsData.technical === 'string') {
      result.technical = skillsData.technical.split(',')
        .map(skill => skill.trim())
        .filter(Boolean);
    }
  }

  // Process soft skills
  if (skillsData.soft) {
    if (Array.isArray(skillsData.soft)) {
      result.soft = skillsData.soft;
    } else if (typeof skillsData.soft === 'string') {
      result.soft = skillsData.soft.split(',')
        .map(skill => skill.trim())
        .filter(Boolean);
    }
  }

  return result;
}

/**
 * Safely parse JSON data
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
  getAllResumes: async (req, res) => {
    try {
      const resumes = await Resume.getAll() || [];
      const resumeList = resumes.map(resume => ({
        id: resume.id,
        name: resume.name || 'Unnamed Resume',
        templateName: resume.templateName || resume.template_name,
        updatedAt: new Date(resume.updatedAt || resume.updated_at).toDateString(),
        is_locked: resume.isLocked || resume.is_locked,
        thumbnail_url: resume.thumbnailUrl || resume.thumbnail_url
      }));

      res.render('resume-list', { title: 'Resumes', resumes: resumeList });
    } catch (error) {
      console.error('Error fetching resumes:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load resumes' });
    }
  },

  getBuilderPage: async (req, res) => {
    try {
      const resumes = await Resume.getAll() || [];
      
      // Map resumes to a safe format for the frontend to prevent undefined errors
      const formattedResumes = resumes.map(resume => ({
        id: resume.id,
        name: resume.name || 'Unnamed Resume',
        title: resume.title || resume.name || 'Unnamed Resume',
        updatedAt: resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 
                  (resume.updated_at ? new Date(resume.updated_at).toLocaleDateString() : new Date().toLocaleDateString()),
        is_locked: resume.isLocked !== undefined ? resume.isLocked : (resume.is_locked || false),
        thumbnail_url: resume.thumbnailUrl || resume.thumbnail_url || null
      }));
      
      res.render('builder', {
        title: 'Resume Builder',
        resumes: formattedResumes
      });
    } catch (error) {
      console.error('Error loading builder page:', error);
      res.status(500).render('error', { 
        title: 'Error', 
        message: 'Failed to load builder page: ' + error.message,
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  },

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

  createResume: async (req, res) => {
    try {
      const title = req.body.title || 'Untitled Resume';
      const resumeData = {
        title: title,
        personalInfo: req.body.personalInfo || {
          firstName: "", lastName: "", email: "", phone: "", jobTitle: ""
        },
        education: req.body.education || [{}],
        experience: req.body.experience || [{}],
        projects: req.body.projects || [{}],
        skills: processSkills(req.body.skills),
        templateName: req.body.templateName || 'modern'
      };

      const newResume = await Resume.create(resumeData);

      if (req.xhr || req.headers.accept.includes('application/json')) {
        res.json({ success: true, id: newResume.id });
      } else {
        res.redirect(`/resume/edit/${newResume.id}`);
      }
    } catch (error) {
      console.error('Error creating resume:', error);
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

  getEditPage: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).render('error', { title: 'Not Found', message: 'Resume not found' });
      }

      // Check if resume is locked and pass that info to the view
      const isLocked = resume.is_locked || false;

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
          name: resume.name,
          is_locked: isLocked
        }
      });
    } catch (error) {
      console.error('Error loading edit page:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load edit page' });
    }
  },

  updateResume: async (req, res) => {
    try {
      console.log("Updating resume...", req.params.id);

      // Check if resume exists and is locked
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).render('error', { title: 'Not Found', message: 'Resume not found' });
      }

      // Check if resume is locked
      if (resume.is_locked) {
        return res.status(403).render('error', { 
          title: 'Locked', 
          message: 'This resume is locked and cannot be modified. Unlock it first to make changes.' 
        });
      }

      const resumeData = {
        personalInfo: req.body.personalInfo || {},
        education: req.body.education || [{}],
        experience: req.body.experience || [{}],
        projects: req.body.projects || [{}],
        skills: processSkills(req.body.skills),
        templateName: req.body.templateName || 'modern'
      };

      console.log("Update data:", JSON.stringify(resumeData, null, 2));

      const updatedResume = await Resume.update(req.params.id, resumeData);

      try {
        const previewUrl = `${req.protocol}://${req.get('host')}/resume/preview/${updatedResume.id}`;
        await generateThumbnail(updatedResume.id, previewUrl);
      } catch (thumbnailError) {
        console.error('Error generating thumbnail:', thumbnailError);
      }

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

  deleteResume: async (req, res) => {
    try {
      // Check if resume exists and is locked
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      
      // Check if resume is locked before deletion
      if (resume.is_locked) {
        if (req.xhr || req.headers.accept.includes('application/json')) {
          return res.status(403).json({ 
            success: false, 
            error: 'This resume is locked and cannot be deleted. Unlock it first to delete.' 
          });
        } else {
          return res.status(403).render('error', { 
            title: 'Locked', 
            message: 'This resume is locked and cannot be deleted. Unlock it first to delete.' 
          });
        }
      }

      await Resume.delete(req.params.id);

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
  
  toggleLockResume: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).render('error', { title: 'Not Found', message: 'Resume not found' });
      }
      
      const newLockStatus = !resume.is_locked;
      const updatedResume = await Resume.toggleLock(req.params.id, newLockStatus);
      
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.json({ 
          success: true, 
          is_locked: updatedResume.is_locked,
          message: updatedResume.is_locked ? 'Resume locked successfully' : 'Resume unlocked successfully'
        });
      }
      
      res.redirect('/resume');
    } catch (error) {
      console.error('Error toggling lock status:', error);
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.status(500).render('error', { title: 'Error', message: 'Failed to toggle lock status' });
    }
  },

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
        name: resume.name,
        is_locked: resume.is_locked // Make sure lock status is available in preview
      };

      res.render('preview-resume', { title: 'Preview Resume', resume: resumeData });
    } catch (error) {
      console.error('Error loading preview page:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load preview' });
    }
  },

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

  saveResumePreview: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      if (!resume) {
        return res.status(404).render('error', { title: 'Not Found', message: 'Resume not found' });
      }

      // Check if resume is locked
      if (resume.is_locked) {
        return res.status(403).render('error', { 
          title: 'Locked', 
          message: 'This resume is locked and cannot be modified. Unlock it first to make changes.' 
        });
      }

      const previewUrl = `${req.protocol}://${req.get('host')}/resume/preview/${resume.id}`;
      try {
        await generateThumbnail(resume.id, previewUrl);
      } catch (thumbnailError) {
        console.error('Error generating thumbnail:', thumbnailError);
        // Continue even if thumbnail generation fails
      }

      res.redirect('/resume');
    } catch (error) {
      console.error('Error saving resume preview:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to save preview' });
    }
  }
};

module.exports = resumeController;