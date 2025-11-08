import type { Skill, RoleDefinition, LearningResource } from '../types';
import skillsData from '../data/skills.json';
import rolesData from '../data/roles.json';
import resourcesData from '../data/resources.json';

export function loadSkills(): Skill[] {
  return skillsData as Skill[];
}

export function loadRoles(): RoleDefinition[] {
  return rolesData as RoleDefinition[];
}

export function loadResources(): LearningResource[] {
  return resourcesData as LearningResource[];
}

