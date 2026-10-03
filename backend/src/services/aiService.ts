import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as jsonpatch from 'fast-json-patch';

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

  // 3. NVIDIA NIM (Nemotron 3 Ultra 550B & Lightning 30B)
  if (provider === 'nvidia' && process.env.NVIDIA_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      }),
      model: config.byokModel || 'nvidia/nemotron-3-ultra-550b-a55b',
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
- Keep sections clean, impactful, and realistic.
- Support theme presets: 'cyber-dark', 'bento-violet', 'minimal-editorial', 'nordic-teal'.
- Support section types: 'hero', 'about', 'projects', 'skills', 'experience', 'contact'.
- Return ONLY valid JSON. Do not include extraneous conversational text.
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

CRITICAL INSTRUCTION FOR EFFICIENCY: 
Instead of returning the entire schema, you MUST return a valid RFC 6902 JSON Patch array containing ONLY the operations required to apply the user's instruction to the Current Portfolio Schema.
Example of expected output format:
[
  { "op": "replace", "path": "/theme/palette/bg", "value": "#000000" },
  { "op": "replace", "path": "/sections/0/data/title", "value": "New Title" }
]
Output ONLY the JSON patch array. Do not wrap in markdown or add explanations.
`;

  const stream = await ai.client.chat.completions.create({
    model: ai.model,
    messages: [
      { role: 'system', content: SYSTEM_PORTFOLIO_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
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

  const patchArray = extractJson(fullResponse);
  
  if (Array.isArray(patchArray)) {
    try {
      // Create a deep copy to apply patches without mutating the original reference directly
      const documentCopy = JSON.parse(JSON.stringify(currentPortfolio));
      const updatedPortfolio = jsonpatch.applyPatch(documentCopy, patchArray).newDocument;
      return updatedPortfolio;
    } catch (e) {
      console.error('Failed to apply JSON patch', e);
      // Fallback: If patch fails, maybe LLM returned full schema instead of array
      return patchArray.meta ? patchArray : currentPortfolio;
    }
  }
  
  // If it's not an array, maybe it ignored instructions and returned the full schema
  return patchArray || currentPortfolio;
};

/**
 * Robust JSON extractor that handles markdown wrappers, preambles, and code blocks
 */
function extractJson(text: string): any {
  if (!text) return null;
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return null;
  }
}

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
  const parsed = extractJson(content);
  return parsed || generateMockInitial(userDescription);
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
