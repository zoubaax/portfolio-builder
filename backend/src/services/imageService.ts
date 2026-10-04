import dotenv from 'dotenv';
dotenv.config();

export interface GenerateImageOptions {
  prompt?: string;
  title?: string;
  description?: string;
  tags?: string[];
  currentImageUrl?: string;
}

export interface GenerateImageResult {
  imageUrl: string;
  isAiGenerated: boolean;
  provider: string;
}

export class ImageService {
  /**
   * Generates a project visual strictly using the AI image generation model (FLUX.1-schnell).
   * Constructs a universal general prompt based on the real README and title of the project.
   * Throws an error if the AI model fails, times out, or is offline (NO fake/hardcoded fallbacks).
   */
  async generateProjectImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
    const { title = 'Project', description = '', tags = [] } = options;
    const apiKey = process.env.NVIDIA_IMAGE_API_KEY || process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      throw new Error("Clé API d'image non configurée sur le serveur.");
    }

    // 1. Sanitize and extract the real README overview
    const cleanReadme = (description || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '$1')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[#*`~_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300);

    // 2. Universal general prompt template: works with ANY project based on its README
    const universalPrompt = options.prompt || 
      `High-quality 3D commercial visual concept and product showcase banner representing the software project "${title}". ` +
      `Directly illustrating the core functionality and real-world domain described in its project overview: "${cleanReadme || title}". ` +
      `Key technologies: ${tags.join(', ') || 'Modern Software Engineering'}. ` +
      `Cinematic studio lighting, 8k octane render, photorealistic, elegant dark tech aesthetic, no text distortion.`;

    console.log(`[ImageService] Calling AI Image Generator for "${title}" with universal README prompt...`);

    // 3. Call AI image generator (with a 12s timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      const response = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: universalPrompt,
          mode: 'text-to-image',
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`L'API d'IA a retourné le code ${response.status}: ${errorText.slice(0, 100) || response.statusText}`);
      }

      const data = (await response.json()) as any;
      if (data?.artifacts?.[0]?.base64) {
        console.log(`[ImageService] AI successfully generated image for "${title}"`);
        return {
          imageUrl: `data:image/jpeg;base64,${data.artifacts[0].base64}`,
          isAiGenerated: true,
          provider: 'nvidia/flux.1-schnell',
        };
      }

      throw new Error("L'IA n'a retourné aucune image valide.");
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error("Délai d'attente dépassé (l'API d'IA n'a pas répondu à temps).");
      }
      throw err;
    }
  }
}

export const imageService = new ImageService();
