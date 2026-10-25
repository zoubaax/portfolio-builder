import { Request, Response } from 'express';
import {
  streamAiEdit,
  generatePortfolioFromPrompt,
  summarizeProjectWithAi,
  suggestPalettesForPrompt,
  chatWithPortfolioAi,
} from '../services/aiService.js';
import { imageService } from '../services/imageService.js';
import { aiUsageService, estimateTokens } from '../services/aiUsageService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const aiController = {
  /**
   * Server-Sent Events (SSE) Streaming endpoint for AI Copilot chat edits
   */
  async streamChat(req: Request, res: Response) {
    const startTime = Date.now();
    const userId = (req as any).auth?.userId || req.body.userId || null;
    const { portfolio, prompt, provider, byokKey } = req.body;
    const activeProvider = provider || process.env.DEFAULT_AI_PROVIDER || 'nvidia';
    const activeModel = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

    if (!portfolio || !prompt) {
      return sendError(res, 'BAD_REQUEST', 'Missing portfolio schema or prompt', 400);
    }

    // Set SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      const updatedPortfolio = await streamAiEdit(
        portfolio,
        prompt,
        { provider, byokKey },
        (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      res.write(`data: ${JSON.stringify({ done: true, updatedPortfolio })}\n\n`);
      res.end();

      // Record AI token usage asynchronously
      const promptTok = estimateTokens(prompt) + estimateTokens(JSON.stringify(portfolio).slice(0, 4000));
      const compTok = estimateTokens(JSON.stringify(updatedPortfolio).slice(0, 4000));
      aiUsageService.recordUsage({
        userId,
        operation: 'stream-chat',
        provider: activeProvider,
        model: activeModel,
        promptTokens: promptTok,
        completionTokens: compTok,
        totalTokens: promptTok + compTok,
        durationMs: Date.now() - startTime,
        status: 'success',
      });
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'AI generation failed' })}\n\n`);
      res.end();

      aiUsageService.recordUsage({
        userId,
        operation: 'stream-chat',
        provider: activeProvider,
        model: activeModel,
        promptTokens: estimateTokens(prompt),
        completionTokens: 0,
        totalTokens: estimateTokens(prompt),
        durationMs: Date.now() - startTime,
        status: 'error',
      });
    }
  },

  /**
   * Zero-to-one portfolio generation from a single prompt
   */
  async generateInitial(req: Request, res: Response) {
    const startTime = Date.now();
    const userId = (req as any).auth?.userId || req.body.userId || null;
    const { description, provider, byokKey } = req.body;
    const activeProvider = provider || process.env.DEFAULT_AI_PROVIDER || 'nvidia';
    const activeModel = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

    try {
      if (!description?.trim()) {
        return sendError(res, 'BAD_REQUEST', 'Description prompt is required', 400);
      }

      const generatedSchema = await generatePortfolioFromPrompt(description, {
        provider,
        byokKey,
      });

      const promptTok = estimateTokens(description);
      const compTok = estimateTokens(JSON.stringify(generatedSchema));
      aiUsageService.recordUsage({
        userId,
        operation: 'generate',
        provider: activeProvider,
        model: activeModel,
        promptTokens: promptTok,
        completionTokens: compTok,
        totalTokens: promptTok + compTok,
        durationMs: Date.now() - startTime,
        status: 'success',
      });

      return sendSuccess(res, generatedSchema, 'Portfolio generated successfully');
    } catch (err: any) {
      aiUsageService.recordUsage({
        userId,
        operation: 'generate',
        provider: activeProvider,
        model: activeModel,
        promptTokens: estimateTokens(description),
        completionTokens: 0,
        totalTokens: estimateTokens(description),
        durationMs: Date.now() - startTime,
        status: 'error',
      });
      return sendError(res, 'AI_GEN_FAILED', err.message || 'Failed to generate portfolio', 500);
    }
  },

  /**
   * Generate an image for a project using FLUX.1-schnell (with resilient fallback)
   */
  async generateProjectImage(req: Request, res: Response) {
    const startTime = Date.now();
    const userId = (req as any).auth?.userId || req.body.userId || null;
    try {
      const { title, description, tags, prompt, currentImageUrl } = req.body;
      const result = await imageService.generateProjectImage({
        title,
        description,
        tags,
        prompt,
        currentImageUrl,
      });

      aiUsageService.recordUsage({
        userId,
        operation: 'image',
        provider: result.provider || 'cloudflare',
        model: '@cf/black-forest-labs/flux-1-schnell',
        promptTokens: estimateTokens(prompt || description || title),
        completionTokens: 50, // Image generation equivalent
        totalTokens: estimateTokens(prompt || description || title) + 50,
        durationMs: Date.now() - startTime,
        status: 'success',
      });

      return sendSuccess(res, result, 'Project visual generated');
    } catch (err: any) {
      aiUsageService.recordUsage({
        userId,
        operation: 'image',
        provider: 'cloudflare',
        model: '@cf/black-forest-labs/flux-1-schnell',
        durationMs: Date.now() - startTime,
        status: 'error',
      });
      return sendError(res, 'IMAGE_GEN_FAILED', err.message || 'Failed to generate visual', 500);
    }
  },

  /**
   * Synthesize an ultra-clean, high-impact project summary and tags from GitHub README documentation
   */
  async summarizeProject(req: Request, res: Response) {
    const startTime = Date.now();
    const userId = (req as any).auth?.userId || req.body.userId || null;
    const { name, owner, language, topics, rawDescription, readmeContent, provider, byokKey } = req.body;
    const activeProvider = provider || process.env.DEFAULT_AI_PROVIDER || 'nvidia';
    const activeModel = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

    try {
      if (!name) {
        return sendError(res, 'BAD_REQUEST', 'Repository name is required', 400);
      }

      const summary = await summarizeProjectWithAi(
        {
          name,
          owner,
          language,
          topics,
          rawDescription,
          readmeContent,
        },
        { provider, byokKey }
      );

      const promptTok = estimateTokens(readmeContent || rawDescription || name);
      const compTok = estimateTokens(JSON.stringify(summary));
      aiUsageService.recordUsage({
        userId,
        operation: 'summarize',
        provider: activeProvider,
        model: activeModel,
        promptTokens: promptTok,
        completionTokens: compTok,
        totalTokens: promptTok + compTok,
        durationMs: Date.now() - startTime,
        status: 'success',
      });

      return sendSuccess(res, summary, 'Project synthesized successfully');
    } catch (err: any) {
      aiUsageService.recordUsage({
        userId,
        operation: 'summarize',
        provider: activeProvider,
        model: activeModel,
        durationMs: Date.now() - startTime,
        status: 'error',
      });
      return sendError(res, 'AI_SUMMARIZE_FAILED', err.message || 'Failed to summarize project', 500);
    }
  },

  /**
   * Dynamically generate tailored color palettes and adapted sub-options when prompt lacks color
   */
  async suggestPalettes(req: Request, res: Response) {
    const startTime = Date.now();
    const userId = (req as any).auth?.userId || req.body.userId || null;
    const { prompt, provider, byokKey } = req.body;
    const activeProvider = provider || process.env.DEFAULT_AI_PROVIDER || 'nvidia';
    const activeModel = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

    try {
      if (!prompt || typeof prompt !== 'string') {
        return sendError(res, 'BAD_REQUEST', 'Prompt string is required', 400);
      }

      const result = await suggestPalettesForPrompt(prompt, { provider, byokKey });

      const promptTok = estimateTokens(prompt);
      const compTok = estimateTokens(JSON.stringify(result));
      aiUsageService.recordUsage({
        userId,
        operation: 'suggest-palettes',
        provider: activeProvider,
        model: activeModel,
        promptTokens: promptTok,
        completionTokens: compTok,
        totalTokens: promptTok + compTok,
        durationMs: Date.now() - startTime,
        status: 'success',
      });

      return sendSuccess(res, result, 'AI Color palettes generated successfully');
    } catch (err: any) {
      aiUsageService.recordUsage({
        userId,
        operation: 'suggest-palettes',
        provider: activeProvider,
        model: activeModel,
        durationMs: Date.now() - startTime,
        status: 'error',
      });
      return sendError(res, 'PALETTE_SUGGEST_FAILED', err.message || 'Failed to suggest color palettes', 500);
    }
  },

  /**
   * Chat directly with AI as the portfolio's digital twin / recruiter assistant
   */
  async chatWithPortfolio(req: Request, res: Response) {
    const startTime = Date.now();
    const userId = (req as any).auth?.userId || req.body.userId || null;
    const { portfolio, messages, question, provider, apiKey, model } = req.body;
    const activeProvider = provider || process.env.DEFAULT_AI_PROVIDER || 'nvidia';
    const activeModel = model || process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

    try {
      if (!portfolio || !question) {
        return sendError(res, 'BAD_REQUEST', 'Portfolio data and question are required', 400);
      }

      const reply = await chatWithPortfolioAi(portfolio, messages || [], question, {
        provider,
        apiKey,
        model,
      });

      const promptTok = estimateTokens(question) + estimateTokens(JSON.stringify(messages || []));
      const compTok = estimateTokens(reply);
      aiUsageService.recordUsage({
        userId,
        operation: 'portfolio-chat',
        provider: activeProvider,
        model: activeModel,
        promptTokens: promptTok,
        completionTokens: compTok,
        totalTokens: promptTok + compTok,
        durationMs: Date.now() - startTime,
        status: 'success',
      });

      return sendSuccess(res, { reply }, 'AI response generated');
    } catch (err: any) {
      aiUsageService.recordUsage({
        userId,
        operation: 'portfolio-chat',
        provider: activeProvider,
        model: activeModel,
        durationMs: Date.now() - startTime,
        status: 'error',
      });
      return sendError(res, 'PORTFOLIO_CHAT_FAILED', err.message || 'Failed to chat with portfolio AI', 500);
    }
  },
};
