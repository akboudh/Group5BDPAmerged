import { useState, useRef, useEffect } from 'react';
import type { Skill } from '../types';
import { ResumeParser } from './ResumeParser';
import { LinkedInParser } from './LinkedInParser';
import './SkillsInput.css';

interface SkillsInputProps {
  skills: Skill[];
  userSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function SkillsInput({ skills, userSkills, onSkillsChange }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Skill[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const normalizedInput = inputValue.toLowerCase().trim();
      const filtered = skills.filter(skill => {
        const matchesLabel = skill.label.toLowerCase().includes(normalizedInput);
        const matchesAlias = skill.aliases.some(alias => 
          alias.toLowerCase().includes(normalizedInput)
        );
        const notAlreadyAdded = !userSkills.includes(skill.id);
        return (matchesLabel || matchesAlias) && notAlreadyAdded;
      }).slice(0, 8); // Limit to 8 suggestions
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, skills, userSkills]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddSkill = (skillId?: string) => {
    const skillToAdd = skillId || inputValue.trim();
    if (skillToAdd && !userSkills.includes(skillToAdd)) {
      onSkillsChange([...userSkills, skillToAdd]);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Try to match with a suggestion first
      if (suggestions.length > 0) {
        handleAddSkill(suggestions[0].id);
      } else {
        handleAddSkill();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onSkillsChange(userSkills.filter(skill => skill !== skillToRemove));
  };

  const handleClearAll = () => {
    onSkillsChange([]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (skill: Skill) => {
    handleAddSkill(skill.id);
  };

  return (
    <div className="skills-input-container">
      <div className="skills-input-wrapper">
        <label htmlFor="skill-input" className="skills-label">
          Your Skills
        </label>
        <div className="input-with-suggestions">
          <div className="skills-chips-container">
            {userSkills.map(skill => {
              const skillData = skills.find(s => s.id === skill);
              const displayName = skillData?.label || skill;
              return (
                <span key={skill} className="skill-chip">
                  {displayName}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="chip-remove"
                    aria-label={`Remove ${displayName}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <input
              ref={inputRef}
              id="skill-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder={userSkills.length === 0 ? "Type a skill and press Enter..." : ""}
              className="skill-input"
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="suggestions-dropdown">
              {suggestions.map(skill => (
                <div
                  key={skill.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(skill)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSuggestionClick(skill);
                    }
                  }}
                  tabIndex={0}
                  role="option"
                >
                  {skill.label}
                  <span className="suggestion-category">{skill.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {userSkills.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="clear-all-button"
          >
            Clear All
          </button>
        )}
      </div>
      <p className="input-hint">
        Start typing to see suggestions. Press Enter to add a skill.
      </p>
      <ResumeParser
        skills={skills}
        onSkillsExtracted={onSkillsChange}
        existingSkills={userSkills}
      />
      <LinkedInParser
        skills={skills}
        onSkillsExtracted={onSkillsChange}
        existingSkills={userSkills}
      />
    </div>
  );
}

