import { Request, Response } from 'express';
import { streamAiEdit, generatePortfolioFromPrompt } from '../services/aiService.js';
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
};
