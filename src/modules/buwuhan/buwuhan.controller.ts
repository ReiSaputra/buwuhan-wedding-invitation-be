import type { Request, Response, NextFunction } from "express";
import { BuwuhanService } from "./buwuhan.service";
import type { CreateBuwuhanReq, UpdateBuwuhanReq } from "./buwuhan.types";

export class BuwuhanController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const result = await BuwuhanService.create(invitationId, ownerId, req.body as CreateBuwuhanReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const result = await BuwuhanService.list(invitationId, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const ownerId = req.user!.id;
      const result = await BuwuhanService.getById(id, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const ownerId = req.user!.id;
      const result = await BuwuhanService.update(id, ownerId, req.body as UpdateBuwuhanReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const ownerId = req.user!.id;
      const result = await BuwuhanService.remove(id, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const result = await BuwuhanService.getSummary(invitationId, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async listByOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.id;
      const result = await BuwuhanService.listByOwner(ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }
}
