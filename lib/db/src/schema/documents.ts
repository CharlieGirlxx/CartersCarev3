import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentTypeEnum = pgEnum("document_type", ["support_plan", "service_agreement", "behaviour_support_plan", "medical_record", "worker_screening", "risk_assessment", "other"]);

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id"), // null if for staff
  staffId: integer("staff_id"), // null if for participant
  documentType: documentTypeEnum("document_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedBy: integer("uploaded_by").notNull(), // user_id
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // nullable for non-expiring docs
  isActive: boolean("is_active").default(true).notNull(),
  versionNumber: integer("version_number").default(1).notNull(),
  previousVersionId: integer("previous_version_id"), // FK to older version
  description: text("description"),
  deletedAt: timestamp("deleted_at"), // Soft delete support (Phase 4)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, uploadedAt: true, createdAt: true, updatedAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
