// scripts/scrape-roadmap-puppeteer.js
// Full implementation using Puppeteer to scrape roadmap.sh
// Install: npm install puppeteer
// Run: node scripts/scrape-roadmap-puppeteer.js

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { skillRoadmaps } from './scrape-roadmap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract resources from a roadmap.sh page using Puppeteer
 */
async function scrapeRoadmapPage(page, skillId, roadmapUrl) {
  console.log(`\nScraping: ${skillId} from ${roadmapUrl}`);
  
  try {
    await page.goto(roadmapUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the page to load (adjust selector based on actual page structure)
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Extract resources - adjust selectors based on roadmap.sh structure
    const resources = await page.evaluate(() => {
      const resourceLinks = [];
      
      // Look for links that might be resources
      // Common patterns in roadmap.sh:
      // - Links to YouTube videos
      // - Links to articles/tutorials
      // - Links to documentation
      // - Links to courses
      
      const links = document.querySelectorAll('a[href]');
      
      links.forEach(link => {
        const href = link.href;
        const text = link.textContent.trim();
        
        // Filter for external resources (YouTube, articles, etc.)
        if (
          href &&
          text &&
          text.length > 5 && // Meaningful text
          (
            href.includes('youtube.com') ||
            href.includes('youtu.be') ||
            href.includes('freecodecamp.org') ||
            href.includes('mdn.io') ||
            href.includes('w3schools.com') ||
            href.includes('medium.com') ||
            href.includes('dev.to') ||
            href.includes('github.com') ||
            href.includes('coursera.org') ||
            href.includes('udemy.com') ||
            href.includes('edx.org') ||
            href.includes('khanacademy.org') ||
            href.includes('codecademy.com')
          )
        ) {
          // Determine resource type
          let type = 'docs';
          let platform = 'Unknown';
          
          if (href.includes('youtube.com') || href.includes('youtu.be')) {
            type = 'video';
            platform = 'YouTube';
          } else if (href.includes('freecodecamp.org') || href.includes('codecademy.com')) {
            type = 'interactive';
            platform = href.includes('freecodecamp') ? 'freeCodeCamp' : 'Codecademy';
          } else if (href.includes('coursera.org') || href.includes('udemy.com') || href.includes('edx.org')) {
            type = 'course';
            platform = href.includes('coursera') ? 'Coursera' : href.includes('udemy') ? 'Udemy' : 'edX';
          } else if (href.includes('mdn.io') || href.includes('w3schools.com')) {
            type = 'docs';
            platform = href.includes('mdn') ? 'MDN' : 'W3Schools';
          } else if (href.includes('medium.com') || href.includes('dev.to')) {
            type = 'article';
            platform = href.includes('medium') ? 'Medium' : 'Dev.to';
          } else if (href.includes('github.com')) {
            type = 'docs';
            platform = 'GitHub';
          }
          
          resourceLinks.push({
            title: text,
            url: href,
            platform: platform,
            type: type
          });
        }
      });
      
      return resourceLinks;
    });
    
    // Remove duplicates
    const uniqueResources = resources.filter((resource, index, self) =>
      index === self.findIndex(r => r.url === resource.url)
    );
    
    console.log(`  Found ${uniqueResources.length} resources`);
    
    return uniqueResources.map(resource => ({
      skillId,
      ...resource
    }));
    
  } catch (error) {
    console.error(`  Error scraping ${roadmapUrl}:`, error.message);
    return [];
  }
}

/**
 * Main scraping function
 */
async function scrapeAllRoadmaps() {
  console.log('Starting Puppeteer scraping of roadmap.sh...');
  console.log('This may take a few minutes...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set user agent to avoid being blocked
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const allResources = [];
  const processedUrls = new Set();
  
  // Scrape each skill's roadmap
  for (const [skillId, roadmapUrl] of Object.entries(skillRoadmaps)) {
    if (processedUrls.has(roadmapUrl)) {
      // Skip if we already processed this URL
      console.log(`\nSkipping ${skillId} - URL already processed`);
      continue;
    }
    
    const resources = await scrapeRoadmapPage(page, skillId, roadmapUrl);
    allResources.push(...resources);
    processedUrls.add(roadmapUrl);
    
    // Be respectful - wait between requests
    await page.waitForTimeout(2000);
  }
  
  await browser.close();
  
  // Generate unique IDs for resources
  const resourcesWithIds = allResources.map((resource, index) => ({
    id: `${resource.skillId}-scraped-${Date.now()}-${index}`,
    ...resource
  }));
  
  // Save scraped resources
  const outputPath = path.join(__dirname, '../src/data/roadmap-resources-scraped.json');
  fs.writeFileSync(outputPath, JSON.stringify(resourcesWithIds, null, 2));
  
  console.log(`\n✅ Scraping complete!`);
  console.log(`   Total resources found: ${resourcesWithIds.length}`);
  console.log(`   Saved to: ${outputPath}`);
  console.log(`\nNext: Run 'node scripts/merge-resources.js' to merge into resources.json`);
  
  return resourcesWithIds;
}

// Run scraper
scrapeAllRoadmaps().catch(console.error);

export { scrapeAllRoadmaps };

