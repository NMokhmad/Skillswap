// app/helpers/startupChecks.js
export function assertEnvVars() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in environment variables');
  }
  if (!process.env.JWT_EXPIRES) {
    throw new Error('JWT_EXPIRES must be set in environment variables');
  }
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CORS_ORIGIN) {
      throw new Error('CORS_ORIGIN must be set in production');
    }
    if (process.env.CORS_ORIGIN === '*') {
      throw new Error('CORS_ORIGIN must not be wildcard (*) in production');
    }
  }
}
