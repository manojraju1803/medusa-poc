import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({


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
    databaseDriverOptions: process.env.DATABASE_URL?.includes("sslmode=require") || process.env.NODE_ENV === "production"
      ? { connection: { ssl: { rejectUnauthorized: false } } }
      : { ssl: false, sslmode: "disable" },
  },
  modules: [
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
  ],
})

