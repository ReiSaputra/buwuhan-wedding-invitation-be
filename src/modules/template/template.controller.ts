import type { NextFunction, Request, Response } from "express";

import { TemplateService } from "./template.service";
import { adminTemplateQuerySchema } from "./template.schema";
import type {
  AdminTemplateListRes,
  CreateTemplateReq,
  CreateTemplateRes,
  DeactivateTemplateRes,
  GetTemplateRes,
  ListTemplateRes,
  RestoreTemplateRes,
  UpdateTemplateReq,
  UpdateTemplateRes,
} from "./template.types";
import type { EventCategory } from "../../generated/prisma/client";

export class TemplateController {
  static async listForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category ? (String(req.query.category).toUpperCase() as EventCategory) : undefined;
      const response: ListTemplateRes = await TemplateService.listForUser(req.user!.planTier, category);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getBySlugForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: GetTemplateRes = await TemplateService.getBySlugForUser(req.params.slug as string, req.user!.planTier);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: CreateTemplateReq = req.body as CreateTemplateReq;

      const response: CreateTemplateRes = await TemplateService.create(request, req.user!.planTier);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: UpdateTemplateReq = req.body as UpdateTemplateReq;

      const response: UpdateTemplateRes = await TemplateService.update(req.params.id as string, request, req.user!.planTier);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: DeactivateTemplateRes = await TemplateService.deactivate(req.params.id as string);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ── Admin Catalog Handlers ──────────────────────────────────────────

  static async listForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = adminTemplateQuerySchema.parse(req.query);
      const response: AdminTemplateListRes = await TemplateService.listForAdmin(query);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: RestoreTemplateRes = await TemplateService.restore(req.params.id as string, req.user!.planTier);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

