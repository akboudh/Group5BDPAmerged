import { useState, useRef } from 'react';
import type { Skill } from '../types';
import { parseResume } from '../utils/resumeParser';
import './ResumeParser.css';

interface ResumeParserProps {
  skills: Skill[];
  onSkillsExtracted: (skills: string[]) => void;
  existingSkills: string[];
}

export function ResumeParser({ skills, onSkillsExtracted, existingSkills }: ResumeParserProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - check both extension and MIME type
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    const validExtensions = ['.pdf', '.docx', '.txt', '.text'];
    const validMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/'
    ];
    
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMimeType = validMimeTypes.some(type => 
      fileType === type || (type.endsWith('/') && fileType.startsWith(type))
    );
    
    // Check for unsupported formats
    if (fileName.endsWith('.doc')) {
      setError('Old Word format (.doc) is not supported. Please save your resume as .docx or export as PDF.');
      setSuccess(false);
      return;
    }
    
    if (!hasValidExtension && !hasValidMimeType) {
      setError(
        `Unsupported file type. Please upload a PDF, DOCX, or TXT file. ` +
        `Detected: ${file.name} (${file.type || 'unknown type'})`
      );
      setSuccess(false);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      setSuccess(false);
      return;
    }

    setError(null);
    setSuccess(false);
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const extractedSkills = await parseResume(file, skills);
      
      if (extractedSkills.length === 0) {
        setError('No skills found in the resume. Please make sure your resume contains technical skills.');
        setSuccess(false);
      } else {
        // Filter out skills that are already added
        const newSkills = extractedSkills.filter(skill => !existingSkills.includes(skill));
        
        if (newSkills.length > 0) {
          onSkillsExtracted([...existingSkills, ...newSkills]);
          setSuccess(true);
          setError(null);
        } else {
          setError('All skills from your resume are already added.');
          setSuccess(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resume. Please try again.');
      setSuccess(false);
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="resume-parser-container">
      <div className="resume-parser-header">
        <h3 className="resume-parser-title">Upload Resume</h3>
        <p className="resume-parser-description">
          Upload your resume (PDF, DOCX, or TXT) to automatically extract your skills
        </p>
      </div>
      
      <div className="resume-parser-upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.text,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/*"
          onChange={handleFileSelect}
          className="resume-parser-input"
          id="resume-upload"
          disabled={isProcessing}
          aria-label="Upload resume file"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="resume-parser-button"
        >
          {isProcessing ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Choose File
            </>
          )}
        </button>
        
        {fileName && !isProcessing && (
          <span className="resume-parser-filename" title={fileName}>
            {fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName}
          </span>
        )}
      </div>

      {error && (
        <div className="resume-parser-message resume-parser-error" role="alert">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="resume-parser-message resume-parser-success" role="status">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Skills extracted successfully from your resume!
        </div>
      )}
    </div>
  );
}

