import type { Skill, LearningResource, GapAnalysisResult, RoleDefinition } from '../types';
import { getSkillLabel } from '../utils/gapAnalysis';
import { getRoadmapUrl, hasRoadmapMapping } from '../utils/roadmapMapper';
import './LearningPath.css';

interface LearningPathProps {
  skills: Skill[];
  resources: LearningResource[];
  analysisResult: GapAnalysisResult | null;
  role: RoleDefinition | null;
}

export function LearningPath({
  skills,
  resources,
  analysisResult,
  role
}: LearningPathProps) {
  if (!analysisResult || !role || analysisResult.missingSkills.length === 0) {
    return null;
  }

  // Get resources for a skill (prioritize free resources, especially videos)
  const getResourcesForSkill = (skillId: string): LearningResource[] => {
    const allResources = resources.filter(resource => resource.skillId === skillId);
    
    // Separate by type and platform
    const videoResources = allResources.filter(r => r.type === 'video' && r.platform === 'YouTube');
    const interactiveResources = allResources.filter(r => r.type === 'interactive' && !r.platform.includes('Coursera'));
    const roadmapResources = allResources.filter(r => r.platform === 'roadmap.sh');
    const otherResources = allResources.filter(r => 
      r.type === 'docs' || r.type === 'article' || 
      (r.type === 'interactive' && !interactiveResources.includes(r))
    );
    
    // Prioritize: Videos > Interactive (free) > Docs/Articles > Roadmap.sh
    // Limit to 4-5 resources max
    const prioritizedResources = [
      ...videoResources.slice(0, 2),
      ...interactiveResources.slice(0, 2),
      ...otherResources.slice(0, 1),
      ...roadmapResources.slice(0, 1)
    ].slice(0, 5);
    
    return prioritizedResources;
  };

  // Get resource type icon/emoji
  const getResourceTypeIcon = (type: string, platform?: string): string => {
    if (platform === 'roadmap.sh') {
      return '🗺️'; // Special icon for roadmap.sh
    }
    switch (type) {
      case 'video':
        return '📹';
      case 'interactive':
        return '🎯';
      case 'docs':
        return '📚';
      default:
        return '🔗';
    }
  };

  // Sort missing skills by importance and category priority
  const sortedMissingSkills = [...analysisResult.missingSkills].sort((a, b) => {
    const reqA = role.requiredSkills.find(r => r.skillId === a);
    const reqB = role.requiredSkills.find(r => r.skillId === b);
    const importanceDiff = (reqB?.importance || 0) - (reqA?.importance || 0);
    if (importanceDiff !== 0) return importanceDiff;

    const skillA = skills.find(s => s.id === a);
    const skillB = skills.find(s => s.id === b);
    const categoryOrder: Record<string, number> = {
      language: 0,
      framework: 1,
      tool: 2,
      soft: 3
    };
    const categoryDiff =
      (categoryOrder[skillA?.category || ''] || 99) -
      (categoryOrder[skillB?.category || ''] || 99);
    return categoryDiff;
  });

  return (
    <div className="learning-path-container">
      <h2 className="learning-path-title">Your Learning Path</h2>
      <p className="learning-path-subtitle">
        Recommended resources to help you learn the missing skills for {role.name}
      </p>

      <div className="learning-path-list">
        {sortedMissingSkills.map((skillId, index) => {
          const skillResources = getResourcesForSkill(skillId);
          const skillLabel = getSkillLabel(skillId, skills);
          const skill = skills.find(s => s.id === skillId);

          return (
            <div key={skillId} className="learning-path-item">
              <div className="path-item-header">
                <span className="path-item-number">{index + 1}</span>
                <h3 className="path-item-skill">{skillLabel}</h3>
                {skill && (
                  <span className="path-item-category">{skill.category}</span>
                )}
              </div>

              {skillResources.length > 0 ? (
                <div className="path-item-resources">
                  <p className="resource-instruction">
                    {skillResources.length === 1
                      ? 'Start here:'
                      : 'Recommended learning resources:'}
                  </p>
                  <div className="resources-list">
                    {skillResources.map((resource, resIndex) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`resource-link ${resource.platform === 'roadmap.sh' ? 'roadmap-resource' : ''}`}
                      >
                        <span className="resource-icon">
                          {getResourceTypeIcon(resource.type, resource.platform)}
                        </span>
                        <div className="resource-info">
                          <span className="resource-title">{resource.title}</span>
                          <span className="resource-meta">
                            {resource.platform} • {resource.type}
                            {resource.platform === 'roadmap.sh' && ' • Free Resources'}
                          </span>
                        </div>
                        {resIndex < skillResources.length - 1 && (
                          <span className="resource-arrow">→</span>
                        )}
                      </a>
                    ))}
                  </div>
                  {/* Show roadmap.sh link if available but not in resources */}
                  {!skillResources.some(r => r.platform === 'roadmap.sh') && hasRoadmapMapping(skillId) && (
                    <div className="roadmap-footer">
                      <a
                        href={getRoadmapUrl(skillId) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="roadmap-link"
                      >
                        🗺️ View complete roadmap for {skillLabel} on roadmap.sh →
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="path-item-fallback">
                  {hasRoadmapMapping(skillId) ? (
                    <div>
                      <p>
                        💡 Check out the complete learning roadmap for <strong>{skillLabel}</strong>:
                      </p>
                      <a
                        href={getRoadmapUrl(skillId) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="roadmap-link"
                      >
                        🗺️ View {skillLabel} roadmap on roadmap.sh →
                      </a>
                    </div>
                  ) : (
                    <p>
                      💡 Search for "<strong>{skillLabel} beginner tutorial</strong>" on
                      YouTube or freeCodeCamp to get started.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attribution to roadmap.sh */}
      <div className="learning-path-attribution">
        <p className="attribution-text">
          💡 Learning resources curated from{' '}
          <a
            href="https://roadmap.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="attribution-link"
          >
            roadmap.sh
          </a>
          {' '}— Your guide to becoming a better developer
        </p>
      </div>
    </div>
  );
}

