import { Router, type IRouter } from "express";
import { db, incidentsTable, participantsTable, staffTable, activityLogTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateIncidentBody, UpdateIncidentBody, GetIncidentParams, UpdateIncidentParams, SubmitIncidentToNDISParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrich(inc: typeof incidentsTable.$inferSelect) {
  const [p] = await db.select({ firstName: participantsTable.firstName, lastName: participantsTable.lastName }).from(participantsTable).where(eq(participantsTable.id, inc.participantId));
  const [s] = await db.select({ firstName: staffTable.firstName, lastName: staffTable.lastName }).from(staffTable).where(eq(staffTable.id, inc.reportedById));
  return {
    ...inc,
    participantName: p ? `${p.firstName} ${p.lastName}` : null,
    reportedByName: s ? `${s.firstName} ${s.lastName}` : null,
  };
}

router.get("/incidents", async (req, res) => {
  const { participantId, severity, status } = req.query as Record<string, string>;
  const conditions = [];
  if (participantId) conditions.push(eq(incidentsTable.participantId, parseInt(participantId)));
  if (severity) conditions.push(eq(incidentsTable.severity, severity as any));
  if (status) conditions.push(eq(incidentsTable.status, status as any));
  const results = conditions.length
    ? await db.select().from(incidentsTable).where(and(...conditions))
    : await db.select().from(incidentsTable);
  res.json(await Promise.all(results.map(enrich)));
});

router.post("/incidents", async (req, res) => {
  const parsed = CreateIncidentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body", details: parsed.error.issues }); return; }
  const data = { ...parsed.data, reportedById: (parsed.data as any).reportedById ?? 1 };
  const [inc] = await db.insert(incidentsTable).values(data as any).returning();
  await db.insert(activityLogTable).values({ type: "incident_reported", description: `Incident reported: ${inc.type} (${inc.severity})`, userId: inc.reportedById, participantId: inc.participantId });
  res.status(201).json(await enrich(inc));
});

router.get("/incidents/:id", async (req, res) => {
  const params = GetIncidentParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [inc] = await db.select().from(incidentsTable).where(eq(incidentsTable.id, params.data.id));
  if (!inc) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(inc));
});

router.patch("/incidents/:id", async (req, res) => {
  const params = UpdateIncidentParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateIncidentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(incidentsTable).set({ ...parsed.data as any, updatedAt: new Date() }).where(eq(incidentsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(updated));
});

router.post("/incidents/:id/submit-ndis", async (req, res) => {
  const params = SubmitIncidentToNDISParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [updated] = await db.update(incidentsTable)
    .set({ status: "submitted", ndisSubmissionDate: new Date().toISOString(), reportableToNDIS: true })
    .where(eq(incidentsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(updated));
});

export default router;
