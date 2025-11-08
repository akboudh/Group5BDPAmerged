import type { Skill } from '../types';
import { extractSkillsFromText } from './resumeParser';

/**
 * Extract text content from HTML string
 */
function extractTextFromHTML(html: string): string {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  // Get text content
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Fetch LinkedIn profile HTML using a CORS proxy
 * Note: This is a fallback method and may not work reliably due to LinkedIn's restrictions
 */
async function fetchLinkedInProfileWithProxy(profileUrl: string): Promise<string> {
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    // Try using a public CORS proxy (this is a fallback and may not always work)
    // In production, you'd want to use your own backend proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(profileUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'manual', // Don't follow redirects automatically
      credentials: 'omit',
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Check if response is a redirect
    if (response.type === 'opaqueredirect' || response.status >= 300 && response.status < 400) {
      throw new Error('LinkedIn profile requires authentication or is not publicly accessible.');
    }
    
    const data = await response.json();
    
    if (data.contents) {
      // Check if the content is actually an error page or redirect
      const content = data.contents.toLowerCase();
      if (content.includes('redirect') || content.includes('login') || content.includes('sign in')) {
        throw new Error('LinkedIn profile requires authentication or is not publicly accessible.');
      }
      return data.contents;
    }
    
    throw new Error('Failed to fetch profile content from proxy.');
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. LinkedIn profile may not be accessible. Please use the text paste method instead.');
    }
    
    // Handle other errors
    if (error instanceof Error) {
      // Don't expose internal error details, provide user-friendly message
      if (error.message.includes('LinkedIn')) {
        throw error;
      }
      throw new Error('Unable to fetch LinkedIn profile. LinkedIn profiles are often not publicly accessible. Please use the "Paste Text" method instead.');
    }
    
    throw new Error('Unable to fetch LinkedIn profile. Please use the text paste method instead.');
  }
}

/**
 * Parse LinkedIn profile URL and extract skills
 * Note: Direct fetching may fail due to CORS. Falls back to manual text input.
 */
export async function parseLinkedInURL(profileUrl: string, skills: Skill[]): Promise<string[]> {
  // Validate URL
  if (!profileUrl.includes('linkedin.com/in/')) {
    throw new Error('Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)');
  }
  
  // Ensure URL has protocol
  let finalUrl = profileUrl.trim();
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = 'https://' + finalUrl;
  }
  
  // Validate URL format
  try {
    new URL(finalUrl);
  } catch {
    throw new Error('Invalid URL format. Please enter a valid LinkedIn profile URL.');
  }
  
  try {
    // Try to fetch the profile (this will likely fail due to CORS or authentication)
    // In a real implementation, you'd use a backend proxy with authentication
    const html = await fetchLinkedInProfileWithProxy(finalUrl);
    
    // Validate that we got actual content
    if (!html || html.trim().length === 0) {
      throw new Error('No content received from LinkedIn profile.');
    }
    
    const text = extractTextFromHTML(html);
    
    // Check if we got meaningful text
    if (!text || text.trim().length < 50) {
      throw new Error('Unable to extract meaningful content from LinkedIn profile. The profile may be private or require authentication.');
    }
    
    const extractedSkills = extractSkillsFromText(text, skills);
    
    if (extractedSkills.length === 0) {
      throw new Error('No skills found in the LinkedIn profile. Please make sure your profile is publicly accessible and contains skills information.');
    }
    
    return extractedSkills;
  } catch (error) {
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unable to fetch LinkedIn profile. Please use the text paste method instead.');
  }
}

/**
 * Parse LinkedIn profile text (pasted by user) and extract skills
 */
export function parseLinkedInText(text: string, skills: Skill[]): string[] {
  if (!text || text.trim().length === 0) {
    throw new Error('Please paste some text from your LinkedIn profile.');
  }
  
  // Clean up the text (remove extra whitespace, etc.)
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .trim();
  
  return extractSkillsFromText(cleanedText, skills);
}


