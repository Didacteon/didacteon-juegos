import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // Create test users
  const passwordHash = await bcrypt.hash("test1234", 12);

  const testUsers = [
    {
      email: "jugador1@test.com",
      username: "jugador1",
      displayName: "Jugador 1",
      passwordHash,
    },
    {
      email: "jugador2@test.com",
      username: "jugador2",
      displayName: "Jugador 2",
      passwordHash,
    },
    {
      email: "jugador3@test.com",
      username: "jugador3",
      displayName: "Jugador 3",
      passwordHash,
    },
    {
      email: "jugador4@test.com",
      username: "jugador4",
      displayName: "Jugador 4",
      passwordHash,
    },
  ];

  for (const user of testUsers) {
    try {
      await db.insert(schema.users).values(user).onConflictDoNothing();
      console.log(`  Created user: ${user.username}`);
    } catch (e) {
      console.log(`  User ${user.username} already exists`);
    }
  }

  // Seed games catalog
  const gameEntries = [
    {
      slug: "sopa-de-letras",
      name: "Sopa de Letras",
      description:
        "Encuentra las palabras ocultas en la cuadrícula antes que tus rivales",
      category: "palabras",
      minPlayers: 1,
      maxPlayers: 4,
    },
  ];

  for (const game of gameEntries) {
    try {
      await db.insert(schema.games).values(game).onConflictDoNothing();
      console.log(`  Created game: ${game.name}`);
    } catch (e) {
      console.log(`  Game ${game.name} already exists`);
    }
  }

  // Seed achievements
  const achievementEntries = [
    {
      slug: "first-win",
      name: "Primera Victoria",
      description: "Gana tu primera partida",
      gameSlug: null,
    },
    {
      slug: "sopa-10-words",
      name: "Buscador de Palabras",
      description: "Encuentra 10 palabras en una sola partida de Sopa de Letras",
      gameSlug: "sopa-de-letras",
    },
    {
      slug: "sopa-speed-demon",
      name: "Velocista",
      description: "Encuentra una palabra en los primeros 10 segundos",
      gameSlug: "sopa-de-letras",
    },
  ];

  for (const achievement of achievementEntries) {
    try {
      await db
        .insert(schema.achievements)
        .values(achievement)
        .onConflictDoNothing();
      console.log(`  Created achievement: ${achievement.name}`);
    } catch (e) {
      console.log(`  Achievement ${achievement.name} already exists`);
    }
  }

  console.log("Seed complete!");
  await client.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
