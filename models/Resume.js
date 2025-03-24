const db = require('./db');

class Resume {
  static async create({ title, personalInfo = {}, education = [], experience = [], projects = [], skills = {}, templateName = 'modern', thumbnail = null }) {
    try {
      // Ensure title is not null
      if (!title) {
        title = 'Untitled Resume';
      }
      
      const result = await db.query(
        `INSERT INTO resumes 
         (name, personal_info, education, experience, projects, skills, template_name, thumbnail_url, is_locked, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW())
         RETURNING *`,
        [
          title,
          JSON.stringify(personalInfo),
          JSON.stringify(education),
          JSON.stringify(experience),
          JSON.stringify(projects),
          JSON.stringify(skills),
          templateName,
          thumbnail
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM resumes WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching resume by ID:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM resumes ORDER BY updated_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  }

  static async update(id, { personalInfo, education, experience, projects, skills, templateName, thumbnail }) {
    try {
      // Get existing resume to preserve data we don't want to update
      const existingResume = await this.getById(id);
      if (!existingResume) {
        throw new Error('Resume not found');
      }
      
      // Use existing values if new ones are not provided
      const updatedPersonalInfo = personalInfo || JSON.parse(existingResume.personal_info || '{}');
      const updatedEducation = education || JSON.parse(existingResume.education || '[]');
      const updatedExperience = experience || JSON.parse(existingResume.experience || '[]');
      const updatedProjects = projects || JSON.parse(existingResume.projects || '[]');
      const updatedSkills = skills || JSON.parse(existingResume.skills || '{}');
      const updatedTemplateName = templateName || existingResume.template_name;
      const updatedThumbnail = thumbnail || existingResume.thumbnail_url;
      
      const result = await db.query(
        `UPDATE resumes 
         SET personal_info = $1, education = $2, experience = $3, projects = $4, skills = $5,
             template_name = $6, thumbnail_url = $7, updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [
          JSON.stringify(updatedPersonalInfo),
          JSON.stringify(updatedEducation),
          JSON.stringify(updatedExperience),
          JSON.stringify(updatedProjects),
          JSON.stringify(updatedSkills),
          updatedTemplateName,
          updatedThumbnail,
          id
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  static async rename(id, newTitle) {
    try {
      if (!newTitle) {
        throw new Error('New title is required');
      }
      
      const result = await db.query(
        'UPDATE resumes SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newTitle, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error renaming resume:', error);
      throw error;
    }
  }

  static async toggleLock(id, lockStatus) {
    try {
      const result = await db.query(
        'UPDATE resumes SET is_locked = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [lockStatus, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error toggling lock:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Check if resume is locked before deleting
      const resume = await this.getById(id);
      if (resume && resume.is_locked) {
        throw new Error('Cannot delete a locked resume');
      }
      
      const result = await db.query('DELETE FROM resumes WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  static async duplicate(id) {
    try {
      const original = await Resume.getById(id);
      if (!original) throw new Error('Resume not found');

      const copy = await Resume.create({
        title: `${original.name} Copy`,
        personalInfo: JSON.parse(original.personal_info || '{}'),
        education: JSON.parse(original.education || '[]'),
        experience: JSON.parse(original.experience || '[]'),
        projects: JSON.parse(original.projects || '[]'),
        skills: JSON.parse(original.skills || '{}'),
        templateName: original.template_name,
        thumbnail: original.thumbnail_url
      });

      return copy;
    } catch (error) {
      console.error('Error duplicating resume:', error);
      throw error;
    }
  }
}

module.exports = Resume;