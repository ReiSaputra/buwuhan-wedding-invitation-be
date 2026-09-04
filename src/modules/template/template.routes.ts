// Taruh file ini di: src/modules/template/template.routes.ts
//
// Jangan lupa daftarkan router ini di src/routes/v1/index.ts:
//
//   import { templateRouter } from "../../modules/template/template.routes";
//   v1Router.use(templateRouter);

import { Router } from "express";

import { TemplateController } from "./template.controller";
import { createTemplateSchema, updateTemplateSchema } from "./template.schema";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

export const templateRouter = Router();

// dipakai di panel pembuat undangan -- semua role yang login boleh browse,
// bedanya cuma flag `isAccessible` per item tergantung planTier
templateRouter.get("/templates", requireAuth, TemplateController.listForUser);
templateRouter.get("/templates/:slug", requireAuth, TemplateController.getBySlugForUser);

// admin-only -- kelola katalog template
templateRouter.post("/templates", requireAuth, requireRole("ADMIN"), validate(createTemplateSchema), TemplateController.create);
templateRouter.patch("/templates/:id", requireAuth, requireRole("ADMIN"), validate(updateTemplateSchema), TemplateController.update);
// soft-delete (nonaktifkan), bukan hapus permanen -- lihat catatan di template.repository.ts
templateRouter.delete("/templates/:id", requireAuth, requireRole("ADMIN"), TemplateController.deactivate);

// ── Admin-only -- Kelola Katalog Penuh & Restore ──────────────────────
templateRouter.get("/admin/templates", requireAuth, requireRole("ADMIN"), TemplateController.listForAdmin);
templateRouter.patch("/admin/templates/:id/restore", requireAuth, requireRole("ADMIN"), TemplateController.restore);