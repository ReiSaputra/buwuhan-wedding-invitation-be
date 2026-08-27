// Taruh file ini di: src/modules/template/template.controller.ts

import type { NextFunction, Request, Response } from "express";

import { TemplateService } from "./template.service";
import type { CreateTemplateReq, CreateTemplateRes, DeactivateTemplateRes, GetTemplateRes, ListTemplateRes, UpdateTemplateReq, UpdateTemplateRes } from "./template.types";

export class TemplateController {
  static async listForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: ListTemplateRes = await TemplateService.listForUser(req.user!.planTier);

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
}
