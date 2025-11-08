import type { ChatMessage, UserContext } from '../types';

export type { ChatMessage, UserContext };

/**
 * Get the system prompt with user context
 */
function getSystemPrompt(context: UserContext): string {
  const {
    name,
    school,
    graduationYear,
    experienceLevel,
    userSkills,
    selectedRole,
    gapAnalysis,
    availableResources,
  } = context;

  let prompt = `You are CareerPath AI, a helpful and friendly career guidance assistant for the CareerPath Gap Analyzer application. Your role is to help students and career switchers navigate their path to entry-level tech roles by providing personalized course recommendations, upskilling advice, and guidance.

CONTEXT ABOUT THE USER:
`;

  if (name) {
    prompt += `- Name: ${name}\n`;
  }
  if (school) {
    prompt += `- School: ${school}\n`;
  }
  if (graduationYear) {
    prompt += `- Graduation Year: ${graduationYear}\n`;
  }
  if (experienceLevel) {
    prompt += `- Experience Level: ${experienceLevel}\n`;
  }
  if (context.dreamRole) {
    prompt += `- Dream Role: ${context.dreamRole}\n`;
  }

  prompt += `\nCURRENT SKILLS:\n`;
  if (userSkills.length > 0) {
    prompt += `- ${userSkills.join(', ')}\n`;
  } else {
    prompt += `- No skills added yet\n`;
  }

  if (selectedRole) {
    prompt += `\nTARGET ROLE: ${selectedRole.name}\n`;
    prompt += `- Description: ${selectedRole.description}\n`;

    if (gapAnalysis) {
      prompt += `\nGAP ANALYSIS:\n`;
      prompt += `- Readiness: ${gapAnalysis.readinessPercent}%\n`;
      if (gapAnalysis.weightedReadinessPercent) {
        prompt += `- Weighted Readiness: ${gapAnalysis.weightedReadinessPercent}% (weighted by skill importance)\n`;
      }
      prompt += `- Skills you have: ${gapAnalysis.matchedSkills.length > 0 ? gapAnalysis.matchedSkills.join(', ') : 'None'}\n`;
      prompt += `- Skills you need: ${gapAnalysis.missingSkills.length > 0 ? gapAnalysis.missingSkills.join(', ') : 'None'}\n`;
    }
  }

  if (availableResources && availableResources.length > 0) {
    prompt += `\nAVAILABLE LEARNING RESOURCES:\n`;
    availableResources.slice(0, 10).forEach((resource, index) => {
      prompt += `${index + 1}. ${resource.title} (${resource.platform}) - ${resource.url}\n`;
    });
  }

  prompt += `\nYOUR RESPONSIBILITIES:
1. Provide personalized course recommendations based on the user's gap analysis
2. Suggest specific learning paths and upskilling strategies
3. Guide users around the CareerPath Gap Analyzer program features
4. Answer questions about tech roles, skills, and career paths
5. Be encouraging and supportive, especially for students and career switchers
6. Recommend free resources when possible (the app focuses on free learning resources)
7. Help users understand their readiness percentage and what they need to improve
8. Provide actionable advice on how to learn missing skills

GUIDELINES:
- Be conversational and friendly
- Use the user's name when appropriate
- Reference their specific skills and target role
- Provide concrete, actionable advice
- Suggest specific courses, tutorials, or learning resources
- Break down complex topics into manageable steps
- Encourage the user and celebrate their progress
- If the user hasn't selected a role yet, help them choose one
- If the user has low readiness, provide encouragement and a clear path forward
- Always mention free resources when possible

Keep responses concise but helpful. Aim for 2-4 paragraphs unless the user asks for more detail.`;

  return prompt;
}

/**
 * Send a message to OpenAI API
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  context: UserContext
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Debug: Check if env vars are being loaded
  if (import.meta.env.DEV) {
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 10) || 'none',
      envMode: import.meta.env.MODE,
      allViteEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
    });
  }

  if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
    throw new Error(
      'OpenAI API key is not configured. Please:\n' +
      '1. Make sure the .env file exists in the root directory\n' +
      '2. Add: VITE_OPENAI_API_KEY=your_actual_key\n' +
      '3. Restart the dev server (npm run dev)\n' +
      'Note: Vite only loads .env files when the server starts.'
    );
  }

  // Build the full message list with system prompt
  const systemPrompt = getSystemPrompt(context);
  const fullMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        messages: fullMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with AI assistant. Please try again.');
  }
}

