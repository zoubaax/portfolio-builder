import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImageService } from './imageService.js';
import * as aiService from './aiService.js';

vi.mock('dotenv', () => ({
  default: {
    config: vi.fn(),
  },
}));

vi.mock('./aiService.js', () => ({
  generateImagePromptWithAi: vi.fn(),
}));

describe('ImageService Unit Tests', () => {
  const originalEnv = { ...process.env };
  let service: ImageService;

  beforeEach(() => {
    service = new ImageService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws an informative error if Cloudflare credentials are missing', async () => {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;

    await expect(
      service.generateProjectImage({ title: 'Test Project' })
    ).rejects.toThrow(/Identifiants Cloudflare manquants/i);
  });

  it('calls AI prompt engineer when prompt is not provided', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'cf_account_123';
    process.env.CLOUDFLARE_API_TOKEN = 'cf_token_xyz';

    vi.mocked(aiService.generateImagePromptWithAi).mockResolvedValue(
      'A sleek modern developer dashboard interface'
    );

    // Mock fetch for Cloudflare AI API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({
        result: { image: 'mockBase64String' },
      }),
    } as any);

    const result = await service.generateProjectImage({
      title: 'DevOps Portfolio',
      description: 'A platform for building portfolios',
      tags: ['react', 'devops'],
    });

    expect(aiService.generateImagePromptWithAi).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'DevOps Portfolio',
        tags: ['react', 'devops'],
      })
    );
    expect(result.imageUrl).toContain('mockBase64String');
    expect(result.isAiGenerated).toBe(true);
    expect(result.provider).toBe('cloudflare/@cf/black-forest-labs/flux-1-schnell');
  });

  it('handles Cloudflare API HTTP failure with descriptive error', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'cf_account_123';
    process.env.CLOUDFLARE_API_TOKEN = 'cf_token_xyz';

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Rate Limited',
      text: async () => 'Too Many Requests',
    } as any);

    await expect(
      service.generateProjectImage({ prompt: 'Custom prompt', title: 'Test' })
    ).rejects.toThrow(/Cloudflare API a retourné le code 429/i);
  });
});
