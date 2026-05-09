import { pgTable, text, serial, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complianceCategoryEnum = pgEnum("compliance_category", ["ndis_practice_standard", "aged_care_quality_standard", "worker_screening", "training", "policy", "documentation", "audit"]);
export const complianceFrameworkEnum = pgEnum("compliance_framework", ["ndis", "aged_care", "both"]);
export const complianceStatusEnum = pgEnum("compliance_status", ["compliant", "non_compliant", "under_review", "not_applicable"]);

export const complianceChecksTable = pgTable("compliance_checks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: complianceCategoryEnum("category").notNull(),
  framework: complianceFrameworkEnum("framework").notNull(),
  status: complianceStatusEnum("status").notNull().default("under_review"),
  dueDate: text("due_date"),
  completedDate: text("completed_date"),
  assignedToId: integer("assigned_to_id"),
  evidence: text("evidence"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertComplianceCheckSchema = createInsertSchema(complianceChecksTable).omit({ id: true, createdAt: true });
export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;
export type ComplianceCheck = typeof complianceChecksTable.$inferSelect;
