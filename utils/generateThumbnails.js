// utils/generateThumbnails.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const generateThumbnail = async (resumeId, url) => {
  try {
    // Ensure directory exists
    const templatesDir = path.join(__dirname, '../public/img/templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1000 });
    
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const screenshotPath = path.join(__dirname, '../public/img/templates', `${resumeId}.png`);
    await page.screenshot({ path: screenshotPath });

    await browser.close();
    console.log(`✅ Thumbnail generated for resume ${resumeId}`);
    return screenshotPath;
  } catch (error) {
    console.error('❌ Failed to generate thumbnail:', error);
    throw error;
  }
};

module.exports = generateThumbnail;