import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({
  admin: {
    vite: (config) => {
      return {
        server: {
          host: '0.0.0.0',
          // Allow all hosts when running in Docker (development mode)
          // In production, this should be more restrictive
          allowedHosts: ['localhost', '.localhost', '127.0.0.1'],
          hmr: {
            // HMR websocket port inside container
            port: 5173,
            // Port browser connects to (exposed in docker-compose.yml)
            clientPort: 5173,
          },
        },
      };
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
    // Hosted DBs (Supabase) need SSL; local Postgres doesn't
    databaseDriverOptions:
      process.env.DATABASE_SSL === 'true'
        ? { connection: { ssl: { rejectUnauthorized: false } } }
        : { ssl: false, sslmode: 'disable' },
  },
  modules: [
    // Stock notification module with the local provider on the e-mail channel
    // too, so password-reset links are written to the server log in dev.
    // Swap in a real e-mail provider (e.g. @medusajs/medusa/notification-sendgrid)
    // for the `email` channel before going live.
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/notification-local',
            id: 'local',
            options: {
              name: 'Local Notification Provider',
              channels: ['feed', 'email'],
            },
          },
        ],
      },
    },
    { resolve: './src/modules/inquiry' },
    {
      resolve: '@medusajs/medusa/tax',
      options: {
        providers: [
          {
            resolve: './src/modules/india-gst-tax',
            id: 'india-gst',
            options: {
              sellerProvinceCode: 'in-ka',
              shippingGstPercent: 18,
            },
          },
        ],
      },
    },
  ],
});
