import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export type AiProvider = 'groq' | 'mistral' | 'nvidia' | 'byok';

interface AiClientConfig {
  provider?: AiProvider;
  byokKey?: string;
  byokBaseUrl?: string;
  byokModel?: string;
}

/**
 * Creates an OpenAI-compatible client configured for Groq, Mistral, NVIDIA NIM, or custom BYOK
 */
export const getAiClient = (config: AiClientConfig = {}) => {
  const provider = config.provider || (process.env.DEFAULT_AI_PROVIDER as AiProvider) || 'groq';

  // 1. User BYOK (Bring Your Own Key)
  if (provider === 'byok' && config.byokKey) {
    return {
      client: new OpenAI({
        apiKey: config.byokKey,
        baseURL: config.byokBaseUrl || 'https://api.groq.com/openai/v1',
      }),
      model: config.byokModel || 'llama-3.3-70b-versatile',
      provider: 'byok',
    };
  }

  // 2. Mistral AI ($50 credit available)
  if (provider === 'mistral' && process.env.MISTRAL_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.MISTRAL_API_KEY,
        baseURL: 'https://api.mistral.ai/v1',
      }),
      model: 'mistral-large-latest',
      provider: 'mistral',
    };
  }

  // 3. NVIDIA NIM
  if (provider === 'nvidia' && process.env.NVIDIA_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      }),
      model: 'meta/llama-3.3-70b-instruct',
      provider: 'nvidia',
    };
  }

  // 4. Groq (Ultra-fast inference default)
  if (process.env.GROQ_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      model: 'llama-3.3-70b-versatile',
      provider: 'groq',
    };
  }

  // 5. Fallback Mock Client when keys are pending
  return null;
};

const SYSTEM_PORTFOLIO_PROMPT = `
You are the world's premier AI portfolio design architect and copywriter.
You manipulate structured portfolio JSON adhering to the Portfolify Schema.

Schema Rules:
- The output MUST be a valid JSON object matching the portfolio schema.
- Keep sections clean, impactful, and realistic.
- Support theme presets: 'cyber-dark', 'bento-violet', 'minimal-editorial', 'nordic-teal'.
- Support section types: 'hero', 'about', 'projects', 'skills', 'experience', 'contact'.
- Return ONLY valid JSON wrapped in a code fence or as raw JSON. Do not include extraneous conversational text.
`;

/**
 * Streaming Chat Editor with Server-Sent Events (SSE)
 */
export const streamAiEdit = async (
  currentPortfolio: any,
  userPrompt: string,
  config: AiClientConfig = {},
  onChunk: (text: string) => void
): Promise<any> => {
  const ai = getAiClient(config);

  // If no API key is configured yet, provide intelligent simulated streaming
  if (!ai) {
    const mockReply = generateMockDelta(currentPortfolio, userPrompt);
    const text = JSON.stringify(mockReply);
    for (let i = 0; i < text.length; i += 20) {
      onChunk(text.slice(i, i + 20));
      await new Promise((r) => setTimeout(r, 20));
    }
    return mockReply;
  }

  const prompt = `
Current Portfolio Schema:
${JSON.stringify(currentPortfolio, null, 2)}

User Instruction: "${userPrompt}"

Update the portfolio schema accordingly. Return the complete updated JSON object.
`;

  const stream = await ai.client.chat.completions.create({
    model: ai.model,
    messages: [
      { role: 'system', content: SYSTEM_PORTFOLIO_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    stream: true,
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      fullResponse += delta;
      onChunk(delta);
    }
  }

  try {
    const cleanJson = fullResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return currentPortfolio;
  }
};

/**
 * Generates a full portfolio schema from a single natural language description
 */
export const generatePortfolioFromPrompt = async (
  userDescription: string,
  config: AiClientConfig = {}
): Promise<any> => {
  const ai = getAiClient(config);

  if (!ai) {
    return generateMockInitial(userDescription);
  }

  const prompt = `
Generate a complete, modern, professional portfolio JSON schema for the following profile:
"${userDescription}"

Include:
- theme (preset, palette, typography)
- hero section (with name, title, tagline, CTAs, badge)
- about section (with bio paragraphs, stats, location)
- projects section (with 3 high-impact projects, tech tags, metrics)
- skills section (categorized)
- experience section (2-3 realistic career milestones)
- contact section
`;

  const response = await ai.client.chat.completions.create({
    model: ai.model,
    messages: [
      { role: 'system', content: SYSTEM_PORTFOLIO_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '';
  const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
};

// Fallback Mock Generators
function generateMockDelta(current: any, prompt: string) {
  const copy = JSON.parse(JSON.stringify(current));
  const lower = prompt.toLowerCase();

  if (lower.includes('violet') || lower.includes('bento')) {
    copy.sections = copy.sections.map((s: any) =>
      s.type === 'projects' ? { ...s, variant: 'bento-grid' } : s
    );
  } else if (lower.includes('minimal') || lower.includes('editorial')) {
    copy.sections = copy.sections.map((s: any) =>
      s.type === 'hero' ? { ...s, variant: 'minimal-centered' } : s
    );
  } else if (lower.includes('senior') || lower.includes('principal')) {
    const hero = copy.sections.find((s: any) => s.type === 'hero');
    if (hero) {
      hero.data.title = 'Principal Solutions Architect & AI Strategist';
    }
  }
  return copy;
}

function generateMockInitial(description: string) {
  return {
    meta: {
      title: 'Generated Portfolio',
      slug: 'my-portfolio',
      description,
    },
    theme: {
      id: 'cyber-dark',
      name: 'Cyber Slate',
      palette: {
        bg: '#0a0e17',
        surface: '#111827',
        accent: '#6366f1',
        textPrimary: '#f9fafb',
        textSecondary: '#9ca3af',
        border: 'rgba(255,255,255,0.08)',
      },
    },
    sections: [
      {
        id: 'sec-hero',
        type: 'hero',
        variant: 'split-portrait',
        visible: true,
        data: {
          badge: 'Available for high-impact roles',
          name: 'Alex Vance',
          title: 'Senior Full-Stack & AI Engineer',
          tagline: description || 'Building resilient distributed backends and reactive user interfaces.',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  };
}
