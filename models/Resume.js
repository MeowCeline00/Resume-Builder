const db = require('./db');

class Resume {
  // Create a new resume
  static async create(resumeData) {
    const { personalInfo, education, experience, skills, templateName } = resumeData;
    
    try {
      const result = await db.query(
        'INSERT INTO resumes (personal_info, education, experience, skills, template_name, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
        [JSON.stringify(personalInfo), JSON.stringify(education), JSON.stringify(experience), JSON.stringify(skills), templateName]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  }

  // Get a resume by ID
  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM resumes WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  }

  // Get all resumes
  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM resumes ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching all resumes:', error);
      throw error;
    }
  }

  // Update a resume
  static async update(id, resumeData) {
    const { personalInfo, education, experience, skills, templateName } = resumeData;
    
    try {
      const result = await db.query(
        'UPDATE resumes SET personal_info = $1, education = $2, experience = $3, skills = $4, template_name = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
        [JSON.stringify(personalInfo), JSON.stringify(education), JSON.stringify(experience), JSON.stringify(skills), templateName, id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  // Delete a resume
  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM resumes WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }
}

module.exports = Resume;