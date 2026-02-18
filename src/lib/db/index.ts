import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    if (!_db) {
      const client = postgres(process.env.DATABASE_URL!);
      _db = drizzle(client, { schema });
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
