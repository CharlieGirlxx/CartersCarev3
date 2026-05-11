import { pgTable, text, serial, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "view", "export", "download"]);

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // 'participant', 'shift', 'incident', 'case_note', 'document', etc.
  entityId: integer("entity_id").notNull(),
  action: auditActionEnum("action").notNull(),
  changedBy: integer("changed_by").notNull(), // user_id
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  oldValues: jsonb("old_values"), // previous state
  newValues: jsonb("new_values"), // new state
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  reason: text("reason"), // reason for the change
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, changedAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
