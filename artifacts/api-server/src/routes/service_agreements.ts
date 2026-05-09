import { Router, type IRouter } from "express";
import { db, serviceAgreementsTable, participantsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateServiceAgreementBody, UpdateServiceAgreementBody, GetServiceAgreementParams, UpdateServiceAgreementParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrich(sa: typeof serviceAgreementsTable.$inferSelect) {
  const [p] = await db.select({ firstName: participantsTable.firstName, lastName: participantsTable.lastName }).from(participantsTable).where(eq(participantsTable.id, sa.participantId));
  return { ...sa, participantName: p ? `${p.firstName} ${p.lastName}` : null };
}

router.get("/service-agreements", async (req, res) => {
  const { participantId, status } = req.query as Record<string, string>;
  const conditions = [];
  if (participantId) conditions.push(eq(serviceAgreementsTable.participantId, parseInt(participantId)));
  if (status) conditions.push(eq(serviceAgreementsTable.status, status as any));
  const results = conditions.length
    ? await db.select().from(serviceAgreementsTable).where(and(...conditions))
    : await db.select().from(serviceAgreementsTable);
  res.json(await Promise.all(results.map(enrich)));
});

router.post("/service-agreements", async (req, res) => {
  const parsed = CreateServiceAgreementBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body", details: parsed.error.issues }); return; }
  const data = { ...parsed.data, remainingBudget: (parsed.data as any).totalBudget ?? 0 };
  const [sa] = await db.insert(serviceAgreementsTable).values(data as any).returning();
  res.status(201).json(await enrich(sa));
});

router.get("/service-agreements/:id", async (req, res) => {
  const params = GetServiceAgreementParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [sa] = await db.select().from(serviceAgreementsTable).where(eq(serviceAgreementsTable.id, params.data.id));
  if (!sa) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(sa));
});

router.patch("/service-agreements/:id", async (req, res) => {
  const params = UpdateServiceAgreementParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateServiceAgreementBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const body = parsed.data as any;
  const updateData: any = { ...body };
  if (body.spentBudget !== undefined) {
    const [current] = await db.select().from(serviceAgreementsTable).where(eq(serviceAgreementsTable.id, params.data.id));
    if (current) updateData.remainingBudget = current.totalBudget - body.spentBudget;
  }
  const [updated] = await db.update(serviceAgreementsTable).set(updateData).where(eq(serviceAgreementsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(updated));
});

export default router;
