import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({


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

