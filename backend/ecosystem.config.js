module.exports = {
  apps: [
    {
      name:         'zolimportados-api',
      script:       'server.js',
      cwd:          '/var/www/zolimportados/backend',
      instances:    1,
      autorestart:  true,
      watch:        false,
      max_memory_restart: '512M',

      env_production: {
        NODE_ENV: 'production',
        PORT:     5000,
      },

      // Logs
      error_file:  '/var/log/pm2/zolimportados-error.log',
      out_file:    '/var/log/pm2/zolimportados-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:  true,
    },
  ],
}
