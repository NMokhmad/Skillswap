import { beforeAll, describe, expect, test } from '@jest/globals';
import { sendApiError } from '../app/helpers/apiResponse.js';
import {
  invokeProtected,
  makeAuthToken,
  mockReq,
  mockRes,
  withRequestId,
} from './helpers/controllerHarness.js';

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-secret';
});

describe('API contract integration', () => {
  test('sendApiError always returns code/message/requestId', () => {
    const req = mockReq({ path: '/api/unknown' });
    const res = mockRes();
    withRequestId(req, res);

    sendApiError(res, {
      status: 404,
      code: 'NOT_FOUND',
      message: 'Endpoint not found.',
    });

    expect(res.statusCode).toBe(404);
    expect(res.jsonData.error.code).toBe('NOT_FOUND');
    expect(res.jsonData.error.message).toBe('Endpoint not found.');
    expect(res.jsonData.error.requestId).toBe(req.requestId);
  });

  test('verifyJWT blocks protected API without token using JSON contract', async () => {
    const req = mockReq({ method: 'GET', path: '/api/messages/unread-count' });
    const res = mockRes();
    withRequestId(req, res);

    await invokeProtected(async () => {}, req, res);

    expect(res.statusCode).toBe(401);
    expect(res.jsonData.error.code).toBe('UNAUTHORIZED');
    expect(res.jsonData.error.message).toBe('Acces non autorise');
    expect(res.jsonData.error.requestId).toBe(req.requestId);
  });

  test('verifyJWT lets valid token reach handler', async () => {
    const req = mockReq({
      method: 'GET',
      path: '/api/notifications/count',
      cookies: { token: makeAuthToken({ id: 42 }) },
    });
    const res = mockRes();
    withRequestId(req, res);

    await invokeProtected(async (_req, response) => {
      response.json({ ok: true });
    }, req, res);

    expect(req.user.id).toBe(42);
    expect(res.statusCode).toBe(200);
    expect(res.jsonData).toEqual({ ok: true });
  });
});
