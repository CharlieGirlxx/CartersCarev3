import { Router, type IRouter } from "express";
import { db, complianceChecksTable, staffTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateComplianceCheckBody, UpdateComplianceCheckBody, UpdateComplianceCheckParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/compliance/checks", async (req, res) => {
  const { category, status } = req.query as Record<string, string>;
  const conditions = [];
  if (category) conditions.push(eq(complianceChecksTable.category, category as any));
  if (status) conditions.push(eq(complianceChecksTable.status, status as any));
  const results = conditions.length
    ? await db.select().from(complianceChecksTable).where(and(...conditions))
    : await db.select().from(complianceChecksTable);
  res.json(results);
});

router.post("/compliance/checks", async (req, res) => {
  const parsed = CreateComplianceCheckBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body", details: parsed.error.issues }); return; }
  const [check] = await db.insert(complianceChecksTable).values(parsed.data as any).returning();
  res.status(201).json(check);
});

router.patch("/compliance/checks/:id", async (req, res) => {
  const params = UpdateComplianceCheckParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateComplianceCheckBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(complianceChecksTable).set(parsed.data as any).where(eq(complianceChecksTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.get("/compliance/expiring", async (req, res) => {
  const today = new Date();
  const sixtyDays = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().split("T")[0];
  const sixtyStr = sixtyDays.toISOString().split("T")[0];

  const allStaff = await db.select().from(staffTable).where(eq(staffTable.status, "active"));
  const items: any[] = [];

  for (const s of allStaff) {
    const checks = [
      { type: "wwcc", name: "WWCC", expiry: s.wwccExpiry },
      { type: "ndis_worker_screening", name: "NDIS Worker Screening", expiry: s.ndisWorkerScreeningExpiry },
      { type: "first_aid", name: "First Aid", expiry: s.firstAidExpiry },
      { type: "cpr", name: "CPR", expiry: s.cprExpiry },
    ];
    for (const c of checks) {
      if (c.expiry && c.expiry >= todayStr && c.expiry <= sixtyStr) {
        const expDate = new Date(c.expiry);
        const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        items.push({ id: s.id, type: c.type, name: c.name, expiryDate: c.expiry, daysUntilExpiry: daysUntil, entityName: `${s.firstName} ${s.lastName}`, entityType: "staff" });
      }
    }
  }

  res.json(items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry));
});

export default router;
