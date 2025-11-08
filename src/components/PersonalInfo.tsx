import { useState } from 'react';
import type { Skill, RoleDefinition, UserProfile } from '../types';
import collegesData from '../data/colleges.json';
import { useTheme } from '../contexts/ThemeContext';
import './PersonalInfo.css';

interface PersonalInfoProps {
  skills: Skill[];
  roles: RoleDefinition[];
  onComplete: (profile: UserProfile) => void;
}

export function PersonalInfo({ roles, onComplete }: PersonalInfoProps) {
  const [name, setName] = useState('');
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [school, setSchool] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<UserProfile['experienceLevel']>('other');
  const [dreamRoleId, setDreamRoleId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  // Sort colleges alphabetically (case-insensitive)
  const colleges = [...(collegesData as string[])].sort((a, b) => 
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  const { theme, setUniversityColors } = useTheme();

  // Apply university colors when school changes (for preview)
  const handleSchoolChange = (newSchool: string) => {
    setSchool(newSchool);
    // Only apply colors if user is a student
    if (newSchool && isStudent) {
      setUniversityColors(newSchool);
    } else if (!newSchool) {
      // Reset to default if school is cleared
      setUniversityColors(null);
    }
  };

  // Reset colors when isStudent changes
  const handleStudentStatusChange = (student: boolean) => {
    setIsStudent(student);
    if (!student) {
      setSchool('');
      setUniversityColors(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      name: name.trim() || undefined,
      isStudent,
      school: isStudent ? (school.trim() || undefined) : undefined,
      graduationYear: graduationYear.trim() || undefined,
      experienceLevel,
      dreamRole: dreamRoleId || undefined,
      skills: [], // Skills will be added in the next step
    };
    // Ensure university colors are set before completing
    if (profile.school) {
      setUniversityColors(profile.school);
    } else {
      setUniversityColors(null);
    }
    onComplete(profile);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      // Step 1: Basic info - all optional, can always proceed
      return true;
    }
    if (currentStep === 2) {
      // Step 2: Occupation selection is mandatory
      return dreamRoleId !== null;
    }
    return false;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={`personal-info-page ${theme}`}>
      <div className="personal-info-container">
        <div className="personal-info-header">
          <h1 className="personal-info-title">Tell Us About Yourself</h1>
          <p className="personal-info-subtitle">
            Help us create a personalized career path just for you
          </p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="step-indicator">Step {currentStep} of {totalSteps}</p>
        </div>

        <form className="personal-info-form" onSubmit={handleSubmit}>
          {/* Step 1: Basic Info - OPTIONAL */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2 className="step-title">Tell Us About Yourself</h2>
              <p className="step-description">
                All fields are optional. Share information to get more personalized recommendations.
              </p>

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name <span className="optional">(optional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="isStudent" className="form-label">
                  Are you currently a student?
                </label>
                <select
                  id="isStudent"
                  value={isStudent ? 'yes' : 'no'}
                  onChange={(e) => {
                    const studentStatus = e.target.value === 'yes';
                    handleStudentStatusChange(studentStatus);
                    if (!studentStatus) {
                      setExperienceLevel('other');
                    } else {
                      setExperienceLevel('student');
                    }
                  }}
                  className="form-select"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              {isStudent && (
                <>
                  <div className="form-group">
                    <label htmlFor="school" className="form-label">
                      School or University <span className="optional">(optional)</span>
                    </label>
                    <select
                      id="school"
                      value={school}
                      onChange={(e) => handleSchoolChange(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select your school (optional)...</option>
                      {colleges.map((college, index) => (
                        <option key={index} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="graduationYear" className="form-label">
                      Graduation Year <span className="optional">(optional)</span>
                    </label>
                    <input
                      id="graduationYear"
                      type="text"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="e.g., 2024, 2025"
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="experienceLevel" className="form-label">
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as UserProfile['experienceLevel'])}
                  className="form-select"
                  disabled={isStudent}
                >
                  <option value="student">Current Student</option>
                  <option value="recent-grad">Recent Graduate</option>
                  <option value="career-switcher">Career Switcher</option>
                  <option value="other">Other</option>
                </select>
                {isStudent && (
                  <p className="form-hint">Experience level is set to "Current Student"</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Dream Role (Occupation) - MANDATORY */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2 className="step-title">Select Your Dream Role</h2>
              <p className="step-description">
                Choose the role you're most interested in. We'll analyze your skills and create a personalized learning path.
              </p>
              <div className="roles-grid-compact">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className={`role-card-compact ${dreamRoleId === role.id ? 'selected' : ''}`}
                    onClick={() => setDreamRoleId(role.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDreamRoleId(role.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={dreamRoleId === role.id}
                  >
                    <h3 className="role-card-compact-title">{role.name}</h3>
                    <p className="role-card-compact-description">{role.description}</p>
                    {dreamRoleId === role.id && (
                      <div className="role-selected-indicator-compact">✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
              >
                ← Back
              </button>
            )}
            <div className="navigation-spacer" />
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn btn-primary"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canProceed()}
                className="btn btn-primary btn-large"
              >
                Continue →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

