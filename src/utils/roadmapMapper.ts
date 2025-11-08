// src/utils/roadmapMapper.ts

/**
 * Maps our skill IDs to roadmap.sh roadmap paths and resource pages
 * Roadmap.sh structure: https://roadmap.sh/{roadmap-id}
 */
export interface RoadmapMapping {
  skillId: string;
  roadmapPath?: string; // e.g., "frontend", "backend", "python"
  resourceUrl?: string; // Direct URL to resources page if available
}

/**
 * Mapping of our skills to roadmap.sh roadmaps
 * This allows us to link to relevant roadmap.sh resources
 */
export const roadmapMappings: RoadmapMapping[] = [
  // Frontend Skills
  { skillId: "html", roadmapPath: "frontend", resourceUrl: "https://roadmap.sh/frontend" },
  { skillId: "css", roadmapPath: "frontend", resourceUrl: "https://roadmap.sh/frontend" },
  { skillId: "javascript", roadmapPath: "frontend", resourceUrl: "https://roadmap.sh/frontend" },
  { skillId: "typescript", roadmapPath: "frontend", resourceUrl: "https://roadmap.sh/frontend" },
  { skillId: "react", roadmapPath: "react", resourceUrl: "https://roadmap.sh/react" },
  
  // Backend Skills
  { skillId: "nodejs", roadmapPath: "backend", resourceUrl: "https://roadmap.sh/backend" },
  { skillId: "express", roadmapPath: "backend", resourceUrl: "https://roadmap.sh/backend" },
  { skillId: "python", roadmapPath: "python", resourceUrl: "https://roadmap.sh/python" },
  { skillId: "django", roadmapPath: "python", resourceUrl: "https://roadmap.sh/python" },
  { skillId: "flask", roadmapPath: "python", resourceUrl: "https://roadmap.sh/python" },
  { skillId: "java", roadmapPath: "java", resourceUrl: "https://roadmap.sh/java" },
  
  // Database Skills
  { skillId: "sql", roadmapPath: "postgresql-dba", resourceUrl: "https://roadmap.sh/postgresql-dba" },
  { skillId: "mongodb", roadmapPath: "mongodb", resourceUrl: "https://roadmap.sh/mongodb" },
  { skillId: "postgresql", roadmapPath: "postgresql-dba", resourceUrl: "https://roadmap.sh/postgresql-dba" },
  { skillId: "mysql", roadmapPath: "postgresql-dba", resourceUrl: "https://roadmap.sh/postgresql-dba" },
  
  // DevOps & Tools
  { skillId: "docker", roadmapPath: "devops", resourceUrl: "https://roadmap.sh/devops" },
  { skillId: "aws", roadmapPath: "aws", resourceUrl: "https://roadmap.sh/aws" },
  { skillId: "git", roadmapPath: "frontend", resourceUrl: "https://roadmap.sh/frontend" },
  { skillId: "github", roadmapPath: "frontend", resourceUrl: "https://roadmap.sh/frontend" },
  
  // Data Science
  { skillId: "pandas", roadmapPath: "data-analyst", resourceUrl: "https://roadmap.sh/data-analyst" },
  { skillId: "tableau", roadmapPath: "data-analyst", resourceUrl: "https://roadmap.sh/data-analyst" },
  { skillId: "excel", roadmapPath: "data-analyst", resourceUrl: "https://roadmap.sh/data-analyst" },
];

/**
 * Get roadmap.sh URL for a skill
 */
export function getRoadmapUrl(skillId: string): string | null {
  const mapping = roadmapMappings.find(m => m.skillId === skillId);
  return mapping?.resourceUrl || null;
}

/**
 * Get roadmap path for a skill
 */
export function getRoadmapPath(skillId: string): string | null {
  const mapping = roadmapMappings.find(m => m.skillId === skillId);
  return mapping?.roadmapPath || null;
}

/**
 * Check if a skill has a roadmap.sh mapping
 */
export function hasRoadmapMapping(skillId: string): boolean {
  return roadmapMappings.some(m => m.skillId === skillId);
}

