import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const consentTypeEnum = pgEnum("consent_type", ["data_sharing", "photography", "emergency_services", "medical_treatment", "research", "media", "other"]);

export const consentRecordsTable = pgTable("consent_records", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull(),
  consentType: consentTypeEnum("consent_type").notNull(),
  consentGiven: boolean("consent_given").notNull(),
  consentDate: timestamp("consent_date").notNull(),
  consentExpiresAt: timestamp("consent_expires_at"), // nullable for indefinite consent
  givenBy: text("given_by"), // participant name or guardian name if applicable
  recordedBy: integer("recorded_by").notNull(), // user_id
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConsentRecordSchema = createInsertSchema(consentRecordsTable).omit({ id: true, createdAt: true });
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type ConsentRecord = typeof consentRecordsTable.$inferSelect;
