import { useState, useEffect } from 'react';
import type { RoleDefinition, Skill, GapAnalysisResult, UserProfile, RecommendedResource, TimelineEvent, JobStatistics, ProjectSuggestion } from '../types';
import { getSkillLabel } from '../utils/gapAnalysis';
import { getRecommendedResources } from '../utils/resourceUtils';
import { generateTimeline } from '../utils/timelineUtils';
import { fetchJobStatistics, getBlsSearchUrl } from '../utils/jobStatsUtils';
import { generateProjectSuggestions } from '../utils/projectUtils';
import { getSchoolCourses } from '../utils/schoolCoursesUtils';
import { useTheme } from '../contexts/ThemeContext';
import './ResultsDashboard.css';

interface ResultsDashboardProps {
  role: RoleDefinition | null;
  skills: Skill[];
  analysisResult: GapAnalysisResult | null;
  userProfile: UserProfile | null;
  userSkills: string[];
  onSkillsChange?: (skills: string[]) => void;
}

type TabType = 'skills' | 'timeline' | 'job-stats' | 'projects';

export function ResultsDashboard({ role, skills, analysisResult, userProfile, userSkills, onSkillsChange }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const [resources, setResources] = useState<RecommendedResource[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [jobStats, setJobStats] = useState<JobStatistics | null>(null);
  const [jobStatsLoading, setJobStatsLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectSuggestion[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const { theme } = useTheme();

  // Load resources when role or analysis changes
  useEffect(() => {
    if (role && analysisResult) {
      const recommendedResources = getRecommendedResources(
        analysisResult.missingSkills,
        skills,
        role
      );
      setResources(recommendedResources);

      // Generate timeline
      const timelineData = generateTimeline(analysisResult, skills, role, 12);
      setTimeline(timelineData);
    }
  }, [role, analysisResult, skills]);

  // Load job statistics when role changes
  useEffect(() => {
    if (role && activeTab === 'job-stats') {
      setJobStatsLoading(true);
      fetchJobStatistics(role)
        .then(stats => {
          setJobStats(stats);
          setJobStatsLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch job statistics:', error);
          setJobStatsLoading(false);
        });
    }
  }, [role, activeTab]);

  // Load project suggestions when role changes
  useEffect(() => {
    if (role && analysisResult && userProfile && activeTab === 'projects') {
      setProjectsLoading(true);
      generateProjectSuggestions(analysisResult, skills, role, userProfile, userSkills)
        .then(suggestions => {
          setProjects(suggestions);
          setProjectsLoading(false);
        })
        .catch(error => {
          console.error('Failed to generate project suggestions:', error);
          setProjectsLoading(false);
        });
    }
  }, [role, analysisResult, userProfile, userSkills, skills, activeTab]);

  if (!role || !analysisResult) {
    return (
      <div className="results-dashboard empty">
        <p className="empty-message">
          {analysisResult === null && role === null
            ? "Select a role and add your skills to see your gap analysis."
            : "Add your skills to see your readiness for this role."}
        </p>
      </div>
    );
  }

  const totalRequired = role.requiredSkills.length;
  const matchedCount = analysisResult.matchedSkills.length;
  const missingCount = analysisResult.missingSkills.length;
  const readinessPercent = analysisResult.readinessPercent;
  const weightedReadinessPercent = analysisResult.weightedReadinessPercent ?? analysisResult.readinessPercent;

  // Get school courses if user is a student
  const schoolCourses = userProfile?.isStudent && userProfile?.school
    ? getSchoolCourses(userProfile.school, role)
    : [];

  return (
    <div className={`results-dashboard ${theme}`}>
      <div className="dashboard-header">
        <div className="role-summary">
          <h2 className="role-name">{role.name}</h2>
          <p className="role-description">{role.description}</p>
        </div>
        <div className="readiness-indicator">
          <div className="readiness-circle">
            <svg viewBox="0 0 120 120" className="circular-progress">
              <circle
                className="progress-ring-background"
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="12"
              />
              <circle
                className="progress-ring"
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#667eea"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - readinessPercent / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="readiness-percentage">
              <span className="percentage-value">{readinessPercent}%</span>
              <span className="percentage-label">Ready</span>
              {weightedReadinessPercent !== readinessPercent && (
                <span className="weighted-readiness" title="Weighted by skill importance">
                  ({weightedReadinessPercent}% weighted)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="skills-summary">
        <div className="summary-stat">
          <span className="stat-value">{totalRequired}</span>
          <span className="stat-label">Total Required</span>
        </div>
        <div className="summary-stat matched">
          <span className="stat-value">{matchedCount}</span>
          <span className="stat-label">You Have</span>
        </div>
        <div className="summary-stat missing">
          <span className="stat-value">{missingCount}</span>
          <span className="stat-label">To Learn</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills & Resources
        </button>
        <button
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Learning Timeline
        </button>
        <button
          className={`tab-button ${activeTab === 'job-stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('job-stats')}
        >
          Job Statistics
        </button>
        <button
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Suggested Projects
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'skills' && (
          <SkillsTab
            analysisResult={analysisResult}
            skills={skills}
            resources={resources}
            schoolCourses={schoolCourses}
            userProfile={userProfile}
            onSkillsChange={onSkillsChange}
            userSkills={userSkills}
            role={role}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab timeline={timeline} />
        )}

        {activeTab === 'job-stats' && (
          <JobStatsTab
            role={role}
            jobStats={jobStats}
            loading={jobStatsLoading}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            projects={projects}
            loading={projectsLoading}
            role={role}
          />
        )}
      </div>
    </div>
  );
}

// Skills & Resources Tab
function SkillsTab({
  analysisResult,
  skills,
  resources,
  schoolCourses,
  userProfile,
  onSkillsChange,
  userSkills,
  role,
}: {
  analysisResult: GapAnalysisResult;
  skills: Skill[];
  resources: RecommendedResource[];
  schoolCourses: ReturnType<typeof getSchoolCourses>;
  userProfile: UserProfile | null;
  onSkillsChange?: (skills: string[]) => void;
  userSkills: string[];
  role: RoleDefinition;
}) {
  const matchedCount = analysisResult.matchedSkills.length;
  const missingCount = analysisResult.missingSkills.length;
  
  // Use role to ensure it's not considered unused
  void role;

  const handleSkillClick = (skillId: string, isMatched: boolean) => {
    if (!onSkillsChange) return;
    
    if (isMatched) {
      // Remove from user skills (move to missing)
      const newSkills = userSkills.filter(id => id !== skillId);
      onSkillsChange(newSkills);
    } else {
      // Add to user skills (move to matched)
      if (!userSkills.includes(skillId)) {
        onSkillsChange([...userSkills, skillId]);
      }
    }
  };

  return (
    <div className="skills-tab">
      <div className="skills-comparison">
        <div className="skills-section matched-skills">
          <h3 className="section-title">
            ✓ Skills You Already Have ({matchedCount})
          </h3>
          {matchedCount > 0 ? (
            <div className="skills-list">
              {analysisResult.matchedSkills.map(skillId => (
                <span 
                  key={skillId} 
                  className="skill-badge matched clickable-skill"
                  onClick={() => handleSkillClick(skillId, true)}
                  title="Click to move to 'Skills You Need to Learn'"
                >
                  {getSkillLabel(skillId, skills)}
                </span>
              ))}
            </div>
          ) : (
            <p className="empty-skills-message">
              Everyone starts somewhere. Pick a role and we'll show you what to learn first.
            </p>
          )}
        </div>

        <div className="skills-section missing-skills">
          <h3 className="section-title">
            📚 Skills You Need to Learn ({missingCount})
          </h3>
          {missingCount > 0 ? (
            <div className="missing-skills-by-category">
              {(['language', 'framework', 'tool', 'soft'] as const).map(category => {
                const categorySkills = analysisResult.missingSkillsByCategory[category];
                if (categorySkills.length === 0) return null;

                const categoryLabels: Record<typeof category, string> = {
                  language: 'Programming Languages',
                  framework: 'Frameworks & Libraries',
                  tool: 'Tools & Platforms',
                  soft: 'Soft Skills'
                };

                return (
                  <div key={category} className="category-group">
                    <h4 className="category-title">{categoryLabels[category]}</h4>
                    <div className="skills-list">
                      {categorySkills.map(skillId => (
                        <span 
                          key={skillId} 
                          className="skill-badge missing clickable-skill"
                          onClick={() => handleSkillClick(skillId, false)}
                          title="Click to move to 'Skills You Already Have'"
                        >
                          {getSkillLabel(skillId, skills)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-skills-message success">
              🎉 Congratulations! You have all the required skills for this role.
            </p>
          )}
        </div>
      </div>

      {/* School Courses (if student) - Show first for students */}
      {userProfile?.isStudent && schoolCourses.length > 0 && (
        <div className="school-courses-section featured">
          <h3 className="section-title">🎓 Recommended Courses from {userProfile.school}</h3>
          <p className="section-subtitle">Enroll in these courses at your university to build the skills you need</p>
          <div className="courses-list">
            {schoolCourses.map((course, index) => (
              <div key={index} className="course-card">
                <div className="course-code">{course.code}</div>
                <div className="course-content">
                  <h4 className="course-name">{course.name}</h4>
                  <p className="course-description">{course.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Resources */}
      <div className="resources-section">
        <h3 className="section-title">
          {userProfile?.isStudent ? '📖 Additional Learning Resources' : '📖 Recommended Learning Resources'}
        </h3>
        {resources.length > 0 ? (
          <div className="resources-list">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-card"
              >
                <div className="resource-icon">
                  {resource.type === 'roadmap' ? '🗺️' : '🔍'}
                </div>
                <div className="resource-content">
                  <h4 className="resource-title">{resource.title}</h4>
                  {resource.description && (
                    <p className="resource-description">{resource.description}</p>
                  )}
                  <span className="resource-type">{resource.type === 'roadmap' ? 'Roadmap.sh' : 'Web Search'}</span>
                </div>
                <div className="resource-arrow">→</div>
              </a>
            ))}
          </div>
        ) : (
          <p className="empty-message">No resources available at this time.</p>
        )}
      </div>
    </div>
  );
}

// Timeline Tab
function TimelineTab({ timeline }: { timeline: TimelineEvent[] }) {
  return (
    <div className="timeline-tab">
      <h3 className="section-title">📅 Your Personalized Learning Timeline</h3>
      <p className="timeline-description">
        Follow this timeline to systematically learn the skills you need. Each milestone represents a key learning goal.
      </p>
      <div className="timeline-container">
        {timeline.map((event, index) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <div className="timeline-dot" />
              {index < timeline.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <div className="timeline-month">Month {event.month}</div>
              <h4 className="timeline-event-title">{event.skillName}</h4>
              <p className="timeline-event-description">{event.description}</p>
              {event.completed && (
                <span className="timeline-completed">✓ Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Job Statistics Tab
function JobStatsTab({
  role,
  jobStats,
  loading,
}: {
  role: RoleDefinition;
  jobStats: JobStatistics | null;
  loading: boolean;
}) {
  const blsUrl = getBlsSearchUrl(role);

  return (
    <div className="job-stats-tab">
      <h3 className="section-title">💼 Job Market Statistics for {role.name}</h3>
      <p className="stats-description">
        Data from the Bureau of Labor Statistics (BLS). These statistics provide insight into the job market for this role.
      </p>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading job statistics...</p>
        </div>
      ) : jobStats ? (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <h4 className="stat-card-title">Median Pay</h4>
            <p className="stat-card-value">{jobStats.medianPay}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <h4 className="stat-card-title">Number of Jobs</h4>
            <p className="stat-card-value">{jobStats.numberOfJobs}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <h4 className="stat-card-title">Job Outlook</h4>
            <p className="stat-card-value">{jobStats.jobOutlook}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📉</div>
            <h4 className="stat-card-title">Employment Change</h4>
            <p className="stat-card-value">{jobStats.employmentChange}</p>
          </div>
        </div>
      ) : (
        <div className="error-state">
          <p>Unable to load job statistics at this time.</p>
        </div>
      )}

      <div className="bls-link">
        <a href={blsUrl} target="_blank" rel="noopener noreferrer" className="bls-button">
          View Full Statistics on BLS.gov →
        </a>
      </div>

      {jobStats?.lastUpdated && (
        <p className="stats-updated">Last updated: {new Date(jobStats.lastUpdated).toLocaleDateString()}</p>
      )}
    </div>
  );
}

// Projects Tab
function ProjectsTab({
  projects,
  loading,
  role,
}: {
  projects: ProjectSuggestion[];
  loading: boolean;
  role: RoleDefinition;
}) {
  return (
    <div className="projects-tab">
      <h3 className="section-title">🚀 Suggested Projects for {role.name}</h3>
      <p className="projects-description">
        These projects are tailored to help you learn the skills you need while building your portfolio. Start with beginner projects and work your way up.
      </p>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Generating project suggestions...</p>
        </div>
      ) : projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-header">
                <h4 className="project-name">{project.name}</h4>
                <span className={`project-difficulty ${project.difficulty}`}>
                  {project.difficulty}
                </span>
              </div>
              <p className="project-description">{project.description}</p>
              {project.skills.length > 0 && (
                <div className="project-skills">
                  <strong>Skills:</strong>{' '}
                  {project.skills.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="error-state">
          <p>No project suggestions available at this time.</p>
          <p className="hint">Make sure your OpenAI API key is configured in projectUtils.ts</p>
        </div>
      )}
    </div>
  );
}
