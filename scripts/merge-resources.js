// scripts/merge-resources.js
// Merge scraped resources from roadmap.sh into resources.json
// Run: node scripts/merge-resources.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Merge scraped resources into existing resources.json
 */
function mergeResources() {
  const resourcesPath = path.join(__dirname, '../src/data/resources.json');
  const scrapedPath = path.join(__dirname, '../src/data/roadmap-resources-scraped.json');
  
  // Load existing resources
  if (!fs.existsSync(resourcesPath)) {
    console.error('Error: resources.json not found!');
    process.exit(1);
  }
  
  const existingResources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));
  
  // Load scraped resources
  if (!fs.existsSync(scrapedPath)) {
    console.error('Error: roadmap-resources-scraped.json not found!');
    console.error('Please run the scraper first: node scripts/scrape-roadmap-puppeteer.js');
    process.exit(1);
  }
  
  const scrapedResources = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));
  
  console.log(`Loaded ${existingResources.length} existing resources`);
  console.log(`Loaded ${scrapedResources.length} scraped resources`);
  
  // Create a map of existing resources by URL to avoid duplicates
  const existingUrls = new Set(existingResources.map(r => r.url));
  
  // Filter scraped resources: only add if URL doesn't exist and it's a free resource
  const freePlatforms = [
    'YouTube',
    'freeCodeCamp',
    'MDN',
    'W3Schools',
    'GitHub',
    'Dev.to',
    'Medium',
    'Khan Academy',
    'Codecademy'
  ];
  
  const newResources = scrapedResources.filter(resource => {
    const isFree = freePlatforms.some(platform => 
      resource.platform.includes(platform) || 
      resource.url.includes(platform.toLowerCase().replace(' ', ''))
    );
    
    return !existingUrls.has(resource.url) && isFree;
  });
  
  console.log(`\nFound ${newResources.length} new free resources to add`);
  
  // Merge resources
  const mergedResources = [...existingResources, ...newResources];
  
  // Sort by skillId for better organization
  mergedResources.sort((a, b) => {
    if (a.skillId !== b.skillId) {
      return a.skillId.localeCompare(b.skillId);
    }
    // Prioritize roadmap.sh resources
    if (a.platform === 'roadmap.sh' && b.platform !== 'roadmap.sh') return -1;
    if (a.platform !== 'roadmap.sh' && b.platform === 'roadmap.sh') return 1;
    return a.title.localeCompare(b.title);
  });
  
  // Save merged resources
  fs.writeFileSync(resourcesPath, JSON.stringify(mergedResources, null, 2));
  
  console.log(`\n✅ Merge complete!`);
  console.log(`   Total resources: ${mergedResources.length}`);
  console.log(`   Added ${newResources.length} new resources`);
  console.log(`   Updated: ${resourcesPath}`);
  
  // Generate summary by skill
  const resourcesBySkill = {};
  newResources.forEach(resource => {
    if (!resourcesBySkill[resource.skillId]) {
      resourcesBySkill[resource.skillId] = [];
    }
    resourcesBySkill[resource.skillId].push(resource);
  });
  
  console.log('\n📊 New resources by skill:');
  Object.entries(resourcesBySkill).forEach(([skillId, resources]) => {
    console.log(`   ${skillId}: ${resources.length} resources`);
  });
}

// Run merge function
mergeResources();

export { mergeResources };

