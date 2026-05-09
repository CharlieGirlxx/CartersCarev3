import { Router, type IRouter } from "express";
import { db, goalsTable, participantsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateGoalBody, UpdateGoalBody, GetGoalParams, UpdateGoalParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrich(goal: typeof goalsTable.$inferSelect) {
  const [p] = await db.select({ firstName: participantsTable.firstName, lastName: participantsTable.lastName }).from(participantsTable).where(eq(participantsTable.id, goal.participantId));
  return { ...goal, participantName: p ? `${p.firstName} ${p.lastName}` : null };
}

router.get("/goals", async (req, res) => {
  const { participantId, status } = req.query as Record<string, string>;
  const conditions = [];
  if (participantId) conditions.push(eq(goalsTable.participantId, parseInt(participantId)));
  if (status) conditions.push(eq(goalsTable.status, status as any));
  const results = conditions.length
    ? await db.select().from(goalsTable).where(and(...conditions))
    : await db.select().from(goalsTable);
  res.json(await Promise.all(results.map(enrich)));
});

router.post("/goals", async (req, res) => {
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body", details: parsed.error.issues }); return; }
  const [goal] = await db.insert(goalsTable).values(parsed.data as any).returning();
  res.status(201).json(await enrich(goal));
});

router.get("/goals/:id", async (req, res) => {
  const params = GetGoalParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, params.data.id));
  if (!goal) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(goal));
});

router.patch("/goals/:id", async (req, res) => {
  const params = UpdateGoalParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(goalsTable).set({ ...parsed.data as any, updatedAt: new Date() }).where(eq(goalsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(updated));
});

export default router;
