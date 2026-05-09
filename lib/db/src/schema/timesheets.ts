import { pgTable, text, serial, timestamp, pgEnum, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timesheetStatusEnum = pgEnum("timesheet_status", ["draft", "submitted", "approved", "rejected", "paid"]);

export const timesheetsTable = pgTable("timesheets", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  weekStart: text("week_start").notNull(),
  weekEnd: text("week_end").notNull(),
  totalHours: real("total_hours").notNull().default(0),
  regularHours: real("regular_hours").notNull().default(0),
  overtimeHours: real("overtime_hours").notNull().default(0),
  allowances: real("allowances").notNull().default(0),
  status: timesheetStatusEnum("status").notNull().default("draft"),
  approvedById: integer("approved_by_id"),
  approvedAt: text("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTimesheetSchema = createInsertSchema(timesheetsTable).omit({ id: true, createdAt: true });
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type Timesheet = typeof timesheetsTable.$inferSelect;
