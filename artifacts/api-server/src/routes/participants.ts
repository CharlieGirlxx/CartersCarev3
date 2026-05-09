import { Router, type IRouter } from "express";
import { db, participantsTable } from "@workspace/db";
import { eq, ilike, or, and } from "drizzle-orm";
import { CreateParticipantBody, UpdateParticipantBody, GetParticipantParams, UpdateParticipantParams, DeleteParticipantParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/participants", async (req, res) => {
  const { status, fundingType, search } = req.query as Record<string, string>;
  let query = db.select().from(participantsTable);
  const conditions = [];
  if (status) conditions.push(eq(participantsTable.status, status as any));
  if (fundingType) conditions.push(eq(participantsTable.fundingType, fundingType as any));
  if (search) {
    conditions.push(
      or(
        ilike(participantsTable.firstName, `%${search}%`),
        ilike(participantsTable.lastName, `%${search}%`),
        ilike(participantsTable.ndisNumber, `%${search}%`),
      )
    );
  }
  const results = conditions.length
    ? await query.where(and(...conditions))
    : await query;
  res.json(results);
});

router.post("/participants", async (req, res) => {
  const parsed = CreateParticipantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }
  const [participant] = await db.insert(participantsTable).values(parsed.data as any).returning();
  res.status(201).json(participant);
});

router.get("/participants/:id", async (req, res) => {
  const params = GetParticipantParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [participant] = await db.select().from(participantsTable).where(eq(participantsTable.id, params.data.id));
  if (!participant) { res.status(404).json({ error: "Not found" }); return; }
  res.json(participant);
});

router.patch("/participants/:id", async (req, res) => {
  const params = UpdateParticipantParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateParticipantBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(participantsTable).set({ ...parsed.data as any, updatedAt: new Date() }).where(eq(participantsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/participants/:id", async (req, res) => {
  const params = DeleteParticipantParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(participantsTable).where(eq(participantsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
