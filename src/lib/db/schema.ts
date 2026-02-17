import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  bigint,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── USERS ───

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── GAMES (catalog) ───

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  minPlayers: integer("min_players").notNull().default(1),
  maxPlayers: integer("max_players").notNull().default(4),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── ROOMS ───

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 8 }).unique().notNull(),
  gameSlug: varchar("game_slug", { length: 100 }).notNull(),
  hostId: uuid("host_id")
    .references(() => users.id)
    .notNull(),
  config: jsonb("config"),
  status: varchar("status", { length: 20 }).notNull().default("waiting"),
  maxPlayers: integer("max_players").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── ROOM MEMBERS ───

export const roomMembers = pgTable(
  "room_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: uuid("room_id")
      .references(() => rooms.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    isReady: boolean("is_ready").default(false),
  },
  (table) => [uniqueIndex("room_members_unique").on(table.roomId, table.userId)]
);

// ─── GAME SESSIONS ───

export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id")
    .references(() => games.id)
    .notNull(),
  roomId: uuid("room_id").references(() => rooms.id),
  config: jsonb("config"),
  finalState: jsonb("final_state"),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── PLAYER RESULTS ───

export const playerResults = pgTable(
  "player_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .references(() => gameSessions.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    score: integer("score").notNull().default(0),
    rank: integer("rank").notNull(),
    stats: jsonb("stats"),
    xpEarned: integer("xp_earned").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("player_results_unique").on(table.sessionId, table.userId),
  ]
);

// ─── ACHIEVEMENTS ───

export const achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 500 }),
  gameSlug: varchar("game_slug", { length: 100 }),
  criteria: jsonb("criteria"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── USER ACHIEVEMENTS ───

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    achievementId: uuid("achievement_id")
      .references(() => achievements.id)
      .notNull(),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_achievements_unique").on(
      table.userId,
      table.achievementId
    ),
  ]
);

// ─── USER STATS ───

export const userStats = pgTable(
  "user_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    gameSlug: varchar("game_slug", { length: 100 }).notNull(),
    totalGames: integer("total_games").default(0),
    totalWins: integer("total_wins").default(0),
    totalScore: bigint("total_score", { mode: "number" }).default(0),
    bestScore: integer("best_score").default(0),
    totalXp: bigint("total_xp", { mode: "number" }).default(0),
    data: jsonb("data"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_stats_unique").on(table.userId, table.gameSlug),
  ]
);

// ─── CHAT MESSAGES ───

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id")
    .references(() => rooms.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  content: varchar("content", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
