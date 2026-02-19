import { afterEach, beforeAll, describe, expect, jest, test } from '@jest/globals';
import messageController from '../app/controllers/messageController.js';
import notificationController from '../app/controllers/notificationController.js';
import searchController from '../app/controllers/searchController.js';
import { Message, Notification, SavedSearch, User } from '../app/models/index.js';
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

afterEach(() => {
  jest.restoreAllMocks();
});

function makeAuthedReq(overrides = {}) {
  return mockReq({
    cookies: { token: makeAuthToken({ id: 5 }) },
    ...overrides,
  });
}

describe('Business endpoints integration', () => {
  test('notifications count endpoint returns count for authenticated user', async () => {
    jest.spyOn(Notification, 'count').mockResolvedValue(7);
    const req = makeAuthedReq({ path: '/api/notifications/count' });
    const res = mockRes();
    withRequestId(req, res);

    await invokeProtected(notificationController.getUnreadCount, req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.count).toBe(7);
  });

  test('notifications read endpoint enforces ownership', async () => {
    jest.spyOn(Notification, 'findOne').mockResolvedValue(null);
    const req = makeAuthedReq({
      method: 'POST',
      path: '/api/notifications/999/read',
      params: { id: '999' },
    });
    const res = mockRes();
    withRequestId(req, res);

    await invokeProtected(notificationController.markAsRead, req, res);

    expect(res.statusCode).toBe(404);
    expect(res.jsonData.error.code).toBe('NOT_FOUND');
  });

  test('messages unread endpoint returns unread count', async () => {
    jest.spyOn(Message, 'count').mockResolvedValue(4);
    const req = makeAuthedReq({ path: '/api/messages/unread-count' });
    const res = mockRes();
    withRequestId(req, res);

    await invokeProtected(messageController.getUnreadCount, req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.count).toBe(4);
  });

  test('search autocomplete returns mapped suggestions', async () => {
    jest.spyOn(User, 'findAll').mockResolvedValue([
      { id: 1, firstname: 'Mokhmad', lastname: 'Noutsoulkhanov', city: 'Paris' },
      { id: 2, firstname: 'Badia', lastname: 'Abouanane', city: null },
    ]);

    const req = mockReq({
      path: '/api/search/autocomplete',
      query: { q: 'mo' },
    });
    const res = mockRes();
    withRequestId(req, res);

    await searchController.autocomplete(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.suggestions).toEqual([
      { id: 1, fullname: 'Mokhmad Noutsoulkhanov', city: 'Paris' },
      { id: 2, fullname: 'Badia Abouanane', city: '' },
    ]);
  });

  test('search talents returns paginated mapped results', async () => {
    jest.spyOn(User, 'findAll')
      .mockResolvedValueOnce([
        { id: '3', average_rating: '4.7', review_count: '12' },
      ])
      .mockResolvedValueOnce([
        {
          id: 3,
          firstname: 'Fatima',
          lastname: 'Zouhiri',
          image: null,
          city: 'Lyon',
          skills: [{ id: 1, label: 'Backend', slug: 'backend' }],
        },
      ]);
    jest.spyOn(User, 'count').mockResolvedValue(1);

    const req = mockReq({
      path: '/api/search/talents',
      query: {
        q: 'fat',
        sort: 'popular',
        page: '1',
        limit: '9',
        'skills[]': '1',
      },
    });
    const res = mockRes();
    withRequestId(req, res);

    await searchController.searchTalents(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.page).toBe(1);
    expect(res.jsonData.total).toBe(1);
    expect(res.jsonData.results[0].averageRating).toBe(4.7);
    expect(res.jsonData.results[0].reviewCount).toBe(12);
  });

  test('saved search save/delete enforces owner user_id from JWT', async () => {
    const createSpy = jest.spyOn(SavedSearch, 'create').mockResolvedValue({
      id: 19,
      name: 'Mes favoris',
      filters: { q: 'mo', skills: [1, 2] },
      created_at: new Date('2026-01-01T10:00:00.000Z'),
    });
    jest.spyOn(SavedSearch, 'destroy').mockResolvedValue(0);

    const saveReq = makeAuthedReq({
      method: 'POST',
      path: '/api/search/save',
      body: {
        name: 'Mes favoris',
        filters: { q: 'mo', skills: [1, 2] },
      },
    });
    const saveRes = mockRes();
    withRequestId(saveReq, saveRes);
    await invokeProtected(searchController.saveSearch, saveReq, saveRes);

    expect(saveRes.statusCode).toBe(201);
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ user_id: 5 }));

    const deleteReq = makeAuthedReq({
      method: 'DELETE',
      path: '/api/search/saved/123',
      params: { id: '123' },
    });
    const deleteRes = mockRes();
    withRequestId(deleteReq, deleteRes);
    await invokeProtected(searchController.deleteSavedSearch, deleteReq, deleteRes);

    expect(deleteRes.statusCode).toBe(404);
    expect(deleteRes.jsonData.error.code).toBe('NOT_FOUND');
  });
});
