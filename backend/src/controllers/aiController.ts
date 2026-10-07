import { Request, Response } from 'express';
import { streamAiEdit, generatePortfolioFromPrompt, summarizeProjectWithAi, suggestPalettesForPrompt, chatWithPortfolioAi } from '../services/aiService.js';
import { imageService } from '../services/imageService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const aiController = {
  /**
   * Server-Sent Events (SSE) Streaming endpoint for AI Copilot chat edits
   */
  async streamChat(req: Request, res: Response) {
    const { portfolio, prompt, provider, byokKey } = req.body;

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
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'AI generation failed' })}\n\n`);
      res.end();
    }
  },

  /**
   * Zero-to-one portfolio generation from a single prompt
   */
  async generateInitial(req: Request, res: Response) {
    try {
      const { description, provider, byokKey } = req.body;

      if (!description?.trim()) {
        return sendError(res, 'BAD_REQUEST', 'Description prompt is required', 400);
      }

      const generatedSchema = await generatePortfolioFromPrompt(description, {
        provider,
        byokKey,
      });

      return sendSuccess(res, generatedSchema, 'Portfolio generated successfully');
    } catch (err: any) {
      return sendError(res, 'AI_GEN_FAILED', err.message || 'Failed to generate portfolio', 500);
    }
  },

  /**
   * Generate an image for a project using FLUX.1-schnell (with resilient fallback)
   */
  async generateProjectImage(req: Request, res: Response) {
    try {
      const { title, description, tags, prompt, currentImageUrl } = req.body;
      const result = await imageService.generateProjectImage({
        title,
        description,
        tags,
        prompt,
        currentImageUrl,
      });

      return sendSuccess(res, result, 'Project visual generated');
    } catch (err: any) {
      return sendError(res, 'IMAGE_GEN_FAILED', err.message || 'Failed to generate visual', 500);
    }
  },

  /**
   * Synthesize an ultra-clean, high-impact project summary and tags from GitHub README documentation
   */
  async summarizeProject(req: Request, res: Response) {
    try {
      const { name, owner, language, topics, rawDescription, readmeContent, provider, byokKey } = req.body;

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

      return sendSuccess(res, summary, 'Project synthesized successfully');
    } catch (err: any) {
      return sendError(res, 'AI_SUMMARIZE_FAILED', err.message || 'Failed to summarize project', 500);
    }
  },

  /**
   * Dynamically generate tailored color palettes and adapted sub-options when prompt lacks color
   */
  async suggestPalettes(req: Request, res: Response) {
    try {
      const { prompt, provider, byokKey } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return sendError(res, 'BAD_REQUEST', 'Prompt string is required', 400);
      }

      const result = await suggestPalettesForPrompt(prompt, { provider, byokKey });
      return sendSuccess(res, result, 'AI Color palettes generated successfully');
    } catch (err: any) {
      return sendError(res, 'PALETTE_SUGGEST_FAILED', err.message || 'Failed to suggest color palettes', 500);
    }
  },

  /**
   * Chat directly with AI as the portfolio's digital twin / recruiter assistant
   */
  async chatWithPortfolio(req: Request, res: Response) {
    try {
      const { portfolio, messages, question, provider, apiKey, model } = req.body;

      if (!portfolio || !question) {
        return sendError(res, 'BAD_REQUEST', 'Portfolio data and question are required', 400);
      }

      const reply = await chatWithPortfolioAi(portfolio, messages || [], question, {
        provider,
        apiKey,
        model,
      });
      return sendSuccess(res, { reply }, 'AI response generated');
    } catch (err: any) {
      return sendError(res, 'PORTFOLIO_CHAT_FAILED', err.message || 'Failed to chat with portfolio AI', 500);
    }
  },
};

