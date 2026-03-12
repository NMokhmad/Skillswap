// tests/messageContentLength.test.js
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const createMock = jest.fn();
const findByPkMock = jest.fn();

jest.unstable_mockModule('../app/models/index.js', () => ({
  User: { findByPk: findByPkMock },
  Message: { create: createMock, findAll: jest.fn(), count: jest.fn() },
}));
jest.unstable_mockModule('../app/helpers/apiResponse.js', () => ({
  sendApiError: jest.fn((res, { status, code, message }) => {
    res.statusCode = status;
    res.jsonData = { error: { code, message } };
    return res;
  }),
  sendApiSuccess: jest.fn((res, data, status = 200) => {
    res.statusCode = status;
    res.jsonData = data;
    return res;
  }),
}));
jest.unstable_mockModule('../app/helpers/logger.js', () => ({
  logger: { error: jest.fn() },
}));
jest.unstable_mockModule('../app/helpers/notificationHelper.js', () => ({
  createNotification: jest.fn(),
}));
jest.unstable_mockModule('../app/sockets/messageHandler.js', () => ({
  emitMessageToParticipants: jest.fn(),
  isUserActiveInConversation: jest.fn().mockReturnValue(false),
  toMessagePayload: jest.fn(),
}));

const { default: messageController } = await import('../app/controllers/messageController.js');

function mockReq(overrides = {}) {
  return {
    user: { id: 1, firstname: 'Alice' },
    params: { userId: '2' },
    body: {},
    app: { get: jest.fn().mockReturnValue(null) },
    ...overrides,
  };
}

function mockRes() {
  return {
    statusCode: null,
    jsonData: null,
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('messageController.apiSendMessage content length', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when content exceeds 3000 characters', async () => {
    const req = mockReq({ body: { content: 'x'.repeat(3001) } });
    const res = mockRes();

    await messageController.apiSendMessage(req, res);

    expect(res.statusCode).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  test('accepts content of exactly 3000 characters', async () => {
    findByPkMock.mockResolvedValue({ id: 2, firstname: 'Bob' });
    createMock.mockResolvedValue({ id: 99, content: 'x'.repeat(3000), sender_id: 1, receiver_id: 2, is_read: false });

    const req = mockReq({ body: { content: 'x'.repeat(3000) } });
    const res = mockRes();

    await messageController.apiSendMessage(req, res);

    expect(createMock).toHaveBeenCalled();
  });
});
