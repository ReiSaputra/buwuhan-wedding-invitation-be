import type { NextFunction, Request, Response } from "express";
import { GiftService } from "./gift.service";
import type { CreateGiftAccountReq, CreateGiftReq, UpdateGiftAccountReq, UpdateGiftReq } from "./gift.types";

export class GiftController {
  // ── Gift Accounts ──────────────────────────────────────────────────────
  static async listAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const result = await GiftService.listAccounts(invitationId, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async createAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const result = await GiftService.createAccount(invitationId, ownerId, req.body as CreateGiftAccountReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async updateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const ownerId = req.user!.id;
      const result = await GiftService.updateAccount(id, ownerId, req.body as UpdateGiftAccountReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async removeAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const ownerId = req.user!.id;
      const result = await GiftService.removeAccount(id, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  // ── Gifts ──────────────────────────────────────────────────────────────
  static async listGifts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const result = await GiftService.listGifts(invitationId, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getGiftsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const result = await GiftService.getGiftsSummary(invitationId, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async createGift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const result = await GiftService.createGift(invitationId, ownerId, req.body as CreateGiftReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async updateGift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const ownerId = req.user!.id;
      const result = await GiftService.updateGift(id, ownerId, req.body as UpdateGiftReq);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async removeGift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const ownerId = req.user!.id;
      const result = await GiftService.removeGift(id, ownerId);
      res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  }
}

