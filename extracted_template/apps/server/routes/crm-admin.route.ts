import { Hono } from "hono";
import { apiSuccess } from "@repo/shared/http";
import { adminRoute } from "../_core/route-helpers";

export const crmAdminRouter = new Hono();

crmAdminRouter.post("/authorize", adminRoute, async (c) => {
  const body = await c.req.json().catch(() => ({})) as { action?: string };
  const action = typeof body.action === "string" ? body.action : "unknown";

  return c.json(apiSuccess({
    allowed: true,
    action,
    adminEmail: c.var.currentUser.email,
  }), 200);
});
