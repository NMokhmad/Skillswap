function base(level, message, meta = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const line = JSON.stringify(entry);
  if (level === 'error' || level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info(message, meta = {}) {
    base('info', message, meta);
  },
  warn(message, meta = {}) {
    base('warn', message, meta);
  },
  error(message, meta = {}) {
    base('error', message, meta);
  },
};
