import { pgTable, text, serial, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const incidentTypeEnum = pgEnum("incident_type", ["injury", "medication_error", "behaviour_incident", "complaint", "near_miss", "property_damage", "missing_person", "abuse_neglect", "restrictive_practice", "financial_abuse", "environmental_hazard", "other"]);
export const incidentSeverityEnum = pgEnum("incident_severity", ["low", "medium", "high", "critical"]);
export const incidentStatusEnum = pgEnum("incident_status", ["open", "under_investigation", "awaiting_submission", "submitted", "closed"]);

export const incidentsTable = pgTable("incidents", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull(),
  reportedById: integer("reported_by_id").notNull(),
  incidentDate: text("incident_date").notNull(),
  incidentTime: text("incident_time"),
  location: text("location"),
  type: incidentTypeEnum("type").notNull(),
  severity: incidentSeverityEnum("severity").notNull(),
  description: text("description").notNull(),
  immediateActions: text("immediate_actions"),
  witnesses: text("witnesses"),
  reportableToNDIS: boolean("reportable_to_ndis").notNull().default(false),
  reportableToAgedCare: boolean("reportable_to_aged_care").notNull().default(false),
  ndisSubmissionDate: text("ndis_submission_date"),
  agedCareSubmissionDate: text("aged_care_submission_date"),
  status: incidentStatusEnum("status").notNull().default("open"),
  resolution: text("resolution"),
  preventiveMeasures: text("preventive_measures"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIncidentSchema = createInsertSchema(incidentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidentsTable.$inferSelect;
