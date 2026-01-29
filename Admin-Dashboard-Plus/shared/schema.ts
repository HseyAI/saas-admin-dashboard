import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Games Library
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // e.g., 'Strategy', 'Party'
  minPlayers: integer("min_players").notNull(),
  maxPlayers: integer("max_players").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

// Tracking Sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(), // Combined Date + Time
  branch: text("branch").notNull(),
  tableNumber: text("table_number").notNull(),
  gameId: integer("game_id"), // Optional reference to games table, or just text if ad-hoc
  guruName: text("guru_name").notNull(),
  playerNames: text("player_names").array(), // Simple array of names
  notes: text("notes"),
});

// Calendar Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'meeting', 'event', 'deadline', etc. for dot colors
  description: text("description"),
});

// Schemas
export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });

// Types
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type CalendarEvent = typeof events.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertEventSchema>;

// Webhook Response Types (for TypeScript safety on frontend)
export interface MembershipWebhookResponse {
  membershipSummary: {
    total: number;
    used: number;
    balance: number;
    isExpired: boolean;
  };
  history: {
    purchases: Array<{ date: string; item: string; amount: number }>;
    activityLogs: Array<{ date: string; activity: string }>;
  };
}
