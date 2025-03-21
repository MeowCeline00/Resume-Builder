const Resume = require('../models/Resume');
const pdfGenerator = require('../utils/pdfGenerator');

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
                createdAt: new Date(resume.created_at).toLocaleDateString()
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
                skills: { technical: [], soft: [] }
            }
        });
    },

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
                personalInfo: req.body.personalInfo,
                education: req.body.education || [{}],
                experience: req.body.experience || [{}],
                skills: req.body.skills || { technical: [], soft: [] },
                templateName: req.body.templateName || 'modern'
            };
            const updatedResume = await Resume.update(req.params.id, resumeData);
            res.redirect(`/resume/edit/${updatedResume.id}`);
        } catch (error) {
            console.error('Error updating resume:', error);
            res.status(500).render('error', { title: 'Error', message: 'Failed to update resume' });
        }
    },

    deleteResume: async (req, res) => {
        try {
            await Resume.delete(req.params.id);
            res.redirect('/resume/list');
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
                skills: safeParseJSON(resume.skills),
                templateName: resume.template_name
            };

            res.render(`templates/${resumeData.templateName}`, { title: 'Resume Preview', resume: resumeData });
        } catch (error) {
            console.error('Error previewing resume:', error);
            res.status(500).render('error', { title: 'Error', message: 'Failed to load resume preview' });
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
                skills: safeParseJSON(resume.skills),
                templateName: resume.template_name
            };
            const pdfBuffer = await pdfGenerator.generatePDF(resumeData);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${resumeData.personalInfo.name}_resume.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error downloading resume:', error);
        }
    }
};

module.exports = resumeController;
