import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export const db =
  globalForDb.db ??
  drizzle(postgres(process.env.DATABASE_URL!), { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
