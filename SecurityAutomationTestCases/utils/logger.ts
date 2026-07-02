/**
 * Tiny structured logger used by hooks and step definitions.
 * Writes to stdout with a level prefix so it shows up in CI logs and
 * Cucumber's progress reporter without external dependencies.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const ctx = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
  // eslint-disable-next-line no-console
  console.log(`[${level}] ${message}${ctx}`);
}

export const logger = {
  info(message: string, context?: Record<string, unknown>): void {
    emit('INFO', message, context);
  },
  warn(message: string, context?: Record<string, unknown>): void {
    emit('WARN', message, context);
  },
  error(message: string, context?: Record<string, unknown>): void {
    emit('ERROR', message, context);
  },
  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.DEBUG === 'true') {
      emit('DEBUG', message, context);
    }
  }
};
