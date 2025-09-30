import { createServerOnlyFn } from "@tanstack/react-start";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env/server";
import * as schema from "./schema";

const driver = postgres(env.DATABASE_URL);
const tables = schema;

const getDatabase = createServerOnlyFn(() =>
  drizzle({
    client: driver,
    schema,
    casing: "snake_case",
    cache: upstashCache({
      url: env.UPSTASH_URL,
      token: env.UPSTASH_TOKEN,
      global: true,
      config: { ex: 60 },
    }),
  }),
);
const db = getDatabase();

export { db, driver, tables };
