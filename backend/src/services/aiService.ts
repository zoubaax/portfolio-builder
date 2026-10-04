import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as jsonpatchModule from 'fast-json-patch';

const jsonpatch: any = (jsonpatchModule as any).default || jsonpatchModule;

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
      model: config.byokModel || process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b',
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

Schema Definitions:
1. meta: { title: string, slug: string, description: string }
2. theme: { id: string ('cyber-dark' | 'bento-violet' | 'minimal-editorial' | 'nordic-teal'), name: string, palette: { bg: string, surface: string, accent: string, textPrimary?: string, textSecondary?: string, border?: string } }
3. sections: Array of section objects:
   - hero: { id: 'sec-hero', type: 'hero', variant: 'split-portrait' | 'terminal-dev' | 'minimal-centered', visible: boolean, data: { badge?: string, name: string, title: string, tagline: string, avatar?: string, primaryCta?: { text: string, link: string }, secondaryCta?: { text: string, link: string }, socials?: Array<{ platform: string, url: string }> } }
   - about: { id: 'sec-about', type: 'about', variant: 'bento' | 'classic-story', visible: boolean, data: { heading: string, subheading?: string, bio: string[] | string, stats?: Array<{ value: string, label: string }>, location?: string } }
   - projects: { id: 'sec-projects', type: 'projects', variant: 'bento-grid' | 'card-grid' | 'minimal-list', visible: boolean, data: { heading: string, subheading?: string, projects: Array<{ id: string, title: string, description: string, tags: string[], metrics?: string, link?: string, github?: string, image?: string }> } }
   - skills: { id: 'sec-skills', type: 'skills', variant: 'category-cards' | 'pill-cloud', visible: boolean, data: { heading: string, subheading?: string, categories: Array<{ name: string, skills: string[] }> } }
   - experience: { id: 'sec-experience', type: 'experience', variant: 'timeline' | 'cards', visible: boolean, data: { heading: string, items: Array<{ period: string, role: string, company: string, description: string }> } }
   - contact: { id: 'sec-contact', type: 'contact', variant: 'card' | 'split', visible: boolean, data: { title: string, email: string, message?: string } }

Crucial Instructions:
- CRITICAL PROJECT ISOLATION & ACCURACY: In the 'projects' section ('sec-projects'), NEVER invent, imagine, or hallucinate fake software projects, fake repositories, or fake metrics. Always keep the 'projects' array empty (data.projects: []) unless the user explicitly provides specific project names or requests to edit an already existing project. Software projects are imported authentically by the user via GitHub.
- For 'projects' section, ALWAYS store projects inside the array property named 'projects' (NOT 'items'). Each project uses 'tags' (array of strings, NOT 'tech').
- For 'skills' section, ALWAYS use 'categories' with objects having 'name' (string) and 'skills' (array of strings).
- Respect the requested discipline, student status, and experience level precisely (e.g. if user is an engineering student in DevOps/Cloud Native, set hero title to 'Cloud Native & DevOps Engineer' and student description).
- When asked to change background color, modify '/theme/palette/bg'. If changing to a light background (yellow, white, beige, light gray), ALWAYS also update '/theme/palette/textPrimary' to a dark color (e.g. '#0f172a'), '/theme/palette/textSecondary' to '#475569', and '/theme/palette/surface' to a harmonious light card background (e.g. '#ffffff' or 'rgba(0,0,0,0.05)') so text and cards remain readable. If changing to a dark background, ensure textPrimary is light ('#f9fafb').
- Output ONLY valid JSON RFC 6902 patch operations. No markdown wrappers, no conversational text.
`;

/**
 * Strips huge base64 image strings before sending portfolio schema to LLM prompt,
 * preventing context overflow (1M+ tokens) and reducing latency by 90%.
 */
export function stripHeavyBase64(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(stripHeavyBase64);
  }
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('data:image/') && value.length > 256) {
      clean[key] = value.slice(0, 48) + '...[TRUNCATED_BASE64]';
    } else if (typeof value === 'string' && value.length > 2000 && !key.includes('bio') && !key.includes('description')) {
      clean[key] = value.slice(0, 100) + '...[TRUNCATED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = stripHeavyBase64(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

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
${JSON.stringify(stripHeavyBase64(currentPortfolio), null, 2)}

User Instruction: "${userPrompt}"

CRITICAL INSTRUCTION FOR EFFICIENCY: 
Instead of returning the entire schema, you MUST return a valid RFC 6902 JSON Patch array containing ONLY the operations required to apply the user's instruction to the Current Portfolio Schema.
Example of expected output format (ensure it is pretty-printed with 2 spaces indentation for readability):
[
  {
    "op": "replace",
    "path": "/theme/palette/bg",
    "value": "#000000"
  },
  {
    "op": "replace",
    "path": "/sections/0/data/title",
    "value": "New Title"
  }
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

  let patchArray = extractJson(fullResponse);
  
  // Safeguard: If AI returned a single patch object instead of an array, wrap it
  if (patchArray && !Array.isArray(patchArray) && typeof patchArray.op === 'string' && typeof patchArray.path === 'string') {
    patchArray = [patchArray];
  }
  
  if (Array.isArray(patchArray)) {
    try {
      // Create a deep copy to apply patches without mutating the original reference directly
      const documentCopy = JSON.parse(JSON.stringify(currentPortfolio));
      let successCount = 0;
      
      for (const patch of patchArray) {
        try {
          // Attempt operation directly
          jsonpatch.applyOperation(documentCopy, patch);
          successCount++;
        } catch (opError) {
          // If a 'replace' operation failed because property didn't exist yet, try 'add' (upsert)
          if (patch.op === 'replace') {
            try {
              jsonpatch.applyOperation(documentCopy, { ...patch, op: 'add' });
              successCount++;
            } catch (addError) {
              console.warn('Skipped invalid patch operation:', patch, addError);
            }
          } else {
            console.warn('Skipped invalid patch operation:', patch, opError);
          }
        }
      }
      
      if (successCount === 0 && patchArray.length > 0) {
        throw new Error('All JSON patch operations failed to apply');
      }
      return documentCopy;
    } catch (e) {
      console.error('Failed to apply JSON patch', e);
      throw e;
    }
  }
  
  // If it's not an array, maybe it ignored instructions and returned the full schema
  if (patchArray && patchArray.sections && patchArray.theme) {
    restoreOriginalImages(patchArray, currentPortfolio);
    return patchArray;
  }

  return currentPortfolio;
};

/**
 * Restores original base64 images into target schema if truncated placeholders were present
 */
function restoreOriginalImages(target: any, source: any) {
  if (!target?.sections || !source?.sections) return;
  const sourceProjects = source.sections.find((s: any) => s.type === 'projects')?.data?.projects || [];
  const targetProjectsSection = target.sections.find((s: any) => s.type === 'projects');
  if (targetProjectsSection?.data?.projects) {
    targetProjectsSection.data.projects = targetProjectsSection.data.projects.map((tp: any) => {
      const sp = sourceProjects.find((p: any) => p.id === tp.id || p.title === tp.title);
      if (sp?.image && (!tp.image || tp.image.includes('[TRUNCATED'))) {
        return { ...tp, image: sp.image };
      }
      return tp;
    });
  }
}

/**
 * Robust JSON extractor that handles markdown wrappers, preambles, and code blocks
 */
function extractJson(text: string): any {
  if (!text) return null;
  // First try direct clean parsing
  try {
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {}
  
  // Try extracting array or object bounds
  try {
    const firstObj = text.indexOf('{');
    const firstArr = text.indexOf('[');
    const lastObj = text.lastIndexOf('}');
    const lastArr = text.lastIndexOf(']');
    
    // Find the very first and very last brackets/braces
    const startObj = firstObj !== -1 ? firstObj : Infinity;
    const startArr = firstArr !== -1 ? firstArr : Infinity;
    const start = Math.min(startObj, startArr);
    
    const endObj = lastObj !== -1 ? lastObj : -Infinity;
    const endArr = lastArr !== -1 ? lastArr : -Infinity;
    const end = Math.max(endObj, endArr);
    
    if (start !== Infinity && end !== -Infinity && end > start) {
      const candidate = text.slice(start, end + 1);
      return JSON.parse(candidate);
    }
  } catch {}
  
  return null;
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
- projects section (CRITICAL: MUST set data.projects: [] as empty array; real software projects will be imported directly by user via GitHub, do not hallucinate fake software projects)
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
