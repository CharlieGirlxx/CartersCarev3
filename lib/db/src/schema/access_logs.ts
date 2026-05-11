import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accessActionEnum = pgEnum("access_action", ["view", "download", "export", "print", "share"]);
export const accessResourceTypeEnum = pgEnum("access_resource_type", ["participant", "document", "incident", "case_note", "shift", "report"]);

export const accessLogsTable = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  participantId: integer("participant_id"),
  resourceType: accessResourceTypeEnum("resource_type").notNull(),
  resourceId: integer("resource_id"),
  action: accessActionEnum("action").notNull(),
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  reason: text("reason"), // optional reason for access
});

export const insertAccessLogSchema = createInsertSchema(accessLogsTable).omit({ id: true, accessedAt: true });
export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type AccessLog = typeof accessLogsTable.$inferSelect;
