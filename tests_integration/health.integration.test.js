import { afterEach, beforeAll, describe, expect, jest, test } from '@jest/globals';
import healthController from '../app/controllers/healthController.js';
import { sequelize } from '../app/database.js';
import { mockReq, mockRes, withRequestId } from './helpers/controllerHarness.js';

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-secret';
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Health controller integration', () => {
  test('liveness returns alive payload and request id', () => {
    const req = mockReq({ path: '/healthz' });
    const res = mockRes();
    withRequestId(req, res);

    healthController.liveness(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.ok).toBe(true);
    expect(res.jsonData.status).toBe('alive');
    expect(res.jsonData.requestId).toBe(req.requestId);
  });

  test('readiness returns ready when DB is reachable', async () => {
    jest.spyOn(sequelize, 'authenticate').mockResolvedValue(undefined);
    const req = mockReq({ path: '/readyz' });
    const res = mockRes();
    withRequestId(req, res);

    await healthController.readiness(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.ok).toBe(true);
    expect(res.jsonData.status).toBe('ready');
    expect(res.jsonData.dependencies.database).toBe('up');
  });

  test('readiness returns standardized 503 when DB is down', async () => {
    jest.spyOn(sequelize, 'authenticate').mockRejectedValue(new Error('DB down'));
    const req = mockReq({ path: '/readyz' });
    const res = mockRes();
    withRequestId(req, res);

    await healthController.readiness(req, res);

    expect(res.statusCode).toBe(503);
    expect(res.jsonData.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(res.jsonData.error.message).toBe('Service not ready.');
    expect(res.jsonData.error.requestId).toBe(req.requestId);
    expect(res.jsonData.error.details).toEqual({ database: 'down' });
  });
});
