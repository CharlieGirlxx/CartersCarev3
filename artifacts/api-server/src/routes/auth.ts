import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!users.length) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const user = users[0];
  // Simple password check (demo mode - store plain for seeded accounts)
  if (user.passwordHash !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString("base64");
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organisation: user.organisation ?? null,
      avatarUrl: user.avatarUrl ?? null,
    },
    token,
  });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    const users = await db.select().from(usersTable).where(eq(usersTable.id, parseInt(userId))).limit(1);
    if (!users.length) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organisation: user.organisation ?? null,
      avatarUrl: user.avatarUrl ?? null,
    });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;
