import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

// Where uploaded files, such as product images, are stored: the backend's own
// disk (the `static` folder) until S3_BUCKET is set, then S3. Code that stores
// files goes through Medusa's File Module, so switching needs no code changes.
const fileProvider = process.env.S3_BUCKET
  ? {
      resolve: '@medusajs/medusa/file-s3',
      id: 's3',
      options: {
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        // The public address files are served from, e.g. the bucket's URL.
        file_url: process.env.S3_FILE_URL,
        // Only for S3-compatible services other than AWS.
        endpoint: process.env.S3_ENDPOINT,
        prefix: process.env.S3_PREFIX,
      },
    }
  : {
      resolve: '@medusajs/medusa/file-local',
      id: 'local',
      options: {
        // Links to stored files. Must be the backend's public address: the
        // default is localhost, which only works on a developer's machine.
        backend_url: `${process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'}/static`,
      },
    };

// Medusa Cloud sets up S3 file storage itself, so leave it alone there.
const onMedusaCloud = process.env.EXECUTION_CONTEXT === 'medusa-cloud';

module.exports = defineConfig({
  admin: {
    // The admin refuses larger files the moment they're added (Medusa's
    // default is 1 MB). Uploaded images are then compressed to at most 500 KB
    // on the server (src/api/utils/watermark.ts), so phone photos can come in
    // at full size.
    maxUploadFileSize: 10 * 1024 * 1024,
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
    ...(onMedusaCloud
      ? []
      : [
          {
            resolve: '@medusajs/medusa/file',
            options: { providers: [fileProvider] },
          },
        ]),
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
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            // registered as payment provider "pp_mock_default"
            resolve: './src/modules/mock-payment',
            id: 'default',
          },
        ],
      },
    },
  ],
});
