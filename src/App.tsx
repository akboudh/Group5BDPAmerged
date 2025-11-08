import { useState, useEffect } from 'react';
import type { Skill, RoleDefinition, LearningResource, GapAnalysisResult, UserProfile } from './types';
import { loadSkills, loadRoles, loadResources } from './utils/dataLoader';
import { analyzeGaps } from './utils/gapAnalysis';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AspyrLanding } from './components/AspyrLanding';
import { PersonalInfo } from './components/PersonalInfo';
import { SkillsInput } from './components/SkillsInput';
import { RoleSelection } from './components/RoleSelection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LearningPath } from './components/LearningPath';
import { Chatbot } from './components/Chatbot';
import './App.css';

type AppStep = 'landing' | 'personal-info' | 'skills' | 'dashboard';

function AppContent() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const { theme, setUniversityColors } = useTheme();

  // Load data on mount
  useEffect(() => {
    setSkills(loadSkills());
    setRoles(loadRoles());
    setResources(loadResources());
  }, []);

  // Handle landing page start
  const handleLandingStart = () => {
    setCurrentStep('personal-info');
  };

  // Handle personal info completion
  const handlePersonalInfoComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    if (profile.dreamRole) {
      setSelectedRoleId(profile.dreamRole);
    } else if (profile.targetRoleId) {
      setSelectedRoleId(profile.targetRoleId);
    }
    setUserSkills(profile.skills || []);
    
    // Apply university colors if school is selected
    if (profile.school) {
      setUniversityColors(profile.school);
    } else {
      setUniversityColors(null);
    }
    
    setCurrentStep('skills');
  };

  // Handle skills completion - move to dashboard
  const handleSkillsComplete = () => {
    if (userSkills.length > 0) {
      setCurrentStep('dashboard');
    }
  };

  // Handle start over - reset everything and go back to landing
  const handleStartOver = () => {
    setUserProfile(null);
    setUserSkills([]);
    setSelectedRoleId(null);
    setAnalysisResult(null);
    setUniversityColors(null); // Reset to default colors
    setCurrentStep('landing');
  };

  // Handle change role - just reset the role selection, keep everything else
  const handleChangeRole = () => {
    setSelectedRoleId(null);
    // Keep userProfile, userSkills, and everything else intact
    // This will show the role selection component while keeping all data
  };

  // Update user profile skills when skills change
  useEffect(() => {
    if (userProfile && userSkills.length > 0) {
      setUserProfile({ ...userProfile, skills: userSkills });
    }
  }, [userSkills]);

  // Perform gap analysis when skills or role changes
  useEffect(() => {
    if (selectedRoleId && userSkills.length >= 0) {
      const role = roles.find(r => r.id === selectedRoleId);
      if (role && skills.length > 0) {
        const result = analyzeGaps(userSkills, role, skills);
        setAnalysisResult(result);
        // Don't auto-advance - let user manually proceed to dashboard
      } else {
        setAnalysisResult(null);
      }
    } else {
      setAnalysisResult(null);
    }
  }, [userSkills, selectedRoleId, roles, skills]);

  const selectedRole = roles.find(r => r.id === selectedRoleId) || null;

  // Render based on current step
  if (currentStep === 'landing') {
    return <AspyrLanding onStart={handleLandingStart} />;
  }

  if (currentStep === 'personal-info') {
    return (
      <PersonalInfo
        skills={skills}
        roles={roles}
        onComplete={handlePersonalInfoComplete}
      />
    );
  }

  if (currentStep === 'skills') {
    return (
      <div className={`app skills-page ${theme}`}>
        <div className="skills-page-container">
          <div className="skills-page-header">
            <h1 className="skills-page-title">Add Your Skills</h1>
            <p className="skills-page-subtitle">
              Add your skills manually, upload your resume, or import from LinkedIn
            </p>
          </div>

          <div className="skills-page-content">
            <SkillsInput
              skills={skills}
              userSkills={userSkills}
              onSkillsChange={setUserSkills}
            />

            <div className="skills-page-actions">
              <button
                className="btn-primary-large"
                onClick={handleSkillsComplete}
                disabled={userSkills.length === 0 || !selectedRoleId}
              >
                Continue to Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className={`app ${theme}`}>
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">CareerPath Gap Analyzer</h1>
          <p className="app-subtitle">
            {userProfile?.name && `Welcome, ${userProfile.name}! `}
            Your personalized career path analyzer
          </p>
          {userProfile?.school && (
            <p className="app-user-info">
              {userProfile.school}
              {userProfile.graduationYear && ` • Class of ${userProfile.graduationYear}`}
            </p>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="app-content">
            {!selectedRole && (
              <section className="role-section">
                <RoleSelection
                  roles={roles}
                  selectedRoleId={selectedRoleId}
                  onRoleSelect={setSelectedRoleId}
                />
              </section>
            )}

            {selectedRole && (
              <>
                <section className="results-section">
                  <ResultsDashboard
                    role={selectedRole}
                    skills={skills}
                    analysisResult={analysisResult}
                    userProfile={userProfile}
                    userSkills={userSkills}
                    onSkillsChange={setUserSkills}
                    onStartOver={handleStartOver}
                    onChangeRole={handleChangeRole}
                  />
                </section>

                {analysisResult && analysisResult.missingSkills.length > 0 && (
                  <section className="learning-path-section">
                    <LearningPath
                      skills={skills}
                      resources={resources}
                      analysisResult={analysisResult}
                      role={selectedRole}
                    />
                  </section>
                )}
              </>
            )}

            {!selectedRole && (
              <section className="empty-state">
                <div className="empty-state-content">
                  <h2>Get Started</h2>
                  <p>Select a target role above to see your gap analysis and personalized learning path.</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>CareerPath Gap Analyzer - Built for BDPA Indianapolis Hackathon</p>
          <p className="footer-attribution">
            Learning resources powered by{' '}
            <a
              href="https://roadmap.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              roadmap.sh
            </a>
          </p>
        </div>
      </footer>

      {/* Chatbot - Always available on dashboard */}
      {skills.length > 0 && (
        <Chatbot
          userProfile={userProfile || { skills: userSkills }}
          userSkills={userSkills}
          selectedRole={selectedRole}
          analysisResult={analysisResult}
          skills={skills}
          resources={resources}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
