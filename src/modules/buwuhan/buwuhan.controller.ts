import type { Request, Response, NextFunction } from "express";
import { BuwuhanService } from "./buwuhan.service";
import type { CreateBuwuhanReq, UpdateBuwuhanReq } from "./buwuhan.types";

export class BuwuhanController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const actorUserId = req.user!.id;
      // Untuk sesi petugas instan, memberId ada di JWT. Untuk akun platform biasa, null.
      const actorMemberId = req.user!.memberId ?? null;
      // Nama pencatat: ambil dari header X-Actor-Name (dikirim FE) atau fallback ke null
      // TODO: di iterasi berikutnya bisa di-resolve dari DB berdasarkan memberId
      const actorName = (req.headers["x-actor-name"] as string) ?? null;

      const result = await BuwuhanService.create(invitationId, actorUserId, actorMemberId, actorName, req.body as CreateBuwuhanReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const actorUserId = req.user!.id;
      const result = await BuwuhanService.list(invitationId, actorUserId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const actorUserId = req.user!.id;
      const result = await BuwuhanService.getById(id, actorUserId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const actorUserId = req.user!.id;
      const actorMemberId = req.user!.memberId ?? null;
      const invitationRole = req.invitationRole ?? req.user!.invitationRole;

      const result = await BuwuhanService.update(id, actorUserId, actorMemberId, invitationRole, req.body as UpdateBuwuhanReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const actorUserId = req.user!.id;
      const invitationRole = req.invitationRole ?? req.user!.invitationRole;

      const result = await BuwuhanService.remove(id, actorUserId, invitationRole);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const actorUserId = req.user!.id;
      const result = await BuwuhanService.getSummary(invitationId, actorUserId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async listByOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = req.user!.id;
      const result = await BuwuhanService.listByOwner(actorUserId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async createStandalone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = req.user!.id;
      const actorName = (req.headers["x-actor-name"] as string) ?? null;

      const result = await BuwuhanService.createStandalone(actorUserId, actorName, req.body as CreateBuwuhanReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async listStandalone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = req.user!.id;
      const result = await BuwuhanService.listStandalone(actorUserId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }
}
