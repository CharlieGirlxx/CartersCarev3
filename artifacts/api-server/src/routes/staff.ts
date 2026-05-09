import { Router, type IRouter } from "express";
import { db, staffTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateStaffBody, UpdateStaffBody, GetStaffMemberParams, UpdateStaffParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/staff", async (req, res) => {
  const { role, status } = req.query as Record<string, string>;
  const conditions = [];
  if (role) conditions.push(eq(staffTable.role, role as any));
  if (status) conditions.push(eq(staffTable.status, status as any));
  const results = conditions.length
    ? await db.select().from(staffTable).where(and(...conditions))
    : await db.select().from(staffTable);
  res.json(results);
});

router.post("/staff", async (req, res) => {
  const parsed = CreateStaffBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body", details: parsed.error.issues }); return; }
  const [member] = await db.insert(staffTable).values(parsed.data as any).returning();
  res.status(201).json(member);
});

router.get("/staff/:id", async (req, res) => {
  const params = GetStaffMemberParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [member] = await db.select().from(staffTable).where(eq(staffTable.id, params.data.id));
  if (!member) { res.status(404).json({ error: "Not found" }); return; }
  res.json(member);
});

router.patch("/staff/:id", async (req, res) => {
  const params = UpdateStaffParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateStaffBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(staffTable).set(parsed.data as any).where(eq(staffTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

// Staff compliance aggregated view
router.get("/staff/:id/compliance", async (req, res) => {
  const id = parseInt(req.params.id);
  const [member] = await db.select().from(staffTable).where(eq(staffTable.id, id));
  if (!member) { res.status(404).json({ error: "Not found" }); return; }

  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const getCertStatus = (expiry: string | null) => {
    if (!expiry) return "not_provided";
    const exp = new Date(expiry);
    if (exp < today) return "expired";
    if (exp <= thirtyDays) return "expiring_soon";
    return "current";
  };

  const certifications = [
    { name: "WWCC", number: member.wwccNumber ?? null, expiryDate: member.wwccExpiry ?? null, status: getCertStatus(member.wwccExpiry) },
    { name: "NDIS Worker Screening", number: member.ndisWorkerScreeningId ?? null, expiryDate: member.ndisWorkerScreeningExpiry ?? null, status: getCertStatus(member.ndisWorkerScreeningExpiry) },
    { name: "First Aid", number: null, expiryDate: member.firstAidExpiry ?? null, status: getCertStatus(member.firstAidExpiry) },
    { name: "CPR", number: null, expiryDate: member.cprExpiry ?? null, status: getCertStatus(member.cprExpiry) },
  ];

  const hasExpired = certifications.some(c => c.status === "expired");
  const hasExpiringSoon = certifications.some(c => c.status === "expiring_soon");
  const overallStatus = hasExpired ? "expired" : hasExpiringSoon ? "expiring_soon" : certifications.some(c => c.status === "not_provided") ? "incomplete" : "compliant";

  res.json({ staffId: id, certifications, overallStatus });
});

export default router;
