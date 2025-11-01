type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDev = import.meta.env.DEV

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDev && level === 'debug') {
      return false
    }
    return true
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  }

  error(...args: any[]): void {
    console.error('[ERROR]', ...args)
  }
}

export const logger = new Logger()

