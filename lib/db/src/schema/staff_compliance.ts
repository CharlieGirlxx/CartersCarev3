import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complianceCheckTypeEnum = pgEnum("compliance_check_type", ["working_with_children", "ndi_worker_check", "first_aid", "ndis_training", "manual_handling", "vaccination", "other"]);
export const complianceStatusEnum = pgEnum("compliance_status", ["valid", "expiring", "expired", "pending", "failed"]);

export const staffComplianceTable = pgTable("staff_compliance", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  checkType: complianceCheckTypeEnum("check_type").notNull(),
  checkDate: timestamp("check_date"), // date the check was completed
  expiryDate: timestamp("expiry_date"), // when it expires
  status: complianceStatusEnum("status").notNull().default("pending"),
  certificateUrl: text("certificate_url"), // URL to uploaded certificate
  verifiedBy: integer("verified_by"), // admin_id who verified
  verifiedAt: timestamp("verified_at"), // when verification occurred
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffComplianceSchema = createInsertSchema(staffComplianceTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStaffCompliance = z.infer<typeof insertStaffComplianceSchema>;
export type StaffCompliance = typeof staffComplianceTable.$inferSelect;
