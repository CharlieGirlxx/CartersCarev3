import { pgTable, text, serial, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicationRouteEnum = pgEnum("medication_route", ["oral", "topical", "injection", "inhaled", "sublingual", "rectal", "other"]);
export const medicationOutcomeEnum = pgEnum("medication_outcome", ["given", "refused", "not_available", "missed"]);

export const medicationsTable = pgTable("medications", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  dosage: text("dosage").notNull(),
  unit: text("unit"),
  frequency: text("frequency").notNull(),
  route: medicationRouteEnum("route").notNull(),
  prescriber: text("prescriber").notNull(),
  prescriberPhone: text("prescriber_phone"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  instructions: text("instructions"),
  sideEffects: text("side_effects"),
  isActive: boolean("is_active").notNull().default(true),
  requiresWitness: boolean("requires_witness").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medicationAdministrationsTable = pgTable("medication_administrations", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull(),
  administeredById: integer("administered_by_id").notNull(),
  administeredAt: text("administered_at").notNull(),
  outcome: medicationOutcomeEnum("outcome").notNull(),
  witnessId: integer("witness_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicationSchema = createInsertSchema(medicationsTable).omit({ id: true, createdAt: true });
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medicationsTable.$inferSelect;

export const insertMedicationAdministrationSchema = createInsertSchema(medicationAdministrationsTable).omit({ id: true, createdAt: true });
export type InsertMedicationAdministration = z.infer<typeof insertMedicationAdministrationSchema>;
export type MedicationAdministration = typeof medicationAdministrationsTable.$inferSelect;
