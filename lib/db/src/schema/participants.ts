import { pgTable, text, serial, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fundingTypeEnum = pgEnum("funding_type", ["ndis", "aged_care_commonwealth", "aged_care_state", "private", "mixed"]);
export const participantStatusEnum = pgEnum("participant_status", ["active", "inactive", "waitlist", "discharged"]);
export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high"]);

export const participantsTable = pgTable("participants", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  preferredName: text("preferred_name"),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender"),
  fundingType: fundingTypeEnum("funding_type").notNull(),
  ndisNumber: text("ndis_number"),
  agedCareId: text("aged_care_id"),
  status: participantStatusEnum("status").notNull().default("active"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  primaryDiagnosis: text("primary_diagnosis"),
  supportLevel: text("support_level"),
  assignedCoordinatorId: integer("assigned_coordinator_id"),
  ndisGoals: text("ndis_goals"),
  riskLevel: riskLevelEnum("risk_level").notNull().default("low"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertParticipantSchema = createInsertSchema(participantsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participantsTable.$inferSelect;
