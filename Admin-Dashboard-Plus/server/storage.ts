import { db } from "./db";
import {
  games, sessions, events,
  type InsertGame, type InsertSession, type InsertCalendarEvent,
  type Game, type Session, type CalendarEvent
} from "@shared/schema";
import { eq, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  // Games
  getGames(search?: string, category?: string): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;

  // Sessions
  getSessions(): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;

  // Events
  getEvents(): Promise<CalendarEvent[]>;
  createEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
}

export class DatabaseStorage implements IStorage {
  // Games
  async getGames(search?: string, category?: string): Promise<Game[]> {
    const conditions = [];
    if (search) {
      conditions.push(ilike(games.title, `%${search}%`));
    }
    if (category && category !== "All") {
      conditions.push(eq(games.category, category));
    }

    if (conditions.length > 0) {
      return await db.select().from(games).where(and(...conditions));
    }
    return await db.select().from(games);
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  // Sessions
  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(sessions.date);
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  // Events
  async getEvents(): Promise<CalendarEvent[]> {
    return await db.select().from(events).orderBy(events.date);
  }

  async createEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }
}

export const storage = new DatabaseStorage();
