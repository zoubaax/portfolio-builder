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
      model: config.byokModel || process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct',
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

export interface SummarizeProjectParams {
  name: string;
  owner?: string;
  language?: string;
  topics?: string[];
  rawDescription?: string;
  readmeContent?: string;
}

export interface SummarizeProjectResult {
  title: string;
  description: string;
  tags: string[];
  metrics: string;
  imagePrompt?: string;
}

export interface GenerateImagePromptParams {
  title: string;
  description?: string;
  tags?: string[];
}

/**
 * Uses the LLM to design an ultra-clean, modern, tailored image generation prompt in English for FLUX.1.
 * STRICTLY FORBIDS 3D toys/cartoons/isometric rendering in favor of sleek UI dashboards and software visuals.
 */
export const generateImagePromptWithAi = async (
  params: GenerateImagePromptParams,
  config: AiClientConfig = {}
): Promise<string> => {
  const { title, description = '', tags = [] } = params;
  const ai = getAiClient(config);

  // Preserve rich README context up to 3500 chars so LLM truly understands the project
  const cleanDesc = (description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[#*`~_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3500);

  const cleanFallbackPrompt = `Editorial photography of a high-end workstation monitor showing the "${title}" interface in its authentic workplace environment, realistic software UI with domain data, Sony A7R V, 35mm f/1.8 lens, shallow depth of field, natural soft ambient light with screen reflections, light grain, ultra-detailed 8k, 16:9 aspect ratio.`;

  if (!ai) {
    return cleanFallbackPrompt;
  }

  const systemPrompt = `Tu es un directeur artistique et prompt engineer d'élite pour les modèles de génération d'images ultra-réalistes (FLUX.1).
Ta mission est d'analyser la documentation README et les métadonnées d'un projet logiciel, puis de concevoir directement UN SEUL prompt de génération d'image en anglais, hautement immersif, réaliste et professionnel.

Étapes de réflexion interne (ne les affiche pas) :
1. Identifie ce que fait le projet, qui l'utilise et dans quel environnement professionnel réel il s'intègre.
2. Choisis une scène concrète liée à ce domaine métier (ex : santé → cabinet médical / clinique moderne, DevOps/Cloud → salle serveur / poste d'ingénieur senior, e-commerce → entrepôt logistique ou studio design, finance/trading → bureau de trading, cybersécurité → centre opérationnel SOC, jeu vidéo → studio de game design, IA/Data → laboratoire de recherche).
3. Détermine 3 à 4 données réalistes propres au projet (noms, métriques crédibles, chiffres, statuts opérationnels) affichées sur l'écran.

Image à produire par le prompt (RÉDIGÉ STRICTEMENT EN ANGLAIS) :
- Photographie éditoriale réaliste d'un écran ou d'un appareil moderne montrant l'interface du projet, placé dans son contexte réel d'utilisation.
- L'interface affiche les vraies fonctionnalités du projet avec les données réalistes déduites du projet (texte court, net et lisible).
- Palette de couleurs tirée du domaine du projet (JAMAIS de "dark mode cyan" par défaut).
- Décor et accessoires crédibles et subtilement floutés pour le métier concerné.
- Style photographique : Editorial photography, shot on Sony A7R V, 35mm f/1.8 lens, shallow depth of field, soft natural ambient light mixed with subtle screen reflections, fine film grain, ultra-detailed 8k, 16:9 aspect ratio.
- À interdire formellement : NO 3D cartoon toys, NO isometric plastic rendering, NO lorem ipsum, NO cliché glowing neons, NO watermarks, NO distorted hands or text artifacts.

Format de sortie STRICT :
Génère UNIQUEMENT le prompt d'image en anglais (1 à 2 phrases descriptives riches et précises). Pas de texte explicatif, pas de markdown, juste le prompt anglais.`;

  const userPrompt = `Project Title: ${title}
Technologies: ${tags.join(', ') || 'Modern Software Engineering'}

Documentation README / Description détaillée du projet :
"""
${cleanDesc || title}
"""

Génère directement le prompt d'image FLUX.1 en anglais :`;

  try {
    const response = await ai.client.chat.completions.create({
      model: ai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 180,
    });

    const rawPrompt = response.choices[0]?.message?.content?.trim();
    if (rawPrompt && rawPrompt.length > 20) {
      return rawPrompt.replace(/^["']|["']$/g, '').trim();
    }
  } catch (err) {
    console.warn('AI image prompt generation error, using clean fallback:', err);
  }

  return cleanFallbackPrompt;
};

/**
 * Uses LLM to read GitHub repository README documentation and generate an ultra-clean,
 * high-impact, professional summary, tech stack tags, value metric, and a tailored clean UI image prompt.
 */
export const summarizeProjectWithAi = async (
  params: SummarizeProjectParams,
  config: AiClientConfig = {}
): Promise<SummarizeProjectResult> => {
  const { name, language, topics = [], rawDescription = '', readmeContent = '' } = params;
  const ai = getAiClient(config);

  const cleanTitleFallback = name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const fallbackResult: SummarizeProjectResult = {
    title: cleanTitleFallback,
    description: rawDescription || 'Projet open-source certifié GitHub.',
    tags: [language, ...topics].filter(Boolean).slice(0, 4) as string[],
    metrics: 'Architecture Modulaire • Open-Source',
    imagePrompt: `Sleek dark-mode digital dashboard for software application "${cleanTitleFallback}", modern clean software interface, slate dark background (#090d16), subtle electric cyan accents, crisp vector UI telemetry cards and charts, studio display lighting, no text distortion, minimal aesthetic.`,
  };

  if (!ai) {
    return fallbackResult;
  }

  // Truncate README content to 3,500 chars to remain token-efficient while giving rich context
  const cleanReadme = (readmeContent || '').slice(0, 3500).trim();

  const systemPrompt = `You are an expert technical portfolio curator, copywriter, and visual director.
Your mission is to analyze a developer's GitHub repository documentation (README and metadata) and synthesize:
1. "title": Clean, professional project name (e.g. "Smart Network Mapper").
2. "description": An impactful, crystal-clear 1 to 2 sentences (120 to 180 characters max) in French explaining the problem solved and value proposition. NEVER include raw markdown syntax (no **, *, #, backticks, emojis, bullet points, or development notes).
3. "tags": An array of 3 to 5 key technologies/frameworks extracted from the README or metadata.
4. "metrics": A concise technical highlight badge (e.g. "Diagnostic Temps Réel • Analyse Multi-Threads").
5. "imagePrompt": A tailored 1 to 2 sentence English prompt for FLUX.1 following this exact standard: Editorial photography of a modern device/screen displaying the project's real interface in its authentic workplace setting (e.g. healthcare -> clinic/cabinet, DevOps/Cloud -> server room/workstation, e-commerce -> warehouse/studio, AI/fintech -> research lab/trading desk), realistic domain-specific metrics and data on screen, color palette drawn from the project's actual field (NEVER generic cyan neon), Sony A7R V, 35mm f/1.8 lens, shallow depth of field, natural soft ambient light with screen reflections, light grain, ultra-detailed 8k, 16:9 aspect ratio. STRICTLY FORBIDDEN: NO 3D cartoon toys, NO isometric plastic rendering, NO lorem ipsum, NO cliché neons.

Output ONLY a valid JSON object matching:
{
  "title": string,
  "description": string,
  "tags": string[],
  "metrics": string,
  "imagePrompt": string
}`;

  const userPrompt = `Project Metadata:
- Repository Name: ${name}
- Primary Language: ${language || 'Not specified'}
- Topics/Tags: ${topics.join(', ') || 'None'}
- Raw GitHub Description: ${rawDescription || 'None'}

README Documentation Snippet:
"""
${cleanReadme || 'No README provided. Rely on repository name, language, and topics.'}
"""

Synthesize the portfolio project summary and visual prompt JSON now.`;

  try {
    const response = await ai.client.chat.completions.create({
      model: ai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    const parsed = extractJson(content);

    if (parsed && typeof parsed === 'object') {
      return {
        title: (parsed.title && typeof parsed.title === 'string' && parsed.title.trim()) ? parsed.title.trim() : cleanTitleFallback,
        description: (parsed.description && typeof parsed.description === 'string' && parsed.description.trim()) ? parsed.description.trim() : fallbackResult.description,
        tags: (Array.isArray(parsed.tags) && parsed.tags.length > 0) ? parsed.tags.slice(0, 5) : fallbackResult.tags,
        metrics: (parsed.metrics && typeof parsed.metrics === 'string' && parsed.metrics.trim()) ? parsed.metrics.trim() : fallbackResult.metrics,
        imagePrompt: (parsed.imagePrompt && typeof parsed.imagePrompt === 'string' && parsed.imagePrompt.trim().length > 15)
          ? parsed.imagePrompt.replace(/^["']|["']$/g, '').trim()
          : fallbackResult.imagePrompt,
      };
    }
  } catch (err) {
    console.warn('AI project summarization fallback due to error:', err);
  }

  return fallbackResult;
};

export interface PaletteSubOption {
  id: string;
  name: string;
  badge: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  accentGlow: string;
  border: string;
  borderHover?: string;
}

export interface SuggestedBasePalette {
  id: string;
  name: string;
  description: string;
  bg: string;
  surface: string;
  isDark: boolean;
  subOptions: PaletteSubOption[];
}

export interface SuggestPalettesResult {
  detectedRole: string;
  questionMessage: string;
  palettes: SuggestedBasePalette[];
}

/**
 * Dynamically generates bespoke, accessible color palettes and adapted text/accent sub-options
 * via LLM based on user prompt and domain context.
 */
export const suggestPalettesForPrompt = async (
  userPromptText: string,
  config: AiClientConfig = {}
): Promise<SuggestPalettesResult> => {
  const ai = getAiClient(config);

  const fallback = generateFallbackPalettes(userPromptText);

  if (!ai) {
    return fallback;
  }

  const systemPrompt = `You are a world-class digital Art Director and UI/UX design expert specializing in modern engineering portfolios.
The user wants to generate a portfolio, but did NOT specify a color palette.

Your mission:
1. Identify the professional role, seniority, or technical discipline (e.g., DevOps Engineer, Full-Stack Developer, UI/UX Designer, Data Scientist, Cybersecurity Specialist, Student, etc.).
2. Write a warm, professional, motivating 1-2 sentence French question message:
   "Pour concevoir un portfolio qui valorise au mieux votre profil de [Rôle], quelle direction chromatique préférez-vous ? J'ai conçu ces harmonies adaptées à votre univers :"
3. Generate 4 to 5 DISTINCT, bespoke base color palettes specifically curated for this discipline:
   - Provide at least 2 dark palettes, at least 1 clean light/editorial palette, and 1 distinctive thematic palette (e.g. amber/yellow or vibrant cyber/forest).
   - For EACH base palette, generate 2 to 3 adapted sub-options (subOptions) providing meticulously paired text colors and accent colors that GUARANTEE high readability (WCAG AA/AAA).
   - CRITICAL: If the background (bg) is light or yellow/warm (e.g. #fef08a, #fffbeb, #ffffff, #f8fafc), textPrimary MUST BE DARK (#0f172a, #18181b), NEVER light.
   - If the background is dark (#09090b, #0a0f1d, #050a07), textPrimary MUST BE LIGHT (#f8fafc, #ffffff).
   - Provide exact hex color codes for bg, surface, textPrimary, textSecondary, accent, accentHover, accentGlow (rgba string), border (rgba string).
   - All labels, badges, and descriptions MUST be in elegant French.

Output ONLY a valid JSON object matching:
{
  "detectedRole": string,
  "questionMessage": string,
  "palettes": [
    {
      "id": string,
      "name": string,
      "description": string,
      "bg": string,
      "surface": string,
      "isDark": boolean,
      "subOptions": [
        {
          "id": string,
          "name": string,
          "badge": string,
          "textPrimary": string,
          "textSecondary": string,
          "accent": string,
          "accentHover": string,
          "accentGlow": string,
          "border": string
        }
      ]
    }
  ]
}`;

  try {
    const callPromise = ai.client.chat.completions.create({
      model: ai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Prompt utilisateur : "${userPromptText}". Génère les propositions de palettes adaptées maintenant.` },
      ],
      temperature: 0.4,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI palette generation timeout')), 8000)
    );

    const response: any = await Promise.race([callPromise, timeoutPromise]);

    const content = response.choices[0]?.message?.content || '';
    const parsed = extractJson(content);

    if (parsed && Array.isArray(parsed.palettes) && parsed.palettes.length >= 3) {
      return {
        detectedRole: parsed.detectedRole || fallback.detectedRole,
        questionMessage: parsed.questionMessage || fallback.questionMessage,
        palettes: parsed.palettes.map((p: any, idx: number) => ({
          id: p.id || `ai-palette-${idx + 1}`,
          name: p.name || `Palette ${idx + 1}`,
          description: p.description || '',
          bg: p.bg || '#09090b',
          surface: p.surface || '#18181b',
          isDark: typeof p.isDark === 'boolean' ? p.isDark : true,
          subOptions: Array.isArray(p.subOptions) && p.subOptions.length > 0
            ? p.subOptions.map((s: any, sIdx: number) => ({
                id: s.id || `sub-${idx}-${sIdx}`,
                name: s.name || `Option ${sIdx + 1}`,
                badge: s.badge || 'Contraste Garanti (AAA)',
                textPrimary: s.textPrimary || (p.isDark ? '#f8fafc' : '#0f172a'),
                textSecondary: s.textSecondary || (p.isDark ? '#94a3b8' : '#475569'),
                accent: s.accent || '#3b82f6',
                accentHover: s.accentHover || s.accent || '#2563eb',
                accentGlow: s.accentGlow || 'rgba(59, 130, 246, 0.25)',
                border: s.border || 'rgba(255, 255, 255, 0.08)',
              }))
            : fallback.palettes[0].subOptions,
        })),
      };
    }
  } catch (err) {
    console.warn('AI palette suggestion fallback due to error:', err);
  }

  return fallback;
};

/**
 * Robust fallback generator that dynamically adapts to prompt keywords
 */
function generateFallbackPalettes(prompt: string): SuggestPalettesResult {
  const lower = prompt.toLowerCase();
  let role = 'Ingénieur Logiciel & Développeur';
  if (lower.includes('devops') || lower.includes('cloud') || lower.includes('kubernetes')) {
    role = 'Ingénieur DevOps & Cloud';
  } else if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
    role = 'Designer UI/UX & Produit';
  } else if (lower.includes('data') || lower.includes('ai') || lower.includes('ia') || lower.includes('ml')) {
    role = 'Data Scientist & Ingénieur IA';
  } else if (lower.includes('security') || lower.includes('cyber') || lower.includes('sécurité')) {
    role = 'Expert en Cybersécurité';
  } else if (lower.includes('frontend') || lower.includes('react')) {
    role = 'Développeur Frontend';
  } else if (lower.includes('backend') || lower.includes('node') || lower.includes('go')) {
    role = 'Développeur Backend';
  }

  return {
    detectedRole: role,
    questionMessage: `Pour concevoir un portfolio qui valorise au mieux votre profil de ${role}, quelle direction chromatique préférez-vous ? J'ai préparé ces harmonies adaptées à votre univers :`,
    palettes: [
      {
        id: 'palette-clean-light',
        name: 'Blanc Pur & Minimaliste',
        description: 'Clarté absolue, esprit éditorial et élégant avec une lisibilité maximale.',
        bg: '#ffffff',
        surface: '#f8fafc',
        isDark: false,
        subOptions: [
          {
            id: 'sub-slate-blue',
            name: 'Texte Noir Ardoise + Bleu Royal',
            badge: 'Haute Lisibilité (AAA)',
            textPrimary: '#0f172a',
            textSecondary: '#475569',
            accent: '#2563eb',
            accentHover: '#1d4ed8',
            accentGlow: 'rgba(37, 99, 235, 0.15)',
            border: 'rgba(15, 23, 42, 0.08)',
          },
        ],
      },
      {
        id: 'palette-warm-cream',
        name: 'Crème Éditoriale & Ambre',
        description: 'Chaleureux, raffiné et élégant avec des touches ambrées modernes.',
        bg: '#fdfbf7',
        surface: '#ffffff',
        isDark: false,
        subOptions: [
          {
            id: 'sub-cream-amber',
            name: 'Texte Ébène + Ambre Doré',
            badge: 'Élégance Pure',
            textPrimary: '#1c1917',
            textSecondary: '#78716c',
            accent: '#d97706',
            accentHover: '#b45309',
            accentGlow: 'rgba(217, 119, 6, 0.15)',
            border: 'rgba(28, 25, 23, 0.08)',
          },
        ],
      },
      {
        id: 'palette-nordic-frost',
        name: 'Glace Nordique & Cyan',
        description: 'Ultra-propre et net, inspiré des interfaces cloud et tech modernes.',
        bg: '#f8fafc',
        surface: '#ffffff',
        isDark: false,
        subOptions: [
          {
            id: 'sub-nordic-cyan',
            name: 'Texte Ardoise + Cyan Moderne',
            badge: 'Tech & Net',
            textPrimary: '#0f172a',
            textSecondary: '#334155',
            accent: '#0284c7',
            accentHover: '#0369a1',
            accentGlow: 'rgba(2, 132, 199, 0.15)',
            border: 'rgba(15, 23, 42, 0.08)',
          },
        ],
      },
      {
        id: 'palette-sage-emerald',
        name: 'Sauge Douce & Émeraude',
        description: 'Nuances fraîches, modernes et équilibrées pour une ambiance apaisante.',
        bg: '#f0fdf4',
        surface: '#ffffff',
        isDark: false,
        subOptions: [
          {
            id: 'sub-sage-green',
            name: 'Texte Forêt + Émeraude Vivant',
            badge: 'Harmonie Nature',
            textPrimary: '#14532d',
            textSecondary: '#374151',
            accent: '#059669',
            accentHover: '#047857',
            accentGlow: 'rgba(5, 150, 105, 0.15)',
            border: 'rgba(20, 83, 45, 0.08)',
          },
        ],
      },
    ],
  };
}

/**
 * Chat with AI about a specific portfolio context (Recruiter / AI Avatar Chat)
 * Supports multiple providers: OpenAI, Gemini, Groq, NVIDIA NIM, and BYOK custom keys
 */
export async function chatWithPortfolioAi(
  portfolio: any,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  userQuestion: string,
  options: {
    provider?: 'openai' | 'gemini' | 'groq' | 'nvidia' | 'byok';
    apiKey?: string;
    model?: string;
  } = {}
) {
  // Extract custom or portfolio settings
  const botConfig = portfolio?.aiChatbot || {};
  const provider = options.provider || botConfig.provider || 'openai';
  const apiKey = options.apiKey || botConfig.apiKey;
  const requestedModel = options.model || botConfig.model;

  let client: OpenAI;
  let modelName = 'gpt-4o-mini';

  if (provider === 'gemini') {
    // Google Gemini via OpenAI-compatible endpoint
    client = new OpenAI({
      apiKey: apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
    modelName = requestedModel || 'gemini-1.5-flash';
  } else if (provider === 'groq') {
    client = new OpenAI({
      apiKey: apiKey || process.env.GROQ_API_KEY || '',
      baseURL: 'https://api.groq.com/openai/v1',
    });
    modelName = requestedModel || 'llama-3.3-70b-versatile';
  } else if (provider === 'nvidia') {
    client = new OpenAI({
      apiKey: apiKey || process.env.NVIDIA_API_KEY || '',
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
    modelName = requestedModel || process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';
  } else {
    // Default to OpenAI
    client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || '',
    });
    modelName = requestedModel || 'gpt-4o-mini';
  }

  // Extract key information from portfolio schema
  const hero = portfolio?.sections?.find((s: any) => s.type === 'hero')?.data || {};
  const about = portfolio?.sections?.find((s: any) => s.type === 'about')?.data || {};
  const skills = portfolio?.sections?.find((s: any) => s.type === 'skills')?.data || {};
  const projects = portfolio?.sections?.find((s: any) => s.type === 'projects')?.data || {};
  const experience = portfolio?.sections?.find((s: any) => s.type === 'experience')?.data || {};
  const contact = portfolio?.sections?.find((s: any) => s.type === 'contact')?.data || {};

  const developerName = hero.name || portfolio?.meta?.title || 'le développeur';
  const developerTitle = hero.title || 'Développeur / Ingénieur';
  const developerBio = Array.isArray(about.bio) ? about.bio.join('\n') : (about.bio || hero.tagline || '');

  const skillsList = skills.categories 
    ? skills.categories.map((c: any) => `${c.name}: ${c.skills?.join(', ')}`).join('\n')
    : 'Non spécifié';

  const projectsList = projects.projects 
    ? projects.projects.map((p: any) => `- ${p.title}: ${p.description} (Tech: ${p.tags?.join(', ') || 'N/A'})`).join('\n')
    : 'Aucun projet spécifié';

  const experienceList = experience.items
    ? experience.items.map((e: any) => `- ${e.role} chez ${e.company} (${e.period}): ${e.description}`).join('\n')
    : 'Aucune expérience spécifiée';

  const contactInfo = `Email: ${contact.email || 'Non spécifié'}`;

  const systemPrompt = `Tu es l'assistant personnel IA et le jumeau numérique officiel de ${developerName}.
Ton rôle est de représenter ${developerName} avec courtoisie, professionnalisme et enthousiasme auprès des recruteurs, collègues et clients visitant son portfolio.

Voici les informations officielles concernant ${developerName} :
- Nom : ${developerName}
- Titre / Métier : ${developerTitle}
- Bio / Présentation : ${developerBio}
- Compétences techniques :
${skillsList}
- Projets réalisés :
${projectsList}
- Expériences professionnelles :
${experienceList}
- Contact : ${contactInfo}

DIRECTIVES STRICTES :
1. Tu réponds à la 1ère personne du singulier ("Je...").
2. FIDÉLITÉ FACTUELLE ABSOLUE : Base tes réponses STRICTEMENT et UNIQUEMENT sur les informations fournies ci-dessus. N'invente AUCUNE technologie, diplôme, entreprise, expérience ou projet qui ne figure pas explicitement dans ce document.
3. Si une information demandée n'est pas mentionnée dans le portfolio, dis-le clairement et poliment sans spéculer, et invite l'utilisateur à contacter ${developerName} directement via email.
4. Sois concis, précis, factuel et direct.
5. Réponds dans la langue employée par l'interlocuteur (français si en français, anglais si en anglais).`;

  const conversationHistory = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.slice(-6), // Keep last 6 messages for context
    { role: 'user' as const, content: userQuestion }
  ];

  const completion = await client.chat.completions.create({
    model: modelName,
    messages: conversationHistory,
    temperature: 0.0, // Strictest determinism, zero creativity/hallucination
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || "Je n'ai pas pu générer de réponse pour le moment.";
}



