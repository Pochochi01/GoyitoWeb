const env = process.env.NODE_ENV || 'development'

const levels = { error: 0, warn: 1, info: 2, debug: 3 }
const current = env === 'production' ? levels.warn : levels.debug

const timestamp = () => new Date().toISOString()

const logger = {
  error: (...args) => levels.error <= current && console.error(`[${timestamp()}] ERROR`, ...args),
  warn:  (...args) => levels.warn  <= current && console.warn (`[${timestamp()}] WARN `, ...args),
  info:  (...args) => levels.info  <= current && console.log  (`[${timestamp()}] INFO `, ...args),
  debug: (...args) => levels.debug <= current && console.log  (`[${timestamp()}] DEBUG`, ...args),
}

module.exports = logger
