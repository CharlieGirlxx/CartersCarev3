import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const staffRoleEnum = pgEnum("staff_role", ["support_worker", "coordinator", "nurse", "team_leader", "admin", "manager"]);
export const staffStatusEnum = pgEnum("staff_status", ["active", "inactive", "on_leave"]);
export const employmentTypeEnum = pgEnum("employment_type", ["full_time", "part_time", "casual", "contractor"]);

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: staffRoleEnum("role").notNull().default("support_worker"),
  status: staffStatusEnum("status").notNull().default("active"),
  wwccNumber: text("wwcc_number"),
  wwccExpiry: text("wwcc_expiry"),
  ndisWorkerScreeningId: text("ndis_worker_screening_id"),
  ndisWorkerScreeningExpiry: text("ndis_worker_screening_expiry"),
  firstAidExpiry: text("first_aid_expiry"),
  cprExpiry: text("cpr_expiry"),
  qualifications: text("qualifications"),
  awardClassification: text("award_classification"),
  employmentType: employmentTypeEnum("employment_type").notNull().default("casual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStaffSchema = createInsertSchema(staffTable).omit({ id: true, createdAt: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type StaffMember = typeof staffTable.$inferSelect;
