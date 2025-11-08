// src/utils/gapAnalysis.ts

import type {
  Skill,
  RoleDefinition,
  GapAnalysisResult,
  SkillCategory
} from "../types";

/**
 * Normalize a skill name by finding it in the skills list.
 * Returns the canonical skill ID or null if not found.
 */
export function normalizeSkill(skillInput: string, skills: Skill[]): string | null {
  const normalized = skillInput.trim().toLowerCase();
  if (!normalized) return null;

  for (const skill of skills) {
    // Match by id or label
    if (
      skill.id.toLowerCase() === normalized ||
      skill.label.toLowerCase() === normalized
    ) {
      return skill.id;
    }

    // Match by alias
    if (skill.aliases && skill.aliases.some(alias => alias.toLowerCase() === normalized)) {
      return skill.id;
    }
  }

  return null;
}

/**
 * Normalize multiple user skill inputs and return a unique set
 * of canonical Skill IDs.
 */
export function normalizeSkills(skillInputs: string[], skills: Skill[]): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const input of skillInputs) {
    const normalizedId = normalizeSkill(input, skills);
    if (normalizedId && !seen.has(normalizedId)) {
      normalized.push(normalizedId);
      seen.add(normalizedId);
    }
  }

  return normalized;
}

/**
 * Perform gap analysis between user skills and a role's required skills.
 */
export function analyzeGaps(
  userSkills: string[],      // raw user inputs (e.g., ["html", "CSS", "js"])
  role: RoleDefinition,
  skills: Skill[]
): GapAnalysisResult {
  // 1. Normalize user skills to canonical IDs
  const normalizedUserSkills = normalizeSkills(userSkills, skills);

  // 2. Required skill IDs for this role
  const requiredSkillIds = role.requiredSkills.map(req => req.skillId);

  // 3. Determine which required skills are matched or missing
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const requiredId of requiredSkillIds) {
    if (normalizedUserSkills.includes(requiredId)) {
      matchedSkills.push(requiredId);
    } else {
      missingSkills.push(requiredId);
    }
  }

  // 4. Simple readiness percentage (by count)
  const readinessPercent =
    requiredSkillIds.length > 0
      ? Math.round((matchedSkills.length / requiredSkillIds.length) * 100)
      : 0;

  // 5. Weighted readiness percentage (using importance)
  let totalImportance = 0;
  let matchedImportance = 0;

  for (const req of role.requiredSkills) {
    const imp = req.importance; // importance is always defined (1 | 2 | 3)
    totalImportance += imp;
    if (matchedSkills.includes(req.skillId)) {
      matchedImportance += imp;
    }
  }

  const weightedReadinessPercent =
    totalImportance > 0 ? Math.round((matchedImportance / totalImportance) * 100) : 0;

  // 6. Group missing skills by category
  const missingSkillsByCategory: Record<SkillCategory, string[]> = {
    language: [],
    framework: [],
    tool: [],
    soft: []
  };

  for (const skillId of missingSkills) {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      missingSkillsByCategory[skill.category].push(skillId);
    }
  }

  // 7. Sort missing skills in each category by importance (most important first)
  const sortByImportance = (a: string, b: string) => {
    const reqA = role.requiredSkills.find(r => r.skillId === a);
    const reqB = role.requiredSkills.find(r => r.skillId === b);
    // If requirement not found, treat as 0 importance
    const impA = reqA?.importance ?? 0;
    const impB = reqB?.importance ?? 0;
    return impB - impA;
  };

  (Object.keys(missingSkillsByCategory) as SkillCategory[]).forEach(category => {
    missingSkillsByCategory[category].sort(sortByImportance);
  });

  return {
    roleId: role.id,
    normalizedUserSkills,
    matchedSkills,
    missingSkills,
    readinessPercent,
    weightedReadinessPercent,
    missingSkillsByCategory
  };
}

/**
 * Get the human-friendly label for a skill ID.
 */
export function getSkillLabel(skillId: string, skills: Skill[]): string {
  const skill = skills.find(s => s.id === skillId);
  return skill?.label || skillId;
}

/**
 * Get the category for a given skill ID.
 */
export function getSkillCategory(
  skillId: string,
  skills: Skill[]
): SkillCategory | null {
  const skill = skills.find(s => s.id === skillId);
  return skill?.category ?? null;
}

