import type { Skill, GapAnalysisResult, RoleDefinition, ProjectSuggestion, UserProfile } from '../types';

// GPT API key - set via environment variable or replace here
// To use: Set VITE_OPENAI_API_KEY in your .env file or replace the value below
const GPT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generate project suggestions using GPT API
 */
export async function generateProjectSuggestions(
  analysisResult: GapAnalysisResult,
  skills: Skill[],
  role: RoleDefinition,
  _userProfile: UserProfile,
  userSkills: string[]
): Promise<ProjectSuggestion[]> {
  // Check if API key is set
  if (!GPT_API_KEY || GPT_API_KEY === 'YOUR_OPENAI_API_KEY_HERE' || GPT_API_KEY.trim() === '') {
    // Return fallback suggestions if API key is not set
    console.info('OpenAI API key not configured. Using fallback project suggestions.');
    return getFallbackProjectSuggestions(analysisResult, skills, role, userSkills);
  }

  try {
    const missingSkillsList = analysisResult.missingSkills
      .map((skillId: string) => {
        const skill = skills.find(s => s.id === skillId);
        return skill?.label || skillId;
      })
      .join(', ');

    const userSkillsList = userSkills
      .map((skillId: string) => {
        const skill = skills.find(s => s.id === skillId);
        return skill?.label || skillId;
      })
      .join(', ');

    const prompt = `You are a career advisor helping someone become a ${role.name}. 
The user currently has these skills: ${userSkillsList || 'none'}
They need to learn these skills: ${missingSkillsList}
Their role description: ${role.description}

Generate 5 project suggestions that will help them learn the missing skills while building their portfolio. 
For each project, provide:
1. Project name (be specific and engaging)
2. Description (2-3 sentences explaining what the project does and what skills it teaches)
3. Skills it focuses on (from the missing skills list)
4. Difficulty level (beginner, intermediate, or advanced)

Return the response as a JSON array with this structure:
[
  {
    "name": "Project Name",
    "description": "Project description",
    "skills": ["skill1", "skill2"],
    "difficulty": "beginner"
  }
]`;

    const response = await fetch(GPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful career advisor that suggests coding projects. Always return valid JSON arrays.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (content) {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const projects = JSON.parse(jsonMatch[0]);
          return projects.map((p: any) => ({
            name: p.name,
            description: p.description,
            skills: p.skills || [],
            difficulty: p.difficulty || 'intermediate',
          }));
        }
      }
    }
  } catch (error) {
    console.error('GPT API error:', error);
    // Fallback to default suggestions on error
    return getFallbackProjectSuggestions(analysisResult, skills, role, userSkills);
  }

  // Fallback to default suggestions (should not reach here, but added for safety)
  return getFallbackProjectSuggestions(analysisResult, skills, role, userSkills);
}

/**
 * Get fallback project suggestions when GPT API is unavailable
 */
function getFallbackProjectSuggestions(
  analysisResult: GapAnalysisResult,
  skills: Skill[],
  role: RoleDefinition,
  _userSkills: string[]
): ProjectSuggestion[] {
  const missingSkills = analysisResult.missingSkills.slice(0, 5);
  const projects: ProjectSuggestion[] = [];

  // Generate projects based on missing skills
  for (let i = 0; i < Math.min(5, missingSkills.length); i++) {
    const skillId = missingSkills[i];
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      projects.push({
        name: `Build a ${skill.label} Project`,
        description: `Create a practical project using ${skill.label} to reinforce your learning and build your portfolio. This project will help you apply ${skill.label} concepts in a real-world scenario.`,
        skills: [skillId],
        difficulty: i < 2 ? 'beginner' : i < 4 ? 'intermediate' : 'advanced',
      });
    }
  }

  // Add a comprehensive project if we have multiple skills
  if (missingSkills.length > 2) {
    projects.push({
      name: `Full-Stack ${role.name} Portfolio Project`,
      description: `Build a complete application that showcases your skills as a ${role.name}. This project combines multiple technologies and demonstrates your ability to work on end-to-end solutions.`,
      skills: missingSkills.slice(0, 5),
      difficulty: 'intermediate',
    });
  }

  return projects.slice(0, 5);
}
