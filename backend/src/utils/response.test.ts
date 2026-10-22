import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendError } from './response.js';
import { Response } from 'express';

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('Backend Response Utilities', () => {
  describe('sendSuccess', () => {
    it('sends standardized success envelope with default 200 status', () => {
      const res = createMockResponse();
      const testData = { id: 'p_123', name: 'Demo Portfolio' };

      sendSuccess(res, testData, 'Fetched successfully');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: testData,
        message: 'Fetched successfully',
      });
    });

    it('supports custom status code like 201 Created', () => {
      const res = createMockResponse();
      sendSuccess(res, { created: true }, 'Created', 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendError', () => {
    it('sends standardized error envelope with error code and details', () => {
      const res = createMockResponse();
      sendError(
        res,
        'NOT_FOUND',
        'Resource not found',
        404,
        { resourceId: 'xyz' }
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          details: { resourceId: 'xyz' },
        },
      });
    });
  });
});
