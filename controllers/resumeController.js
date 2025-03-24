const Resume = require('../models/Resume');
const pdfGenerator = require('../utils/pdfGenerator');
const generateThumbnail = require('../utils/generateThumbnails');

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
        name: safeParseJSON(resume.personal_info).name || 'Unnamed Resume',
        templateName: resume.template_name,
        updatedAt: new Date(resume.updated_at).toDateString()
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
      res.render('builder', {
        title: 'Resume Builder',
        resumes: resumes.map(resume => ({
          id: resume.id,
          name: safeParseJSON(resume.personal_info).name || 'Unnamed Resume',
          updatedAt: new Date(resume.updated_at).toLocaleDateString()
        }))
      });
    } catch (error) {
      console.error('Error loading builder page:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load builder page' });
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
      const resumeData = {
        personalInfo: req.body.personalInfo || {},
        education: req.body.education || [{}],
        experience: req.body.experience || [{}],
        projects: req.body.projects || [{}],
        skills: req.body.skills || { technical: [], soft: [] },
        templateName: req.body.templateName || 'modern'
      };
      const newResume = await Resume.create(resumeData);
      res.redirect(`/resume/edit/${newResume.id}`);
    } catch (error) {
      console.error('Error creating resume:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to create resume' });
    }
  },

  getEditPage: async (req, res) => {
    try {
      const resume = await Resume.getById(req.params.id);
      res.render('edit-resume', {
        title: 'Edit Resume',
        resumeData: {
          id: resume.id,
          personalInfo: safeParseJSON(resume.personal_info),
          education: safeParseJSON(resume.education),
          experience: safeParseJSON(resume.experience),
          projects: safeParseJSON(resume.projects || []),
          skills: safeParseJSON(resume.skills),
          templateName: resume.template_name
        }
      });
    } catch (error) {
      console.error('Error loading edit page:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to load edit page' });
    }
  },

  updateResume: async (req, res) => {
    try {
      const resumeData = {
        personalInfo: req.body.personalInfo || {},
        education: req.body.education || [{}],
        experience: req.body.experience || [{}],
        projects: req.body.projects || [{}],
        skills: req.body.skills || { technical: [], soft: [] },
        templateName: req.body.templateName || 'modern'
      };
      const updatedResume = await Resume.update(req.params.id, resumeData);

      const previewUrl = `${req.protocol}://${req.get('host')}/resume/preview/${updatedResume.id}`;
      await generateThumbnail(updatedResume.id, previewUrl);

      res.redirect(`/resume/preview/${updatedResume.id}`);
    } catch (error) {
      console.error('Error updating resume:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to update resume' });
    }
  },

  deleteResume: async (req, res) => {
    try {
      await Resume.delete(req.params.id);
      res.redirect('/resume');
    } catch (error) {
      console.error('Error deleting resume:', error);
      res.status(500).render('error', { title: 'Error', message: 'Failed to delete resume' });
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
        projects: safeParseJSON(resume.projects || []),
        skills: safeParseJSON(resume.skills),
        templateName: resume.template_name
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
      const resumeData = {
        id: resume.id,
        personalInfo: safeParseJSON(resume.personal_info),
        education: safeParseJSON(resume.education),
        experience: safeParseJSON(resume.experience),
        projects: safeParseJSON(resume.projects || []),
        skills: safeParseJSON(resume.skills),
        templateName: resume.template_name
      };
      const pdfBuffer = await pdfGenerator.generatePDF(resumeData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${resumeData.personalInfo.firstName || 'resume'}.pdf`);
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