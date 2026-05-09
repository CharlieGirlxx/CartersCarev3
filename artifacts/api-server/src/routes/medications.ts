import { Router, type IRouter } from "express";
import { db, medicationsTable, medicationAdministrationsTable, participantsTable, staffTable, activityLogTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateMedicationBody, UpdateMedicationBody, GetMedicationParams, UpdateMedicationParams, AdministerMedicationBody, AdministerMedicationParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichMed(med: typeof medicationsTable.$inferSelect) {
  const [p] = await db.select({ firstName: participantsTable.firstName, lastName: participantsTable.lastName }).from(participantsTable).where(eq(participantsTable.id, med.participantId));
  return { ...med, participantName: p ? `${p.firstName} ${p.lastName}` : null };
}

router.get("/medications", async (req, res) => {
  const { participantId, active } = req.query as Record<string, string>;
  const conditions = [];
  if (participantId) conditions.push(eq(medicationsTable.participantId, parseInt(participantId)));
  if (active !== undefined) conditions.push(eq(medicationsTable.isActive, active === "true"));
  const results = conditions.length
    ? await db.select().from(medicationsTable).where(and(...conditions))
    : await db.select().from(medicationsTable);
  res.json(await Promise.all(results.map(enrichMed)));
});

router.post("/medications", async (req, res) => {
  const parsed = CreateMedicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body", details: parsed.error.issues }); return; }
  const [med] = await db.insert(medicationsTable).values(parsed.data as any).returning();
  res.status(201).json(await enrichMed(med));
});

router.get("/medications/:id", async (req, res) => {
  const params = GetMedicationParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [med] = await db.select().from(medicationsTable).where(eq(medicationsTable.id, params.data.id));
  if (!med) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichMed(med));
});

router.patch("/medications/:id", async (req, res) => {
  const params = UpdateMedicationParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateMedicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(medicationsTable).set(parsed.data as any).where(eq(medicationsTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichMed(updated));
});

router.post("/medications/:id/administer", async (req, res) => {
  const params = AdministerMedicationParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = AdministerMedicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const adminData = { ...parsed.data, medicationId: params.data.id, administeredById: (parsed.data as any).administeredById ?? 1 };
  const [admin] = await db.insert(medicationAdministrationsTable).values(adminData as any).returning();
  await db.insert(activityLogTable).values({ type: "medication_administered", description: `Medication administered for medication #${params.data.id}`, userId: admin.administeredById });
  const [witness] = admin.witnessId ? await db.select({ firstName: staffTable.firstName, lastName: staffTable.lastName }).from(staffTable).where(eq(staffTable.id, admin.witnessId)) : [null];
  const [adminStaff] = await db.select({ firstName: staffTable.firstName, lastName: staffTable.lastName }).from(staffTable).where(eq(staffTable.id, admin.administeredById));
  res.status(201).json({
    ...admin,
    administeredByName: adminStaff ? `${adminStaff.firstName} ${adminStaff.lastName}` : null,
    witnessName: witness ? `${witness.firstName} ${witness.lastName}` : null,
  });
});

export default router;
