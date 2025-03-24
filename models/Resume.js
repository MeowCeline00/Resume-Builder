const db = require('./db');

class Resume {
  static async create({ title, personalInfo = {}, education = [], experience = [], skills = [], templateName = '', thumbnail = null }) {
    try {
      const result = await db.query(
        `INSERT INTO resumes 
         (name, personal_info, education, experience, skills, template_name, thumbnail_url, is_locked, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
         RETURNING *`,
        [
          title,
          JSON.stringify(personalInfo),
          JSON.stringify(education),
          JSON.stringify(experience),
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

  static async update(id, { personalInfo, education, experience, skills, templateName, thumbnail }) {
    try {
      const result = await db.query(
        `UPDATE resumes 
         SET personal_info = $1, education = $2, experience = $3, skills = $4,
             template_name = $5, thumbnail_url = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [
          JSON.stringify(personalInfo),
          JSON.stringify(education),
          JSON.stringify(experience),
          JSON.stringify(skills),
          templateName,
          thumbnail,
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
      const result = await db.query('DELETE FROM resumes WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  static async duplicate(id) {
    const original = await Resume.getById(id);
    if (!original) throw new Error('Resume not found');

    const copy = await Resume.create({
      title: `${original.name} Copy`,
      personalInfo: original.personal_info,
      education: original.education,
      experience: original.experience,
      skills: original.skills,
      templateName: original.template_name,
      thumbnail: original.thumbnail_url
    });

    return copy;
  }
}

module.exports = Resume;
