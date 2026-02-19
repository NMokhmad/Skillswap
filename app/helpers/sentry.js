import { logger } from './logger.js';

let captureFn = () => {};

export async function initSentry() {
  if (!process.env.SENTRY_DSN) {
    logger.info('Sentry disabled (no DSN).');
    return;
  }

  try {
    const Sentry = await import('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || 'local',
      tracesSampleRate: Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),
      sendDefaultPii: false,
    });

    captureFn = (error, context = {}) => {
      Sentry.captureException(error, {
        tags: {
          requestId: context.requestId || null,
          route: context.route || null,
          source: context.source || 'server',
        },
        extra: {
          method: context.method || null,
          userId: context.userId || null,
          event: context.event || null,
        },
      });
    };

    logger.info('Sentry initialized.');
  } catch (error) {
    logger.warn('Sentry initialization failed, continuing without it.', {
      reason: error?.message || 'unknown',
    });
  }
}

export function captureException(error, context = {}) {
  captureFn(error, context);
}
