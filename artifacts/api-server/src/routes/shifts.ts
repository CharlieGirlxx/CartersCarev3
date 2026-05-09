import { Router, type IRouter } from "express";
import { db, shiftsTable, participantsTable, staffTable, activityLogTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { CreateShiftBody, UpdateShiftBody, GetShiftParams, UpdateShiftParams, DeleteShiftParams, ClockInShiftParams, ClockOutShiftParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichShift(shift: typeof shiftsTable.$inferSelect) {
  const [participant] = await db.select({ firstName: participantsTable.firstName, lastName: participantsTable.lastName }).from(participantsTable).where(eq(participantsTable.id, shift.participantId));
  const [staff] = await db.select({ firstName: staffTable.firstName, lastName: staffTable.lastName }).from(staffTable).where(eq(staffTable.id, shift.staffId));
  return {
    ...shift,
    participantName: participant ? `${participant.firstName} ${participant.lastName}` : null,
    staffName: staff ? `${staff.firstName} ${staff.lastName}` : null,
  };
}

router.get("/shifts", async (req, res) => {
  const { startDate, endDate, staffId, participantId, status } = req.query as Record<string, string>;
  const conditions = [];
  if (startDate) conditions.push(gte(shiftsTable.startTime, startDate));
  if (endDate) conditions.push(lte(shiftsTable.startTime, endDate));
  if (staffId) conditions.push(eq(shiftsTable.staffId, parseInt(staffId)));
  if (participantId) conditions.push(eq(shiftsTable.participantId, parseInt(participantId)));
  if (status) conditions.push(eq(shiftsTable.status, status as any));
  const shifts = conditions.length
    ? await db.select().from(shiftsTable).where(and(...conditions))
    : await db.select().from(shiftsTable);
  const enriched = await Promise.all(shifts.map(enrichShift));
  res.json(enriched);
});

router.post("/shifts", async (req, res) => {
  const parsed = CreateShiftBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body", details: parsed.error.issues }); return; }
  const [shift] = await db.insert(shiftsTable).values(parsed.data as any).returning();
  res.status(201).json(await enrichShift(shift));
});

router.get("/shifts/:id", async (req, res) => {
  const params = GetShiftParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [shift] = await db.select().from(shiftsTable).where(eq(shiftsTable.id, params.data.id));
  if (!shift) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichShift(shift));
});

router.patch("/shifts/:id", async (req, res) => {
  const params = UpdateShiftParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateShiftBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(shiftsTable).set(parsed.data as any).where(eq(shiftsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichShift(updated));
});

router.delete("/shifts/:id", async (req, res) => {
  const params = DeleteShiftParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(shiftsTable).where(eq(shiftsTable.id, params.data.id));
  res.status(204).send();
});

router.post("/shifts/:id/clock-in", async (req, res) => {
  const params = ClockInShiftParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [updated] = await db.update(shiftsTable)
    .set({ status: "in_progress", actualStartTime: new Date().toISOString() })
    .where(eq(shiftsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityLogTable).values({ type: "shift_started", description: `Shift #${params.data.id} started`, userId: updated.staffId, participantId: updated.participantId });
  res.json(await enrichShift(updated));
});

router.post("/shifts/:id/clock-out", async (req, res) => {
  const params = ClockOutShiftParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [updated] = await db.update(shiftsTable)
    .set({ status: "completed", actualEndTime: new Date().toISOString() })
    .where(eq(shiftsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityLogTable).values({ type: "shift_completed", description: `Shift #${params.data.id} completed`, userId: updated.staffId, participantId: updated.participantId });
  res.json(await enrichShift(updated));
});

export default router;
