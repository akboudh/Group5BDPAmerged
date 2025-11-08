#!/usr/bin/env python3
"""
Python script to scrape resources from roadmap.sh
Install dependencies: pip install requests beautifulsoup4 selenium
Run: python scripts/scrape-roadmap.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
from urllib.parse import urljoin, urlparse

# Roadmap.sh base URL
BASE_URL = "https://roadmap.sh"

# Skill to roadmap URL mapping
SKILL_ROADMAPS = {
    'html': 'https://roadmap.sh/frontend',
    'css': 'https://roadmap.sh/frontend',
    'javascript': 'https://roadmap.sh/frontend',
    'typescript': 'https://roadmap.sh/frontend',
    'react': 'https://roadmap.sh/react',
    'nodejs': 'https://roadmap.sh/backend',
    'express': 'https://roadmap.sh/backend',
    'python': 'https://roadmap.sh/python',
    'django': 'https://roadmap.sh/python',
    'flask': 'https://roadmap.sh/python',
    'java': 'https://roadmap.sh/java',
    'sql': 'https://roadmap.sh/postgresql-dba',
    'mongodb': 'https://roadmap.sh/mongodb',
    'postgresql': 'https://roadmap.sh/postgresql-dba',
    'mysql': 'https://roadmap.sh/postgresql-dba',
    'docker': 'https://roadmap.sh/devops',
    'aws': 'https://roadmap.sh/aws',
    'git': 'https://roadmap.sh/frontend',
    'github': 'https://roadmap.sh/frontend',
    'pandas': 'https://roadmap.sh/data-analyst',
    'tableau': 'https://roadmap.sh/data-analyst',
    'excel': 'https://roadmap.sh/data-analyst'
}

def determine_resource_type(url, platform):
    """Determine resource type based on URL and platform"""
    url_lower = url.lower()
    
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'video'
    elif 'freecodecamp.org' in url_lower or 'codecademy.com' in url_lower:
        return 'interactive'
    elif 'coursera.org' in url_lower or 'udemy.com' in url_lower or 'edx.org' in url_lower:
        return 'course'
    elif 'medium.com' in url_lower or 'dev.to' in url_lower:
        return 'article'
    else:
        return 'docs'

def determine_platform(url):
    """Determine platform from URL"""
    url_lower = url.lower()
    domain = urlparse(url).netloc.lower()
    
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'YouTube'
    elif 'freecodecamp.org' in url_lower:
        return 'freeCodeCamp'
    elif 'codecademy.com' in url_lower:
        return 'Codecademy'
    elif 'coursera.org' in url_lower:
        return 'Coursera'
    elif 'udemy.com' in url_lower:
        return 'Udemy'
    elif 'edx.org' in url_lower:
        return 'edX'
    elif 'mdn.io' in url_lower or 'mozilla.org' in url_lower:
        return 'MDN'
    elif 'w3schools.com' in url_lower:
        return 'W3Schools'
    elif 'medium.com' in url_lower:
        return 'Medium'
    elif 'dev.to' in url_lower:
        return 'Dev.to'
    elif 'github.com' in url_lower:
        return 'GitHub'
    elif 'khanacademy.org' in url_lower:
        return 'Khan Academy'
    else:
        return domain.split('.')[-2].title() if '.' in domain else 'Unknown'

def scrape_roadmap_page(skill_id, roadmap_url):
    """Scrape resources from a roadmap.sh page"""
    print(f"Scraping {skill_id} from {roadmap_url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(roadmap_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        resources = []
        
        # Find all links on the page
        links = soup.find_all('a', href=True)
        
        # Resource platforms to look for
        resource_domains = [
            'youtube.com', 'youtu.be',
            'freecodecamp.org', 'codecademy.com',
            'coursera.org', 'udemy.com', 'edx.org',
            'mdn.io', 'mozilla.org', 'w3schools.com',
            'medium.com', 'dev.to',
            'github.com', 'khanacademy.org'
        ]
        
        seen_urls = set()
        
        for link in links:
            href = link.get('href', '').strip()
            text = link.get_text(strip=True)
            
            if not href or not text or len(text) < 5:
                continue
            
            # Convert relative URLs to absolute
            if href.startswith('/'):
                href = urljoin(BASE_URL, href)
            elif not href.startswith('http'):
                continue
            
            # Check if it's a resource link
            is_resource = any(domain in href.lower() for domain in resource_domains)
            
            if is_resource and href not in seen_urls:
                seen_urls.add(href)
                
                platform = determine_platform(href)
                resource_type = determine_resource_type(href, platform)
                
                resources.append({
                    'skillId': skill_id,
                    'title': text[:200],  # Limit title length
                    'url': href,
                    'platform': platform,
                    'type': resource_type
                })
        
        print(f"  Found {len(resources)} resources")
        return resources
        
    except Exception as e:
        print(f"  Error scraping {roadmap_url}: {str(e)}")
        return []

def main():
    """Main scraping function"""
    print("Starting roadmap.sh resource scraping...")
    print("This may take a few minutes...\n")
    
    all_resources = []
    processed_urls = set()
    
    for skill_id, roadmap_url in SKILL_ROADMAPS.items():
        if roadmap_url in processed_urls:
            print(f"\nSkipping {skill_id} - URL already processed")
            continue
        
        resources = scrape_roadmap_page(skill_id, roadmap_url)
        all_resources.extend(resources)
        processed_urls.add(roadmap_url)
        
        # Be respectful - wait between requests
        time.sleep(2)
    
    # Add unique IDs
    import time as time_module
    timestamp = int(time_module.time() * 1000)
    resources_with_ids = [
        {
            'id': f"{r['skillId']}-scraped-{timestamp}-{i}",
            **r
        }
        for i, r in enumerate(all_resources)
    ]
    
    # Save to file
    output_path = os.path.join(os.path.dirname(__file__), '../src/data/roadmap-resources-scraped.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(resources_with_ids, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Scraping complete!")
    print(f"   Total resources found: {len(resources_with_ids)}")
    print(f"   Saved to: {output_path}")
    print(f"\nNote: If roadmap.sh uses React/JS rendering, you may need Selenium.")
    print(f"Next: Run 'node scripts/merge-resources.js' to merge into resources.json")

if __name__ == '__main__':
    main()

