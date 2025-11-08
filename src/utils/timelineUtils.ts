import type { Skill, GapAnalysisResult, RoleDefinition, TimelineEvent } from '../types';

/**
 * Generate a personalized learning timeline
 */
export function generateTimeline(
  analysisResult: GapAnalysisResult,
  skills: Skill[],
  role: RoleDefinition,
  totalMonths: number = 12
): TimelineEvent[] {
  const timeline: TimelineEvent[] = [];
  const missingSkills = analysisResult.missingSkills;
  
  // If no missing skills, create a simplified timeline
  if (missingSkills.length === 0) {
    timeline.push({
      id: 'ready',
      skillId: 'ready',
      skillName: 'You\'re Ready!',
      month: 1,
      description: 'You have all the required skills. Start applying for jobs and preparing for interviews.',
      completed: false,
    });
    timeline.push({
      id: 'apply-jobs',
      skillId: 'jobs',
      skillName: 'Apply for Jobs',
      month: 2,
      description: 'Start applying for positions and prepare for interviews',
      completed: false,
    });
    return timeline;
  }
  
  // Sort skills by importance
  const sortedSkills = [...missingSkills].sort((a, b) => {
    const reqA = role.requiredSkills.find(r => r.skillId === a);
    const reqB = role.requiredSkills.find(r => r.skillId === b);
    return (reqB?.importance || 0) - (reqA?.importance || 0);
  });

  // Distribute skills across timeline (ensure at least 2 months for planning)
  const adjustedMonths = Math.max(2, Math.min(totalMonths, sortedSkills.length + 1));
  const skillsPerMonth = Math.max(1, Math.ceil(sortedSkills.length / (adjustedMonths - 1)));
  let currentMonth = 1;
  let skillIndex = 0;

  while (skillIndex < sortedSkills.length && currentMonth < adjustedMonths) {
    const skillsForThisMonth = sortedSkills.slice(
      skillIndex,
      Math.min(skillIndex + skillsPerMonth, sortedSkills.length)
    );

    for (const skillId of skillsForThisMonth) {
      const skill = skills.find(s => s.id === skillId);
      if (skill) {
        timeline.push({
          id: `${skillId}-${currentMonth}`,
          skillId,
          skillName: skill.label,
          month: currentMonth,
          description: `Learn ${skill.label} fundamentals and practice with projects`,
          completed: false,
        });
      }
    }

    skillIndex += skillsForThisMonth.length;
    currentMonth++;
  }

  // Add final milestone: Apply for jobs
  timeline.push({
    id: 'apply-jobs',
    skillId: 'jobs',
    skillName: 'Apply for Jobs',
    month: adjustedMonths,
    description: 'Start applying for positions and prepare for interviews',
    completed: false,
  });

  return timeline;
}

