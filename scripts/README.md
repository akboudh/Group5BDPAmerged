# Roadmap.sh Resource Scraper

This directory contains scripts to scrape free learning resources from roadmap.sh and integrate them into the project.

## Overview

The scraper extracts resources (YouTube videos, articles, tutorials, etc.) from roadmap.sh pages for each skill and merges them into `resources.json`. Users will then see direct links to free resources like YouTube videos, freeCodeCamp courses, MDN docs, etc., instead of just linking to roadmap.sh.

## Setup

### Option 1: Node.js with Puppeteer (Recommended)

1. **Install Puppeteer:**
   ```bash
   npm install --save-dev puppeteer
   ```

2. **Run the scraper:**
   ```bash
   npm run scrape:roadmap
   ```

3. **Merge resources:**
   ```bash
   npm run merge:resources
   ```

   Or do both at once:
   ```bash
   npm run scrape:all
   ```

### Option 2: Python (Alternative)

1. **Install Python dependencies:**
   ```bash
   pip install requests beautifulsoup4 selenium
   ```

2. **Run the Python scraper:**
   ```bash
   python scripts/scrape-roadmap.py
   ```

3. **Merge resources:**
   ```bash
   npm run merge:resources
   ```

## Files

- `scrape-roadmap.js` - Basic Node.js scraper (template, doesn't actually scrape)
- `scrape-roadmap-puppeteer.js` - Full Puppeteer implementation (handles React/JS rendering)
- `scrape-roadmap.py` - Python scraper using BeautifulSoup
- `merge-resources.js` - Merges scraped resources into resources.json

## How It Works

1. **Scraping:** The scraper visits roadmap.sh pages for each skill and extracts:
   - YouTube video links
   - freeCodeCamp courses
   - MDN documentation
   - Articles from Medium, Dev.to
   - GitHub repositories
   - Other free learning resources

2. **Filtering:** Only free resources are kept (filters out paid Udemy/Coursera courses unless they're free)

3. **Merging:** Scraped resources are merged into `resources.json`, avoiding duplicates

4. **Display:** The LearningPath component shows these resources to users with direct links

## Important Notes

### Roadmap.sh Structure
Roadmap.sh is a React application, so:
- **Puppeteer** (Node.js) is recommended as it can handle JavaScript-rendered content
- **BeautifulSoup** (Python) may not work if the page requires JS rendering
- If BeautifulSoup doesn't work, use Selenium with Python

### Rate Limiting
The scripts include 2-second delays between requests to be respectful of roadmap.sh servers.

### Legal & Ethical
- Always respect roadmap.sh's terms of service
- Don't overload their servers with too many requests
- Consider caching results and updating periodically rather than scraping on every request

## Troubleshooting

### Puppeteer Issues
If Puppeteer fails to install:
```bash
# On Mac
brew install chromium

# Or set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install puppeteer
```

### No Resources Found
- Check if roadmap.sh page structure has changed
- Verify the URLs in `skillRoadmaps` are correct
- Try visiting the roadmap.sh page manually to see the structure
- Roadmap.sh may have updated their HTML structure - update selectors accordingly

### Merge Issues
- Make sure `roadmap-resources-scraped.json` exists before running merge
- Check that resources.json is valid JSON
- Review the merge script output for any errors

## Updating Resources

To update resources periodically:

1. Run the scraper:
   ```bash
   npm run scrape:all
   ```

2. Review the new resources in `resources.json`

3. Test in the app to ensure resources display correctly

4. Commit the updated `resources.json` to version control

## Fallback

If scraping doesn't work, the `roadmapMapper.ts` file serves as Plan B - it provides direct links to roadmap.sh pages where users can find resources manually.

