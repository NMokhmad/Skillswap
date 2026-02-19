import { describe, expect, test } from '@jest/globals';
import {
  validateReadPayload,
  validateSendPayload,
  validateTypingPayload,
} from '../app/sockets/messageHandler.js';

describe('Socket payload validation', () => {
  test('validateTypingPayload accepts valid payload', () => {
    expect(validateTypingPayload({ receiverId: 10, isTyping: true })).toEqual({
      ok: true,
      receiverId: 10,
      isTyping: true,
    });
  });

  test('validateTypingPayload rejects invalid receiver id', () => {
    expect(validateTypingPayload({ receiverId: 'abc', isTyping: true })).toEqual({
      ok: false,
      code: 'INVALID_RECEIVER',
    });
  });

  test('validateReadPayload rejects invalid payload type', () => {
    expect(validateReadPayload(null)).toEqual({
      ok: false,
      code: 'INVALID_PAYLOAD',
    });
  });

  test('validateSendPayload trims content and preserves clientMessageId', () => {
    expect(validateSendPayload({
      receiverId: '6',
      content: '  hello  ',
      clientMessageId: 'abc123',
    })).toEqual({
      ok: true,
      receiverId: 6,
      cleanedContent: 'hello',
      clientMessageId: 'abc123',
    });
  });

  test('validateSendPayload rejects empty content', () => {
    expect(validateSendPayload({
      receiverId: 6,
      content: '   ',
    })).toEqual({
      ok: false,
      code: 'EMPTY_CONTENT',
    });
  });

  test('validateSendPayload rejects oversized content', () => {
    expect(validateSendPayload({
      receiverId: 6,
      content: 'x'.repeat(3001),
    })).toEqual({
      ok: false,
      code: 'CONTENT_TOO_LONG',
    });
  });
});
