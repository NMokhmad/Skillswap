import { logger } from '../helpers/logger.js';

export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;

    logger.info('http_request', {
      requestId: req.requestId || null,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      userId: req.user?.id || res.locals.user?.id || null,
      source: 'express',
    });
  });

  next();
}
