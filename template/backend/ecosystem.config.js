/**
 * PM2 config — adaptar `name`, `cwd` y logs al proyecto real.
 * Ejecutar con:  pm2 start ecosystem.config.js --env production
 */
module.exports = {
  apps: [
    {
      name:         'my-app-api',              // ← renombrar
      script:       'server.js',
      cwd:          '/var/www/my-app/backend', // ← ajustar al deploy real
      instances:    1,
      autorestart:  true,
      watch:        false,
      max_memory_restart: '512M',

      env_production: {
        NODE_ENV: 'production',
        PORT:     5001,
      },

      error_file:      '/var/log/pm2/my-app-error.log',
      out_file:        '/var/log/pm2/my-app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:      true,
    },
  ],
}
