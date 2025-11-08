import { useState } from 'react';
import type { Skill } from '../types';
import { parseLinkedInURL, parseLinkedInText } from '../utils/linkedinParser';
import './LinkedInParser.css';

interface LinkedInParserProps {
  skills: Skill[];
  onSkillsExtracted: (skills: string[]) => void;
  existingSkills: string[];
}

type ParserMode = 'url' | 'text';

export function LinkedInParser({ skills, onSkillsExtracted, existingSkills }: LinkedInParserProps) {
  const [mode, setMode] = useState<ParserMode>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleURLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!urlInput.trim()) {
      setError('Please enter a LinkedIn profile URL.');
      return;
    }

    setError(null);
    setSuccess(false);
    setIsProcessing(true);

    // Wrap in a promise to ensure all errors are caught
    try {
      // Use Promise.resolve to ensure we're in a proper async context
      const extractedSkills = await Promise.resolve(parseLinkedInURL(urlInput.trim(), skills)).catch((err) => {
        // Re-throw with better error message
        throw err;
      });
      
      // Only proceed if we got skills
      if (extractedSkills && extractedSkills.length > 0) {
        handleSkillsExtracted(extractedSkills);
      } else {
        setError('No skills found in the LinkedIn profile. Please use the "Paste Text" tab and copy text from your profile.');
        setSuccess(false);
      }
    } catch (err) {
      // Ensure error doesn't cause navigation or page reload
      console.error('LinkedIn parsing error:', err);
      
      // Prevent any errors from propagating
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse LinkedIn profile.';
      
      // Set error message without throwing
      setError(
        errorMessage + ' LinkedIn profiles are often not publicly accessible. Please use the "Paste Text" tab for more reliable results.'
      );
      setSuccess(false);
      
      // Ensure we don't propagate the error
      return;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!textInput.trim()) {
      setError('Please paste text from your LinkedIn profile.');
      return;
    }

    setError(null);
    setSuccess(false);
    setIsProcessing(true);

    try {
      // Parse is synchronous, so we can do it directly
      const extractedSkills = parseLinkedInText(textInput.trim(), skills);
      
      // Handle the extracted skills
      if (extractedSkills && extractedSkills.length > 0) {
        handleSkillsExtracted(extractedSkills);
        setTextInput(''); // Clear input on success
      } else {
        setError('No skills found in the pasted text. Please make sure you copied text that contains technical skills.');
        setSuccess(false);
      }
    } catch (err) {
      // Ensure error doesn't cause navigation or page reload
      console.error('LinkedIn text parsing error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse LinkedIn text.';
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkillsExtracted = (extractedSkills: string[]) => {
    try {
      if (!extractedSkills || extractedSkills.length === 0) {
        setError('No skills found in the LinkedIn profile. Please make sure your profile contains technical skills.');
        setSuccess(false);
        return;
      }

      // Filter out skills that are already added
      const newSkills = extractedSkills.filter(skill => !existingSkills.includes(skill));
      
      if (newSkills.length > 0) {
        // Safely call the callback
        try {
          onSkillsExtracted([...existingSkills, ...newSkills]);
          setSuccess(true);
          setError(null);
        } catch (err) {
          console.error('Error updating skills:', err);
          setError('Failed to update skills. Please try again.');
          setSuccess(false);
        }
      } else {
        setError('All skills from your LinkedIn profile are already added.');
        setSuccess(false);
      }
    } catch (err) {
      console.error('Error in handleSkillsExtracted:', err);
      setError('An error occurred while processing skills. Please try again.');
      setSuccess(false);
    }
  };

  const handleModeChange = (newMode: ParserMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="linkedin-parser-container">
      <div className="linkedin-parser-header">
        <h3 className="linkedin-parser-title">Import from LinkedIn</h3>
        <p className="linkedin-parser-description">
          Extract skills from your LinkedIn profile automatically
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="linkedin-parser-tabs">
        <button
          type="button"
          className={`linkedin-parser-tab ${mode === 'text' ? 'active' : ''}`}
          onClick={() => handleModeChange('text')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Paste Text
        </button>
        <button
          type="button"
          className={`linkedin-parser-tab ${mode === 'url' ? 'active' : ''}`}
          onClick={() => handleModeChange('url')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Profile URL
        </button>
      </div>

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="linkedin-parser-form">
          <div className="linkedin-parser-input-group">
            <label htmlFor="linkedin-url" className="linkedin-parser-label">
              LinkedIn Profile URL
            </label>
            <input
              id="linkedin-url"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.linkedin.com/in/yourprofile"
              className="linkedin-parser-input"
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing && urlInput.trim()) {
                  e.preventDefault();
                  e.stopPropagation();
                  const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent<HTMLFormElement>;
                  handleURLSubmit(fakeEvent);
                }
              }}
            />
            <p className="linkedin-parser-hint">
              Enter your LinkedIn profile URL. Note: Due to LinkedIn's restrictions, this may not work. 
              Use the "Paste Text" method for more reliable results.
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent<HTMLFormElement>;
              handleURLSubmit(fakeEvent);
            }}
            disabled={isProcessing || !urlInput.trim()}
            className="linkedin-parser-submit-button"
          >
            {isProcessing ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Extract Skills
              </>
            )}
          </button>
        </div>
      )}

      {/* Text Mode */}
      {mode === 'text' && (
        <div className="linkedin-parser-form">
          <div className="linkedin-parser-input-group">
            <label htmlFor="linkedin-text" className="linkedin-parser-label">
              Paste LinkedIn Profile Text
            </label>
            <textarea
              id="linkedin-text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste text from your LinkedIn profile here. You can copy text from your Skills section, Experience section, or About section..."
              className="linkedin-parser-textarea"
              rows={6}
              disabled={isProcessing}
              onKeyDown={(e) => {
                // Prevent any accidental form submissions or navigation
                // Allow Enter for new lines, but Ctrl+Enter or Cmd+Enter to submit
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isProcessing && textInput.trim()) {
                    handleTextSubmit(e);
                  }
                }
                // Prevent any other key combinations that might cause issues
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                  // Allow normal Enter for new lines in textarea
                  // Do nothing - let the default behavior happen (new line)
                }
              }}
            />
            <p className="linkedin-parser-hint">
              Tip: Go to your LinkedIn profile, select and copy text from your Skills, Experience, or About sections, then paste it here. Press Ctrl+Enter (or Cmd+Enter on Mac) to extract skills.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={isProcessing || !textInput.trim()}
            className="linkedin-parser-submit-button"
          >
            {isProcessing ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Extract Skills
              </>
            )}
          </button>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="linkedin-parser-message linkedin-parser-error" role="alert">
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
        <div className="linkedin-parser-message linkedin-parser-success" role="status">
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
          Skills extracted successfully from your LinkedIn profile!
        </div>
      )}
    </div>
  );
}

