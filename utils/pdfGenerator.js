const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const pdf = require('html-pdf');

// Options for PDF generation
const pdfOptions = {
  format: 'Letter',
  border: {
    top: '10mm',
    right: '10mm',
    bottom: '10mm',
    left: '10mm'
  },
  header: {
    height: '5mm'
  },
  footer: {
    height: '5mm'
  },
  printBackground: true
};

// Generate PDF from resume data
const generatePDF = (resumeData) => {
  return new Promise((resolve, reject) => {
    try {
      // Get the template file
      const templatePath = path.join(__dirname, '..', 'views', 'templates', `${resumeData.templateName}.ejs`);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      
      // Compile the template with the resume data
      const html = ejs.render(templateContent, {
        resume: resumeData,
        includeStyles: true,
        baseUrl: `file://${path.join(__dirname, '..', 'public')}/`
      });
      
      // Add CSS styles directly
      const cssFiles = [
        path.join(__dirname, '..', 'public', 'css', 'templates', `${resumeData.templateName}.css`)
      ];
      
      let cssContent = '';
      cssFiles.forEach(file => {
        if (fs.existsSync(file)) {
          cssContent += fs.readFileSync(file, 'utf-8');
        }
      });
      
      // Inject the CSS into the HTML
      const htmlWithCss = html.replace('</head>', `<style>${cssContent}</style></head>`);
      
      // Generate PDF from the compiled HTML
      pdf.create(htmlWithCss, pdfOptions).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePDF
};