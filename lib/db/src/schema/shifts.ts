import { pgTable, text, serial, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shiftStatusEnum = pgEnum("shift_status", ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]);
export const serviceTypeEnum = pgEnum("service_type", ["daily_activities", "community_participation", "personal_care", "domestic_assistance", "transport", "therapy_support", "high_intensity_support", "respite", "nursing_care"]);

export const shiftsTable = pgTable("shifts", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull(),
  staffId: integer("staff_id").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  actualStartTime: text("actual_start_time"),
  actualEndTime: text("actual_end_time"),
  status: shiftStatusEnum("status").notNull().default("scheduled"),
  serviceType: serviceTypeEnum("service_type").notNull(),
  ndisLineItem: text("ndis_line_item"),
  location: text("location"),
  notes: text("notes"),
  requiresTwoWorkers: boolean("requires_two_workers").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertShiftSchema = createInsertSchema(shiftsTable).omit({ id: true, createdAt: true });
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shiftsTable.$inferSelect;
