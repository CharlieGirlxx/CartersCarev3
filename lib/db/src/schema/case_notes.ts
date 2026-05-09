import { pgTable, text, serial, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const caseNoteCategoryEnum = pgEnum("case_note_category", ["progress_note", "goal_update", "behaviour_support", "health_update", "personal_care", "community_participation", "communication", "incident_follow_up", "medication", "daily_living"]);

export const caseNotesTable = pgTable("case_notes", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull(),
  staffId: integer("staff_id").notNull(),
  shiftId: integer("shift_id"),
  category: caseNoteCategoryEnum("category").notNull(),
  content: text("content").notNull(),
  goalId: integer("goal_id"),
  isConfidential: boolean("is_confidential").notNull().default(false),
  requiresFollowUp: boolean("requires_follow_up").notNull().default(false),
  followUpDate: text("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCaseNoteSchema = createInsertSchema(caseNotesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCaseNote = z.infer<typeof insertCaseNoteSchema>;
export type CaseNote = typeof caseNotesTable.$inferSelect;
