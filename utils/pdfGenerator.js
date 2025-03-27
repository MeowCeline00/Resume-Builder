// utils/pdfGenerator.js
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

// Generate PDF from resume data
const generatePDF = async (resumeData) => {
  try {
    // Create browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Get the template file
    let templatePath;
    try {
      templatePath = path.join(__dirname, '..', 'views', 'templates', `${resumeData.templateName}.ejs`);
      if (!fs.existsSync(templatePath)) {
        // If template doesn't exist, use a default one
        templatePath = path.join(__dirname, '..', 'views', 'templates', 'modern.ejs');
        console.warn(`Template ${resumeData.templateName} not found, using modern template instead`);
      }
    } catch (err) {
      templatePath = path.join(__dirname, '..', 'views', 'preview-resume.ejs');
      console.warn('Using preview-resume.ejs as fallback template');
    }
    
    // Render the template with data
    const htmlContent = await ejs.renderFile(templatePath, { resume: resumeData, title: 'Resume PDF' });
    
    // Set page content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });
    
    await browser.close();
    return pdf;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = {
  generatePDF
};