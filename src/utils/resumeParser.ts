import type { Skill } from '../types';

/**
 * Get PDF.js worker URL with fallbacks
 */
async function getPDFWorkerUrl(pdfjsLib: any): Promise<string> {
  const version = pdfjsLib.version || '5.4.394';
  
  // Try multiple CDN options in order of reliability
  const cdnOptions = [
    `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`,
  ];
  
  // Try to load the first CDN option to verify it works
  for (const url of cdnOptions) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
    } catch (e) {
      // Try next option
      continue;
    }
  }
  
  // If all CDNs fail, return the first one anyway (might work in some cases)
  return cdnOptions[0];
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Use static import to avoid dynamic import issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source with fallback strategy
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      try {
        const workerUrl = await getPDFWorkerUrl(pdfjsLib);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      } catch (workerError) {
        // Final fallback - use unpkg which is usually reliable
        const version = pdfjsLib.version || '5.4.394';
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
      }
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Validate PDF file by checking magic bytes
    const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4));
    const pdfHeader = String.fromCharCode(...uint8Array);
    if (!pdfHeader.startsWith('%PDF')) {
      throw new Error('Invalid PDF file. The file may be corrupted or not a valid PDF.');
    }
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0, // Suppress warnings
    }).promise;
    
    if (!pdf || pdf.numPages === 0) {
      throw new Error('PDF file appears to be empty or corrupted.');
    }
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .filter((str: string) => str.trim().length > 0)
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i}:`, pageError);
        // Continue with other pages
      }
    }
    
    if (!fullText || fullText.trim().length < 10) {
      throw new Error('Could not extract text from PDF. The PDF may be image-based or password-protected.');
    }
    
    return fullText.trim();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF') || error.message.includes('corrupted')) {
        throw error;
      }
      if (error.message.includes('password') || error.message.includes('encrypted')) {
        throw new Error('PDF file is password-protected. Please remove the password and try again.');
      }
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
    throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF document.');
  }
}

/**
 * Extract text from a DOCX file
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    
    // Validate DOCX file by checking magic bytes (ZIP file signature)
    const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4));
    const zipHeader = Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('');
    if (zipHeader !== '504b0304' && zipHeader !== '504b0506' && zipHeader !== '504b0708') {
      throw new Error('Invalid DOCX file. The file may be corrupted or not a valid DOCX document.');
    }
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      const errors = result.messages.filter(msg => msg.type === 'error');
      if (errors.length > 0) {
        console.warn('DOCX parsing warnings:', errors);
      }
    }
    
    if (!result.value || result.value.trim().length < 10) {
      throw new Error('Could not extract text from DOCX file. The file may be empty or corrupted.');
    }
    
    return result.value.trim();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid DOCX') || error.message.includes('corrupted')) {
        throw error;
      }
      if (error.message.includes('not a valid') || error.message.includes('Cannot read')) {
        throw new Error('Invalid DOCX file format. Please ensure the file is a valid Microsoft Word document (.docx).');
      }
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
    throw new Error('Failed to parse DOCX file. Please ensure it is a valid Word document.');
  }
}

/**
 * Extract text from a TXT file
 */
export async function extractTextFromTXT(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    if (!text || text.trim().length < 10) {
      throw new Error('Text file appears to be empty or contains insufficient content.');
    }
    
    return text.trim();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('empty') || error.message.includes('insufficient')) {
        throw error;
      }
      throw new Error(`Failed to read text file: ${error.message}`);
    }
    throw new Error('Failed to read text file. Please ensure the file is a valid text document.');
  }
}

/**
 * Extract skills from resume text by matching against the skills database
 */
export function extractSkillsFromText(text: string, skills: Skill[]): string[] {
  const extractedSkills: string[] = [];
  const seen = new Set<string>();
  
  // Create a map of all possible skill matches (label, aliases, id)
  const skillMatches: Array<{ pattern: string; skillId: string }> = [];
  
  for (const skill of skills) {
    // Add skill label
    skillMatches.push({
      pattern: skill.label.toLowerCase(),
      skillId: skill.id
    });
    
    // Add skill ID
    if (skill.id.toLowerCase() !== skill.label.toLowerCase()) {
      skillMatches.push({
        pattern: skill.id.toLowerCase(),
        skillId: skill.id
      });
    }
    
    // Add aliases
    for (const alias of skill.aliases) {
      skillMatches.push({
        pattern: alias.toLowerCase(),
        skillId: skill.id
      });
    }
  }
  
  // Sort by length (longest first) to match "JavaScript" before "Java"
  skillMatches.sort((a, b) => b.pattern.length - a.pattern.length);
  
  // Find matches using word boundaries
  for (const { pattern, skillId } of skillMatches) {
    // Use word boundary regex to match whole words only
    const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text) && !seen.has(skillId)) {
      extractedSkills.push(skillId);
      seen.add(skillId);
    }
  }
  
  return extractedSkills;
}

/**
 * Detect file type from file extension and MIME type
 */
function detectFileType(file: File): 'pdf' | 'docx' | 'txt' | 'doc' | 'unknown' {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  // Check by extension first (more reliable)
  if (fileName.endsWith('.pdf')) {
    return 'pdf';
  }
  if (fileName.endsWith('.docx')) {
    return 'docx';
  }
  if (fileName.endsWith('.doc')) {
    return 'doc'; // Old Word format - not supported but we can detect it
  }
  if (fileName.endsWith('.txt') || fileName.endsWith('.text')) {
    return 'txt';
  }
  
  // Check by MIME type as fallback
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'docx';
  }
  if (mimeType === 'application/msword') {
    return 'doc'; // Old Word format
  }
  if (mimeType === 'text/plain' || mimeType.startsWith('text/')) {
    return 'txt';
  }
  
  return 'unknown';
}

/**
 * Parse a resume file and extract skills
 */
export async function parseResume(file: File, skills: Skill[]): Promise<string[]> {
  let text = '';
  const fileType = detectFileType(file);
  
  try {
    // Handle unsupported formats with helpful messages
    if (fileType === 'doc') {
      throw new Error(
        'Old Word format (.doc) is not supported. Please save your resume as a .docx file or export it as PDF.'
      );
    }
    
    if (fileType === 'unknown') {
      throw new Error(
        'Unsupported file type. Please upload a PDF, DOCX, or TXT file. ' +
        `Detected file: ${file.name} (${file.type || 'unknown type'})`
      );
    }
    
    // Extract text based on file type
    switch (fileType) {
      case 'pdf':
        text = await extractTextFromPDF(file);
        break;
      case 'docx':
        text = await extractTextFromDOCX(file);
        break;
      case 'txt':
        text = await extractTextFromTXT(file);
        break;
      default:
        throw new Error('Unsupported file type.');
    }
    
    // Validate extracted text
    if (!text || text.trim().length < 20) {
      throw new Error(
        'Could not extract meaningful text from the file. ' +
        'The file may be corrupted, password-protected, or image-based.'
      );
    }
    
    // Extract skills from text
    const extractedSkills = extractSkillsFromText(text, skills);
    
    if (extractedSkills.length === 0) {
      // This is not an error - just means no skills were found
      return [];
    }
    
    return extractedSkills;
  } catch (error) {
    // Re-throw with more context if it's already a detailed error
    if (error instanceof Error && error.message.length > 20) {
      throw error;
    }
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

