import { Router, type IRouter } from "express";
import { db, timesheetsTable, staffTable, activityLogTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateTimesheetBody, UpdateTimesheetBody, GetTimesheetParams, UpdateTimesheetParams, ApproveTimesheetParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichTimesheet(ts: typeof timesheetsTable.$inferSelect) {
  const [staff] = await db.select({ firstName: staffTable.firstName, lastName: staffTable.lastName }).from(staffTable).where(eq(staffTable.id, ts.staffId));
  return { ...ts, staffName: staff ? `${staff.firstName} ${staff.lastName}` : null };
}

router.get("/timesheets", async (req, res) => {
  const { staffId, status } = req.query as Record<string, string>;
  const conditions = [];
  if (staffId) conditions.push(eq(timesheetsTable.staffId, parseInt(staffId)));
  if (status) conditions.push(eq(timesheetsTable.status, status as any));
  const results = conditions.length
    ? await db.select().from(timesheetsTable).where(and(...conditions))
    : await db.select().from(timesheetsTable);
  const enriched = await Promise.all(results.map(enrichTimesheet));
  res.json(enriched);
});

router.post("/timesheets", async (req, res) => {
  const parsed = CreateTimesheetBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [ts] = await db.insert(timesheetsTable).values(parsed.data as any).returning();
  res.status(201).json(await enrichTimesheet(ts));
});

router.get("/timesheets/:id", async (req, res) => {
  const params = GetTimesheetParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [ts] = await db.select().from(timesheetsTable).where(eq(timesheetsTable.id, params.data.id));
  if (!ts) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichTimesheet(ts));
});

router.patch("/timesheets/:id", async (req, res) => {
  const params = UpdateTimesheetParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateTimesheetBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(timesheetsTable).set(parsed.data as any).where(eq(timesheetsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichTimesheet(updated));
});

router.post("/timesheets/:id/approve", async (req, res) => {
  const params = ApproveTimesheetParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [updated] = await db.update(timesheetsTable)
    .set({ status: "approved", approvedAt: new Date().toISOString() })
    .where(eq(timesheetsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichTimesheet(updated));
});

export default router;
