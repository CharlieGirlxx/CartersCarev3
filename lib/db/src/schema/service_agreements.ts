import { pgTable, text, serial, timestamp, pgEnum, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agreementFundingTypeEnum = pgEnum("agreement_funding_type", ["ndis", "aged_care", "private"]);
export const agreementStatusEnum = pgEnum("agreement_status", ["draft", "active", "expired", "cancelled"]);

export const serviceAgreementsTable = pgTable("service_agreements", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  fundingType: agreementFundingTypeEnum("funding_type").notNull(),
  ndisPlanNumber: text("ndis_plan_number"),
  status: agreementStatusEnum("status").notNull().default("draft"),
  totalBudget: real("total_budget").notNull().default(0),
  spentBudget: real("spent_budget").notNull().default(0),
  remainingBudget: real("remaining_budget").notNull().default(0),
  supportCategories: text("support_categories"),
  reviewDate: text("review_date"),
  signedByParticipant: boolean("signed_by_participant").notNull().default(false),
  signedDate: text("signed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceAgreementSchema = createInsertSchema(serviceAgreementsTable).omit({ id: true, createdAt: true });
export type InsertServiceAgreement = z.infer<typeof insertServiceAgreementSchema>;
export type ServiceAgreement = typeof serviceAgreementsTable.$inferSelect;
