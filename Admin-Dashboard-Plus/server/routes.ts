import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertGameSchema, insertSessionSchema, insertEventSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Proxy Route for Member Lookup ---
  app.post(api.members.lookup.path, async (req, res) => {
    try {
      const { mobile } = req.body;
      
      if (!mobile || mobile.trim() === "") {
        return res.status(400).json({ message: "Please enter a valid mobile number" });
      }
      
      // Call the external webhook
      const webhookUrl = "https://n8n-production-8414.up.railway.app/webhook/Membership-Info";
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobile.trim() })
      });

      // Get response text first
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error("Webhook returned error:", response.status, responseText);
        return res.status(502).json({ 
          message: `The membership service returned an error (${response.status}). Please try again later or contact support.` 
        });
      }

      // Try to parse as JSON
      if (!responseText || responseText.trim() === "") {
        return res.status(404).json({ 
          message: "No member found with that mobile number. Please check and try again." 
        });
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse webhook response:", responseText);
        return res.status(502).json({ 
          message: "The membership service returned an invalid response. Please try again later." 
        });
      }

      // Check if the response has the expected structure
      if (!data.membershipSummary) {
        return res.status(404).json({ 
          message: "No member found with that mobile number." 
        });
      }

      res.json(data);
    } catch (error) {
      console.error("Member lookup error:", error);
      res.status(500).json({ message: "Unable to connect to the membership service. Please check your connection and try again." });
    }
  });

  // --- Games Routes ---
  app.get(api.games.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const games = await storage.getGames(search, category);
    res.json(games);
  });

  app.post(api.games.create.path, async (req, res) => {
    try {
      const input = insertGameSchema.parse(req.body);
      const game = await storage.createGame(input);
      res.status(201).json(game);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // --- Sessions Routes ---
  app.get(api.sessions.list.path, async (req, res) => {
    const sessions = await storage.getSessions();
    res.json(sessions);
  });

  app.post(api.sessions.create.path, async (req, res) => {
    try {
      // Handle date parsing if needed, but Zod schema expects Date object or valid string
      // Frontend should send ISO string
      const input = insertSessionSchema.parse({
        ...req.body,
        date: new Date(req.body.date)
      });
      const session = await storage.createSession(input);
      res.status(201).json(session);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // --- Events Routes ---
  app.get(api.events.list.path, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post(api.events.create.path, async (req, res) => {
    try {
      const input = insertEventSchema.parse({
        ...req.body,
        date: new Date(req.body.date)
      });
      const event = await storage.createEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const games = await storage.getGames();
  if (games.length === 0) {
    await storage.createGame({
      title: "Catan",
      category: "Strategy",
      minPlayers: 3,
      maxPlayers: 4,
      description: "Trade, build, and settle.",
      imageUrl: "https://images.unsplash.com/photo-1610890716271-e2fe9d2b0951?auto=format&fit=crop&q=80&w=300"
    });
    await storage.createGame({
      title: "Dixit",
      category: "Party",
      minPlayers: 3,
      maxPlayers: 6,
      description: "A picture is worth a thousand words.",
      imageUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=300"
    });
    await storage.createGame({
      title: "Ticket to Ride",
      category: "Family",
      minPlayers: 2,
      maxPlayers: 5,
      description: "Cross-country train adventure.",
      imageUrl: "https://images.unsplash.com/photo-1596727147705-06a532a65c27?auto=format&fit=crop&q=80&w=300"
    });
  }

  const events = await storage.getEvents();
  if (events.length === 0) {
    await storage.createEvent({
      title: "Board Game Night",
      date: new Date(),
      type: "event",
      description: "Weekly community gathering"
    });
  }
}
