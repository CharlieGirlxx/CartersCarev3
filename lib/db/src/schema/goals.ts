import { pgTable, text, serial, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalCategoryEnum = pgEnum("goal_category", ["independence", "community_participation", "health_wellbeing", "relationships", "employment_education", "communication", "daily_living", "safety", "other"]);
export const goalStatusEnum = pgEnum("goal_status", ["active", "achieved", "on_hold", "discontinued"]);

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: goalCategoryEnum("category").notNull(),
  status: goalStatusEnum("status").notNull().default("active"),
  progress: integer("progress").notNull().default(0),
  targetDate: text("target_date").notNull(),
  ndisAligned: boolean("ndis_aligned").notNull().default(true),
  strategies: text("strategies"),
  measurableOutcomes: text("measurable_outcomes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
