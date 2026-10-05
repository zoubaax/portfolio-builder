import dotenv from 'dotenv';
import { generateImagePromptWithAi } from './aiService.js';
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
   * Generates a project visual using a 2-tier AI pipeline:
   * Tier 1: Normal LLM designs a tailored, clean UI/software interface prompt (NO 3D, NO cartoons).
   * Tier 2: Cloudflare Workers AI (FLUX.1-schnell) renders the high-res visual banner.
   */
  async generateProjectImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
    dotenv.config({ override: true });
    const { title = 'Project', description = '', tags = [] } = options;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error(
        "Identifiants Cloudflare manquants dans le backend/.env. Veuillez configurer CLOUDFLARE_ACCOUNT_ID et CLOUDFLARE_API_TOKEN."
      );
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

    // 2. Tier 1: If prompt is not already supplied, ask the LLM to design an expert clean UI prompt
    let tailoredPrompt = (options.prompt || '').trim();
    if (!tailoredPrompt) {
      console.log(`[ImageService] Tier 1: Asking LLM to engineer a clean UI visual prompt for "${title}"...`);
      tailoredPrompt = await generateImagePromptWithAi({
        title,
        description: cleanReadme,
        tags,
      });
    }

    console.log(`[ImageService] Tier 2: Calling Cloudflare FLUX.1 for "${title}" with prompt: "${tailoredPrompt}"`);

    // 3. Call Cloudflare Workers AI endpoint (with a 25s timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          prompt: tailoredPrompt,
          steps: 4,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Cloudflare API a retourné le code ${response.status}: ${errorText.slice(0, 120) || response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let base64Image = '';

      if (contentType.includes('application/json')) {
        const data = (await response.json()) as any;
        if (data?.result?.image) {
          base64Image = data.result.image;
        } else if (data?.errors && data.errors.length > 0) {
          throw new Error(`Cloudflare AI error: ${data.errors[0]?.message || 'Erreur inconnue'}`);
        }
      } else {
        // Binary stream response
        const arrayBuffer = await response.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString('base64');
      }

      if (base64Image) {
        console.log(`[ImageService] Cloudflare AI successfully generated image for "${title}"`);
        return {
          imageUrl: `data:image/jpeg;base64,${base64Image}`,
          isAiGenerated: true,
          provider: 'cloudflare/@cf/black-forest-labs/flux-1-schnell',
        };
      }

      throw new Error("Cloudflare AI n'a retourné aucune image valide.");
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error("Délai d'attente dépassé (Cloudflare AI n'a pas répondu à temps).");
      }
      throw err;
    }
  }
}

export const imageService = new ImageService();
