import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    VITE_BASE_URL: z.url(),
    NODE_ENV: z.string(),

    // Upstash
    UPSTASH_URL: z.string(),
    UPSTASH_TOKEN: z.string(),

    // OAuth2 providers
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    // SMTP Credentials
    RESEND_API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
});
