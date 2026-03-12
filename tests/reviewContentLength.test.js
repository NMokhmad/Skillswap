// tests/reviewContentLength.test.js
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const findByPkMock = jest.fn();
const findOneMock = jest.fn();
const createMock = jest.fn();

jest.unstable_mockModule('../app/models/index.js', () => ({
  Review: { findOne: findOneMock, create: createMock },
  User: { findByPk: findByPkMock },
  Skill: { findByPk: jest.fn() },
}));
jest.unstable_mockModule('../app/helpers/notificationHelper.js', () => ({
  createNotification: jest.fn(),
}));

const { default: reviewController } = await import('../app/controllers/reviewController.js');
// Capture mock references at top level — must come after all jest.unstable_mockModule calls
const { Skill } = await import('../app/models/index.js');

function mockReq(overrides = {}) {
  return {
    user: { id: 1, firstname: 'Alice' },
    params: { userId: '2' },
    body: { rate: '4', skill_id: '1', content: '' },
    ...overrides,
  };
}

function mockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    redirectUrl: null,
  };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.jsonData = data; return res; };
  res.redirect = (url) => { res.redirectUrl = url; };
  return res;
}

describe('reviewController.createReview content validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Skill.findByPk.mockResolvedValue({ id: 1, label: 'JavaScript' });
    findOneMock.mockResolvedValue(null); // no existing review
    createMock.mockResolvedValue({ id: 10 });
    findByPkMock.mockImplementation(async (id) => {
      if (id === 1) return { id: 1, firstname: 'Alice' };
      if (id === 2) return { id: 2, firstname: 'Bob' };
    });
  });

  test('returns 400 when comment exceeds 500 characters', async () => {
    const req = mockReq({ body: { rate: '4', skill_id: '1', content: 'x'.repeat(501) } });
    const res = mockRes();

    await reviewController.createReview(req, res);

    expect(res.statusCode).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  test('accepts comment of exactly 500 characters', async () => {
    const req = mockReq({ body: { rate: '4', skill_id: '1', content: 'x'.repeat(500) } });
    const res = mockRes();

    await reviewController.createReview(req, res);

    expect(createMock).toHaveBeenCalled();
  });

  test('accepts empty comment', async () => {
    const req = mockReq({ body: { rate: '4', skill_id: '1', content: '' } });
    const res = mockRes();

    await reviewController.createReview(req, res);

    expect(createMock).toHaveBeenCalled();
  });
});
