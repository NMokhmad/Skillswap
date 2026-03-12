// tests/skillCreation.test.js
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const skillCreateMock = jest.fn();
const skillFindOrCreateMock = jest.fn();
const skillFindAllMock = jest.fn().mockResolvedValue([]);
const userFindByPkMock = jest.fn();
const userUpdateMock = jest.fn();
const findOrCreateJunctionMock = jest.fn();

jest.unstable_mockModule('../app/models/index.js', () => ({
  Skill: {
    create: skillCreateMock,
    findOrCreate: skillFindOrCreateMock,
    findAll: skillFindAllMock,
  },
  User: {
    findByPk: userFindByPkMock,
    update: userUpdateMock,
  },
  Review: {},
}));
jest.unstable_mockModule('../app/database.js', () => ({
  sequelize: {
    fn: jest.fn(),
    col: jest.fn(),
    literal: jest.fn(),
    models: {
      user_has_skill: { findOrCreate: findOrCreateJunctionMock },
    },
  },
}));
jest.unstable_mockModule('../app/helpers/rating.js', () => ({
  addAverageRating: jest.fn(u => u),
}));
jest.unstable_mockModule('../app/helpers/logger.js', () => ({
  logger: { error: jest.fn(), warn: jest.fn() },
}));

const { default: mainController } = await import('../app/controllers/mainController.js');

function mockReq(body = {}) {
  return {
    user: { id: 1 },
    body,
    file: null,
  };
}

function mockRes() {
  const res = { statusCode: null, jsonData: null, redirectUrl: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.jsonData = data; return res; };
  res.redirect = (url) => { res.redirectUrl = url; };
  return res;
}

describe('mainController.apiCompleteOnboarding — new_skill validation (H2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userFindByPkMock.mockResolvedValue({ id: 1 });
    userUpdateMock.mockResolvedValue([1]);
    skillFindOrCreateMock.mockResolvedValue([{ id: 99, label: 'Python', slug: 'python' }, true]);
  });

  test('returns 400 when new_skill exceeds 50 characters', async () => {
    const req = mockReq({ new_skill: 'x'.repeat(51) });
    const res = mockRes();

    await mainController.apiCompleteOnboarding(req, res);

    expect(res.statusCode).toBe(400);
    expect(skillCreateMock).not.toHaveBeenCalled();
    expect(skillFindOrCreateMock).not.toHaveBeenCalled();
  });

  test('returns 400 when new_skill contains invalid characters', async () => {
    const req = mockReq({ new_skill: 'Python<script>' });
    const res = mockRes();

    await mainController.apiCompleteOnboarding(req, res);

    expect(res.statusCode).toBe(400);
    expect(skillCreateMock).not.toHaveBeenCalled();
  });

  test('uses findOrCreate by slug to prevent duplicate skills', async () => {
    const req = mockReq({ new_skill: 'Python' });
    const res = mockRes();

    await mainController.apiCompleteOnboarding(req, res);

    expect(skillFindOrCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ slug: 'python' }) })
    );
    expect(skillCreateMock).not.toHaveBeenCalled();
  });

  test('accepts valid skill name within limits', async () => {
    const req = mockReq({ new_skill: 'Node.js' });
    const res = mockRes();

    await mainController.apiCompleteOnboarding(req, res);

    expect(skillFindOrCreateMock).toHaveBeenCalled();
    expect(res.jsonData).toEqual({ success: true });
  });
});
