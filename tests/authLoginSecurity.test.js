import { describe, expect, jest, test } from '@jest/globals';

const verifyMock = jest.fn();
const findOneMock = jest.fn();
const validateLoginMock = jest.fn();

jest.unstable_mockModule('argon2', () => ({
  default: {
    verify: verifyMock,
    hash: jest.fn(),
  },
}));

jest.unstable_mockModule('../app/models/User.js', () => ({
  User: {
    findOne: findOneMock,
    create: jest.fn(),
  },
}));

jest.unstable_mockModule('../app/schemas/user.schema.js', () => ({
  userCreateSchema: {
    validateAsync: jest.fn(),
  },
  userLoginSchema: {
    validateAsync: validateLoginMock,
  },
}));

const { default: authController } = await import('../app/controllers/authController.js');

function mockReq(overrides = {}) {
  return {
    body: {},
    ...overrides,
  };
}

function mockRes() {
  return {
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    cookie: jest.fn(),
  };
}

describe('authController.login security', () => {
  test('executes argon2.verify even when user does not exist', async () => {
    validateLoginMock.mockResolvedValue({
      email: 'missing@example.com',
      password: 'wrong-password',
    });
    findOneMock.mockResolvedValue(null);
    verifyMock.mockResolvedValue(false);

    const req = mockReq({
      body: { email: 'missing@example.com', password: 'wrong-password' },
    });
    const res = mockRes();

    await authController.login(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ where: { email: 'missing@example.com' } });
    expect(verifyMock).toHaveBeenCalledTimes(1);
    expect(verifyMock).toHaveBeenCalledWith(expect.stringContaining('$argon2id$'), 'wrong-password');
    expect(res.render).toHaveBeenCalledWith('login', expect.objectContaining({
      error: 'Email ou mot de passe incorrect',
    }));
  });
});
