/* ========== LOGGING UTILITY ========== */

/**
 * Logger utility for consistent logging across the application
 */
export class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.config = window.ChatConfig?.debug || {
      enabled: false,
      logLevel: 'info',
      logToConsole: true,
      logToStorage: false
    };
    
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    this.currentLevel = this.levels[this.config.logLevel] || 1;
  }

  /**
   * Log debug message
   */
  debug(...args) {
    this.log('debug', ...args);
  }

  /**
   * Log info message
   */
  info(...args) {
    this.log('info', ...args);
  }

  /**
   * Log warning message
   */
  warn(...args) {
    this.log('warn', ...args);
  }

  /**
   * Log error message
   */
  error(...args) {
    this.log('error', ...args);
  }

  /**
   * Internal log method
   */
  log(level, ...args) {
    if (!this.config.enabled && level !== 'error') {
      return;
    }

    const levelNum = this.levels[level];
    if (levelNum < this.currentLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.context}] [${level.toUpperCase()}]`;
    
    if (this.config.logToConsole) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](prefix, ...args);
    }

    if (this.config.logToStorage) {
      this.logToStorage(level, timestamp, args);
    }
  }

  /**
   * Log to local storage for debugging
   */
  logToStorage(level, timestamp, args) {
    try {
      const logs = JSON.parse(localStorage.getItem('nog_logs') || '[]');
      logs.push({
        level,
        timestamp,
        context: this.context,
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
      });

      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('nog_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log to storage:', error);
    }
  }

  /**
   * Get stored logs
   */
  static getLogs() {
    try {
      return JSON.parse(localStorage.getItem('nog_logs') || '[]');
    } catch (error) {
      console.error('Failed to get logs from storage:', error);
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  static clearLogs() {
    try {
      localStorage.removeItem('nog_logs');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}
