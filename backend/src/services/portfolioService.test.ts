import { describe, it, expect } from 'vitest';
import { sanitizePublicSchema } from './portfolioService.js';

describe('portfolioService: sanitizePublicSchema', () => {
  it('strips aiChatbot.apiKey from public portfolio schema', () => {
    const rawSchema = {
      meta: { title: 'Alex Vance', slug: 'alex' },
      theme: { id: 'cyber-dark' },
      sections: [{ type: 'hero', data: { name: 'Alex' } }],
      aiChatbot: {
        enabled: true,
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'sk-proj-supersecretkey123456789',
      },
    };

    const sanitized = sanitizePublicSchema(rawSchema);

    expect(sanitized.aiChatbot.enabled).toBe(true);
    expect(sanitized.aiChatbot.provider).toBe('openai');
    expect(sanitized.aiChatbot.model).toBe('gpt-4o-mini');
    expect(sanitized.aiChatbot.apiKey).toBeUndefined();
    expect(rawSchema.aiChatbot.apiKey).toBe('sk-proj-supersecretkey123456789'); // Immutability
  });

  it('handles schemas without aiChatbot or without apiKey safely', () => {
    const schemaWithoutChatbot = {
      meta: { title: 'Test' },
      sections: [],
    };

    const result = sanitizePublicSchema(schemaWithoutChatbot);
    expect(result).toEqual(schemaWithoutChatbot);
  });

  it('handles null or invalid schemas gracefully', () => {
    expect(sanitizePublicSchema(null)).toBeNull();
    expect(sanitizePublicSchema(undefined)).toBeUndefined();
  });
});

