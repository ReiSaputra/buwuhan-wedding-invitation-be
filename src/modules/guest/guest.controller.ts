import type { NextFunction, Request, Response } from "express";

import { GuestService } from "./guest.service";
import type { BulkCreateGuestReq, CheckInGuestReq, CheckOutGuestReq, CreateGuestReq, GuestFilterQuery, UpdateGuestReq } from "./guest.types";

export class GuestController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const request = req.body as CreateGuestReq;

      const response = await GuestService.create(invitationId, ownerId, request);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const request = req.body as BulkCreateGuestReq;

      const response = await GuestService.bulkCreate(invitationId, ownerId, request);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;

      const filter: GuestFilterQuery = {
        category: req.query.category as string | undefined,
        isAttended: req.query.isAttended === undefined ? undefined : req.query.isAttended === "true",
        search: req.query.search as string | undefined,
      };

      const response = await GuestService.list(invitationId, ownerId, filter);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const guestId = req.params.id as string;
      const ownerId = req.user!.id;

      const response = await GuestService.getById(invitationId, guestId, ownerId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const guestId = req.params.id as string;
      const ownerId = req.user!.id;
      const request = req.body as UpdateGuestReq;

      const response = await GuestService.update(invitationId, guestId, ownerId, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const guestId = req.params.id as string;
      const ownerId = req.user!.id;

      const response = await GuestService.remove(invitationId, guestId, ownerId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const request = req.body as CheckInGuestReq;

      const response = await GuestService.checkIn(invitationId, ownerId, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;
      const request = req.body as CheckOutGuestReq;

      const response = await GuestService.checkOut(invitationId, ownerId, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;

      const response = await GuestService.getStats(invitationId, ownerId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicByQrCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const qrCode = req.params.qrCode as string;

      const response = await GuestService.getPublicByQrCode(slug, qrCode);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
