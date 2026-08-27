import type { NextFunction, Request, Response } from "express";

import { RSVPService } from "./rsvp.service";
import type { RSVPFilterQuery, SubmitRSVPReq, WishesQuery } from "./rsvp.types";
import type { RSVPStatus } from "../../generated/prisma/client";

export class RSVPController {
  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const request = req.body as SubmitRSVPReq;

      const response = await RSVPService.submit(slug, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async listWishes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const query: WishesQuery = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
      };

      const response = await RSVPService.listWishes(slug, query);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async listByInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;

      const filter: RSVPFilterQuery = {
        status: req.query.status as RSVPStatus | undefined,
        search: req.query.search as string | undefined,
      };

      const response = await RSVPService.listByInvitation(invitationId, ownerId, filter);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const ownerId = req.user!.id;

      const response = await RSVPService.getStats(invitationId, ownerId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const rsvpId = req.params.id as string;
      const ownerId = req.user!.id;

      const response = await RSVPService.delete(invitationId, rsvpId, ownerId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
