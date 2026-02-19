import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;

export const db = new Proxy({} as DB, {
  get(_target, prop) {
    if (!_db) {
      const client = postgres(process.env.DATABASE_URL!);
      _db = drizzle(client, { schema });
    }
    return Reflect.get(_db, prop);
  },
});
