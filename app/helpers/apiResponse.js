function defaultMessageForCode(code) {
  const map = {
    VALIDATION_ERROR: 'Validation error.',
    UNAUTHORIZED: 'Unauthorized.',
    FORBIDDEN: 'Forbidden.',
    NOT_FOUND: 'Resource not found.',
    CONFLICT: 'Conflict detected.',
    SERVER_ERROR: 'Internal server error.',
    BAD_REQUEST: 'Bad request.',
  };

  return map[code] || 'Request failed.';
}

export function isApiRequest(req) {
  if (req.path?.startsWith('/api/')) return true;

  const headers = req.headers || {};
  const accept = String(headers.accept || '').toLowerCase();
  const contentType = String(headers['content-type'] || '').toLowerCase();
  return accept.includes('application/json') || contentType.includes('application/json');
}

export function sendApiError(res, {
  status = 500,
  code = 'SERVER_ERROR',
  message,
  details = null,
  requestId = null,
} = {}) {
  const payload = {
    error: {
      code,
      message: message || defaultMessageForCode(code),
      requestId: requestId || res.locals?.requestId || null,
    },
  };

  if (details) payload.error.details = details;
  return res.status(status).json(payload);
}

export function sendApiSuccess(res, payload = {}, status = 200) {
  return res.status(status).json(payload);
}
