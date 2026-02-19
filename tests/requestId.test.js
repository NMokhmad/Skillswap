import { describe, expect, jest, test } from '@jest/globals';
import { requestId } from '../app/middlewares/requestId.js';

function mockReq(overrides = {}) {
  return {
    headers: {},
    ...overrides,
  };
}

function mockRes() {
  const res = {
    locals: {},
    headers: {},
  };

  res.setHeader = (key, value) => {
    res.headers[key] = value;
  };

  return res;
}

describe('requestId middleware', () => {
  test('generates a request id when header is missing', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    requestId(req, res, next);

    expect(typeof req.requestId).toBe('string');
    expect(req.requestId.length).toBeGreaterThan(10);
    expect(res.locals.requestId).toBe(req.requestId);
    expect(res.headers['X-Request-Id']).toBe(req.requestId);
    expect(next).toHaveBeenCalled();
  });

  test('reuses incoming X-Request-Id header', () => {
    const req = mockReq({ headers: { 'x-request-id': 'incoming-123' } });
    const res = mockRes();
    const next = jest.fn();

    requestId(req, res, next);

    expect(req.requestId).toBe('incoming-123');
    expect(res.locals.requestId).toBe('incoming-123');
    expect(res.headers['X-Request-Id']).toBe('incoming-123');
    expect(next).toHaveBeenCalled();
  });
});
