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
 * Curated high-resolution tech/dev product mockup images mapped to technology domains (NO generic code/matrix photos)
 */
const TECH_FALLBACKS: Record<string, string[]> = {
  devops: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
  ],
  security: [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  ],
  web: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  ],
  mobile: [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
  ],
  cloud: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  ]
};

function getSmartFallbackImage(title: string = '', tags: string[] = []): string {
  const combined = `${title} ${tags.join(' ')}`.toLowerCase();
  
  if (combined.includes('security') || combined.includes('audit') || combined.includes('vulnerability') || combined.includes('scanner') || combined.includes('network')) {
    return TECH_FALLBACKS.security[Math.floor(Math.random() * TECH_FALLBACKS.security.length)];
  }
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
    return TECH_FALLBACKS.cloud[Math.floor(Math.random() * TECH_FALLBACKS.cloud.length)];
  }
  if (combined.includes('react') || combined.includes('vue') || combined.includes('frontend') || combined.includes('web') || combined.includes('portfolio') || combined.includes('javascript') || combined.includes('typescript')) {
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

    // Sanitize description: eliminate HTML, markdown badges, raw URLs
    const cleanDescription = (description || '')
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '$1')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);

    const refinedPrompt = options.prompt || 
      `Commercial 3D software product showcase mockup banner for "${title}". Centered sleek modern ultra-wide desktop monitor showing a futuristic dark UI dashboard with data analytics, interactive charts, and system topology for ${cleanDescription || title}. Surrounded by floating frosted glass 3D widget cards with glowing icons for ${tags.join(', ')} connected with subtle neon cyan laser lines. Modern tech workspace desk, ambient dark studio lighting, depth of field, photorealistic 8k render, octane render style, behance tech award winner, no text distortion.`;

    if (apiKey) {
      try {
        console.log(`[ImageService] Calling NVIDIA FLUX.1-schnell for project "${title}"...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for high-res generation

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
