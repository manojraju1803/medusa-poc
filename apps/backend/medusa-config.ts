import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', __dirname);
loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000,https://*.vercel.app",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,https://*.onrender.com",
      authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:9000,https://*.vercel.app,https://*.onrender.com",
      jwtSecret: process.env.JWT_SECRET || "super_secret_jwt_random_key_1234567890",
      cookieSecret: process.env.COOKIE_SECRET || "super_secret_cookie_random_key_1234567890",
    },
    // Hosted DBs (Supabase) need SSL; local Postgres doesn't
    databaseDriverOptions:
      process.env.DATABASE_SSL === 'true' ||
      process.env.DATABASE_URL?.includes("sslmode=require") ||
      process.env.NODE_ENV === "production"
        ? {
            connection: { ssl: { rejectUnauthorized: false } },
            pool: {
              min: 2,
              max: 20,
              idleTimeoutMillis: 300000,
              acquireTimeoutMillis: 60000,
            },
          }
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
    {
      resolve: "./src/modules/inquiry",
    },
    {
      resolve: "./src/modules/brand",
    },
    {
      resolve: "@medusajs/medusa/tax",
      options: {
        providers: [
          {
            resolve: "./src/modules/india-gst-tax",
            id: "india-gst",
            options: {
              sellerProvinceCode: "in-ka",
              shippingGstPercent: 18,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            // registered as payment provider "pp_mock_default"
            resolve: "./src/modules/mock-payment",
            id: "default",
          },
        ],
      },
    },
  ],
})

