// models/Resume.js
const db = require('./db');

class Resume {
  static async create({ title, personalInfo = {}, education = [], experience = [], projects = [], skills = [], templateName = 'modern', thumbnail = null }) {
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
      
      // Return a plain object with camelCase properties for consistent frontend use
      return this.formatResumeData(result.rows[0]);
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM resumes WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching resume by ID:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM resumes ORDER BY updated_at DESC');
      // Return array of formatted resume objects for frontend consistency
      return result.rows.map(row => this.formatResumeData(row));
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
      
      // Check if resume is locked before updating
      if (existingResume.is_locked) {
        throw new Error('Cannot update a locked resume');
      }
      
      // Use existing values if new ones are not provided
      const updatedPersonalInfo = personalInfo || JSON.parse(existingResume.personal_info || '{}');
      const updatedEducation = education || JSON.parse(existingResume.education || '[]');
      const updatedExperience = experience || JSON.parse(existingResume.experience || '[]');
      const updatedProjects = projects || JSON.parse(existingResume.projects || '[]');
      const updatedSkills = skills || JSON.parse(existingResume.skills || '[]');
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
      
      return this.formatResumeData(result.rows[0]);
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
      
      // Check if resume is locked before renaming
      const existingResume = await this.getById(id);
      if (!existingResume) {
        throw new Error('Resume not found');
      }
      
      if (existingResume.is_locked) {
        throw new Error('Cannot rename a locked resume');
      }
      
      const result = await db.query(
        'UPDATE resumes SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newTitle, id]
      );
      
      return this.formatResumeData(result.rows[0]);
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
      
      return this.formatResumeData(result.rows[0]);
    } catch (error) {
      console.error('Error toggling lock:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Check if resume is locked before deleting
      const resume = await this.getById(id);
      if (!resume) {
        throw new Error('Resume not found');
      }
      
      if (resume.is_locked) {
        throw new Error('Cannot delete a locked resume');
      }
      
      const result = await db.query('DELETE FROM resumes WHERE id = $1 RETURNING id', [id]);
      return { id: result.rows[0].id };
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  static async duplicate(id) {
    try {
      const original = await this.getById(id);
      if (!original) throw new Error('Resume not found');

      const copy = await this.create({
        title: `${original.name} Copy`,
        personalInfo: JSON.parse(original.personal_info || '{}'),
        education: JSON.parse(original.education || '[]'),
        experience: JSON.parse(original.experience || '[]'),
        projects: JSON.parse(original.projects || '[]'),
        skills: JSON.parse(original.skills || '[]'),
        templateName: original.template_name,
        thumbnail: original.thumbnail_url
      });

      return copy;
    } catch (error) {
      console.error('Error duplicating resume:', error);
      throw error;
    }
  }

  static async updateThumbnail(id, thumbnailUrl) {
    try {
      // Check if resume is locked before updating thumbnail
      const existingResume = await this.getById(id);
      if (!existingResume) {
        throw new Error('Resume not found');
      }
      
      if (existingResume.is_locked) {
        throw new Error('Cannot update thumbnail of a locked resume');
      }
      
      const result = await db.query(
        'UPDATE resumes SET thumbnail_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [thumbnailUrl, id]
      );
      
      return this.formatResumeData(result.rows[0]);
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      throw error;
    }
  }

  // Helper method to format resume data for consistent frontend use
  static formatResumeData(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      title: row.name,
      name: row.name, // Keep both for backward compatibility
      templateName: row.template_name,
      template_name: row.template_name, // Keep both for backward compatibility
      thumbnailUrl: row.thumbnail_url,
      thumbnail_url: row.thumbnail_url, // Keep both for backward compatibility
      isLocked: row.is_locked,
      is_locked: row.is_locked, // Keep both for backward compatibility
      createdAt: row.created_at,
      created_at: row.created_at, // Keep both for backward compatibility
      updatedAt: row.updated_at,
      updated_at: row.updated_at // Keep both for backward compatibility
    };
  }
}

module.exports = Resume;