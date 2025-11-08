import type { Skill, RecommendedResource, RoleDefinition } from '../types';

/**
 * Get roadmap.sh URL for a specific skill or role
 */
export function getRoadmapUrl(skillName: string, role?: RoleDefinition): string {
  // Map common skills to roadmap.sh paths
  const roadmapMap: Record<string, string> = {
    'frontend': 'frontend',
    'backend': 'backend',
    'fullstack': 'full-stack',
    'react': 'react',
    'nodejs': 'nodejs',
    'python': 'python',
    'devops': 'devops',
    'javascript': 'javascript',
    'html': 'frontend',
    'css': 'frontend',
    'database': 'database',
    'data-analyst': 'data-analyst',
  };

  // Try to match role first
  if (role) {
    const roleMap: Record<string, string> = {
      'frontend-dev': 'frontend',
      'backend-dev': 'backend',
      'fullstack-dev': 'full-stack',
      'junior-web-dev': 'frontend',
      'data-analyst': 'data-analyst',
      'devops-engineer': 'devops',
      'python-dev': 'python',
      'database-admin': 'database',
    };
    if (roleMap[role.id]) {
      return `https://roadmap.sh/${roleMap[role.id]}`;
    }
  }

  // Try to match skill
  const normalizedSkill = skillName.toLowerCase();
  for (const [key, path] of Object.entries(roadmapMap)) {
    if (normalizedSkill.includes(key)) {
      return `https://roadmap.sh/${path}`;
    }
  }

  // Default to general frontend if web-related
  if (normalizedSkill.includes('web') || normalizedSkill.includes('html') || normalizedSkill.includes('css')) {
    return 'https://roadmap.sh/frontend';
  }

  // Default search URL
  return `https://www.google.com/search?q=${encodeURIComponent(skillName + ' learning resources tutorial')}`;
}

/**
 * Generate recommended resources for missing skills
 */
export function getRecommendedResources(
  missingSkills: string[],
  skills: Skill[],
  role?: RoleDefinition
): RecommendedResource[] {
  const resources: RecommendedResource[] = [];

  // Add role-specific roadmap if available
  if (role) {
    const roadmapUrl = getRoadmapUrl(role.name, role);
    if (roadmapUrl.includes('roadmap.sh')) {
      resources.push({
        title: `${role.name} Roadmap`,
        url: roadmapUrl,
        type: 'roadmap',
        description: `Complete learning path for ${role.name}`,
      });
    }
  }

  // Add resources for top missing skills (limit to 5)
  const topSkills = missingSkills.slice(0, 5);
  for (const skillId of topSkills) {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      const roadmapUrl = getRoadmapUrl(skill.label, role);
      if (roadmapUrl.includes('roadmap.sh')) {
        resources.push({
          title: `Learn ${skill.label}`,
          url: roadmapUrl,
          type: 'roadmap',
          description: `Roadmap for ${skill.label}`,
        });
      } else {
        resources.push({
          title: `Learn ${skill.label}`,
          url: roadmapUrl,
          type: 'web-search',
          description: `Search for ${skill.label} learning resources`,
        });
      }
    }
  }

  return resources;
}

/**
 * Get web search URL for a skill
 */
export function getWebSearchUrl(skillName: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(skillName + ' tutorial course learn')}`;
}

