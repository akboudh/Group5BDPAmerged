// src/types.ts

/** Allowed categories for skills (must match skills.json) */
export type SkillCategory = "language" | "framework" | "tool" | "soft";

/** A single skill definition (from skills.json) */
export interface Skill {
  id: string;              // e.g., "javascript"
  label: string;           // e.g., "JavaScript"
  aliases: string[];       // e.g., ["js", "JS", "ecmascript"]
  category: SkillCategory; // "language" | "framework" | "tool" | "soft"
}

/** Importance level for a role requirement (stricter, as 1 | 2 | 3) */
export type ImportanceLevel = 1 | 2 | 3;

/** Required skill entry in a role (from roles.json) */
export interface RoleSkillRequirement {
  skillId: string;          // references Skill.id
  importance: ImportanceLevel;
}

/** Role definition (from roles.json) */
export interface RoleDefinition {
  id: string;                         // "frontend-dev"
  name: string;                       // "Frontend Developer"
  description: string;
  responsibilities: string[];
  requiredSkills: RoleSkillRequirement[];
}

/** Possible resource "type" values for learning resources */
export type ResourceType =
  | "video"
  | "interactive"
  | "docs"
  | "course"
  | "article"
  | "other";

/** Learning resource definition (from resources.json) */
export interface LearningResource {
  id: string;
  skillId: string;        // references Skill.id
  title: string;
  url: string;
  platform: string;
  type: ResourceType;     // type-safe instead of plain string
}

/**
 * Result returned by the gap analysis engine.
 * All skill IDs here are canonical (Skill.id).
 */
export interface GapAnalysisResult {
  roleId: string;

  /** User skills, normalized to canonical skill IDs */
  normalizedUserSkills: string[];

  /** Required skills that the user already has (skill IDs) */
  matchedSkills: string[];

  /** Required skills that the user is missing (skill IDs) */
  missingSkills: string[];

  /** Simple readiness score based on counts (e.g., 6/10 = 60) */
  readinessPercent: number;

  /** Readiness score weighted by "importance" levels */
  weightedReadinessPercent: number;

  /** Missing skills grouped by category */
  missingSkillsByCategory: Record<SkillCategory, string[]>;
}

/**
 * User profile - merged from all repos
 */
export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  skills?: string[];     // raw skill inputs (e.g., ["html", "css", "js"])
  targetRoleId?: string; // e.g., "frontend-dev"
  dreamRole?: string;    // Alternative role selection
  school?: string;
  graduationYear?: string;
  isStudent?: boolean;
  experienceLevel?: 'student' | 'recent-grad' | 'career-switcher' | 'other';

  // Allow additional fields without type errors
  [key: string]: any;
}

/**
 * Recommended resource (from repo3)
 */
export interface RecommendedResource {
  title: string;
  url: string;
  type: 'roadmap' | 'web-search';
  description?: string;
}

/**
 * Timeline event (from repo3)
 */
export interface TimelineEvent {
  id: string;
  skillId: string;
  skillName: string;
  month: number;
  description: string;
  completed: boolean;
}

/**
 * Job statistics (from repo3)
 */
export interface JobStatistics {
  medianPay: string;
  numberOfJobs: string;
  jobOutlook: string;
  employmentChange: string;
  lastUpdated?: string;
}

/**
 * Project suggestion (from repo3)
 */
export interface ProjectSuggestion {
  name: string;
  description: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * School course (from repo3)
 */
export interface SchoolCourse {
  name: string;
  code: string;
  description: string;
  url?: string;
}

/**
 * Chat message (from repo2)
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * User context for chatbot (from repo2)
 */
export interface UserContext {
  name?: string;
  school?: string;
  graduationYear?: string;
  experienceLevel?: string;
  dreamRole?: string;
  userSkills: string[];
  selectedRole?: {
    id: string;
    name: string;
    description: string;
  };
  gapAnalysis?: {
    readinessPercent: number;
    weightedReadinessPercent?: number;
    matchedSkills: string[];
    missingSkills: string[];
  };
  availableResources?: Array<{
    title: string;
    url: string;
    platform: string;
  }>;
}


