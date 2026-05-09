import { Router, type IRouter } from "express";
import { db, caseNotesTable, participantsTable, staffTable, activityLogTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateCaseNoteBody, UpdateCaseNoteBody, GetCaseNoteParams, UpdateCaseNoteParams, DeleteCaseNoteParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrich(note: typeof caseNotesTable.$inferSelect) {
  const [p] = await db.select({ firstName: participantsTable.firstName, lastName: participantsTable.lastName }).from(participantsTable).where(eq(participantsTable.id, note.participantId));
  const [s] = await db.select({ firstName: staffTable.firstName, lastName: staffTable.lastName }).from(staffTable).where(eq(staffTable.id, note.staffId));
  return {
    ...note,
    participantName: p ? `${p.firstName} ${p.lastName}` : null,
    staffName: s ? `${s.firstName} ${s.lastName}` : null,
  };
}

router.get("/case-notes", async (req, res) => {
  const { participantId, staffId, category } = req.query as Record<string, string>;
  const conditions = [];
  if (participantId) conditions.push(eq(caseNotesTable.participantId, parseInt(participantId)));
  if (staffId) conditions.push(eq(caseNotesTable.staffId, parseInt(staffId)));
  if (category) conditions.push(eq(caseNotesTable.category, category as any));
  const results = conditions.length
    ? await db.select().from(caseNotesTable).where(and(...conditions))
    : await db.select().from(caseNotesTable);
  res.json(await Promise.all(results.map(enrich)));
});

router.post("/case-notes", async (req, res) => {
  const parsed = CreateCaseNoteBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body", details: parsed.error.issues }); return; }
  // Use staff ID 1 as default author if not provided
  const data = { ...parsed.data, staffId: (parsed.data as any).staffId ?? 1 };
  const [note] = await db.insert(caseNotesTable).values(data as any).returning();
  await db.insert(activityLogTable).values({ type: "case_note_added", description: `Case note added for participant #${note.participantId}`, userId: note.staffId, participantId: note.participantId });
  res.status(201).json(await enrich(note));
});

router.get("/case-notes/:id", async (req, res) => {
  const params = GetCaseNoteParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [note] = await db.select().from(caseNotesTable).where(eq(caseNotesTable.id, params.data.id));
  if (!note) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(note));
});

router.patch("/case-notes/:id", async (req, res) => {
  const params = UpdateCaseNoteParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateCaseNoteBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(caseNotesTable).set({ ...parsed.data as any, updatedAt: new Date() }).where(eq(caseNotesTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrich(updated));
});

router.delete("/case-notes/:id", async (req, res) => {
  const params = DeleteCaseNoteParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(caseNotesTable).where(eq(caseNotesTable.id, params.data.id));
  res.status(204).send();
});

export default router;
