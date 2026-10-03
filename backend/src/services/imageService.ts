import dotenv from 'dotenv';
dotenv.config();

export interface GenerateImageOptions {
  prompt?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface GenerateImageResult {
  imageUrl: string;
  isAiGenerated: boolean;
  provider: string;
}

/**
 * Curated high-resolution tech/dev mockup images mapped to technology domains
 */
const TECH_FALLBACKS: Record<string, string[]> = {
  devops: [
    'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
  ],
  web: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  ],
  mobile: [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
  ],
  cloud: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  ]
};

function getSmartFallbackImage(title: string = '', tags: string[] = []): string {
  const combined = `${title} ${tags.join(' ')}`.toLowerCase();
  
  if (combined.includes('devops') || combined.includes('docker') || combined.includes('k8s') || combined.includes('ci/cd') || combined.includes('pipeline')) {
    return TECH_FALLBACKS.devops[Math.floor(Math.random() * TECH_FALLBACKS.devops.length)];
  }
  if (combined.includes('ai') || combined.includes('gpt') || combined.includes('llm') || combined.includes('ml') || combined.includes('intelligence')) {
    return TECH_FALLBACKS.ai[Math.floor(Math.random() * TECH_FALLBACKS.ai.length)];
  }
  if (combined.includes('mobile') || combined.includes('react native') || combined.includes('flutter') || combined.includes('ios') || combined.includes('android')) {
    return TECH_FALLBACKS.mobile[0];
  }
  if (combined.includes('cloud') || combined.includes('aws') || combined.includes('azure') || combined.includes('server')) {
    return TECH_FALLBACKS.cloud[0];
  }
  if (combined.includes('react') || combined.includes('vue') || combined.includes('frontend') || combined.includes('web') || combined.includes('portfolio')) {
    return TECH_FALLBACKS.web[Math.floor(Math.random() * TECH_FALLBACKS.web.length)];
  }
  return TECH_FALLBACKS.default[Math.floor(Math.random() * TECH_FALLBACKS.default.length)];
}

export class ImageService {
  /**
   * Generates a project visual using FLUX.1-schnell via NVIDIA NIM,
   * with seamless fallback to curated tech visuals if timeout or offline.
   */
  async generateProjectImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
    const { title = 'Tech Project', description = '', tags = [] } = options;
    const apiKey = process.env.NVIDIA_IMAGE_API_KEY || process.env.NVIDIA_API_KEY;

    const refinedPrompt = options.prompt || 
      `Sleek 3D isometric modern mockup showcase of software project "${title}": ${description}. Tech stack ${tags.join(', ')}. Minimalist dark glassmorphism UI, glowing neon accents, high resolution digital product render, 16:9 aspect ratio, trending on Dribbble`;

    if (apiKey) {
      try {
        console.log(`[ImageService] Calling NVIDIA FLUX.1-schnell for project "${title}"...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

        const response = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            prompt: refinedPrompt,
            mode: 'text-to-image',
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = (await response.json()) as any;
          if (data?.artifacts?.[0]?.base64) {
            console.log(`[ImageService] FLUX.1-schnell successfully generated image for "${title}"`);
            return {
              imageUrl: `data:image/jpeg;base64,${data.artifacts[0].base64}`,
              isAiGenerated: true,
              provider: 'nvidia/flux.1-schnell',
            };
          }
        } else {
          console.warn(`[ImageService] FLUX.1-schnell status ${response.status} ${response.statusText}`);
        }
      } catch (err: any) {
        console.warn(`[ImageService] FLUX generation skipped (${err.message}). Using smart tech visual.`);
      }
    }

    // Fallback to high-res contextually matched tech visual
    const fallbackUrl = getSmartFallbackImage(title, tags);
    return {
      imageUrl: fallbackUrl,
      isAiGenerated: false,
      provider: 'smart-tech-fallback',
    };
  }
}

export const imageService = new ImageService();
