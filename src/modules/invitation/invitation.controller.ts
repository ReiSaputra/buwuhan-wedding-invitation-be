import type { NextFunction, Request, Response } from "express";

import { InvitationService } from "./invitation.service";
import { adminInvitationQuerySchema } from "./invitation.schema";
import type {
  AddGalleryPhotoReq,
  AddLoveStoryReq,
  AdminInvitationDetailRes,
  AdminInvitationListRes,
  CreateInvitationReq,
  CreateInvitationRes,
  DeleteInvitationRes,
  GalleryPhotoRes,
  GetInvitationRes,
  ListInvitationRes,
  LoveStoryRes,
  UpdateGalleryPhotoReq,
  UpdateInvitationReq,
  UpdateInvitationRes,
  UpdateInvitationStatusReq,
  UpdateInvitationStatusRes,
  UpdateLoveStoryReq,
} from "./invitation.types";

export class InvitationController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: CreateInvitationReq = req.body as CreateInvitationReq;
      const response: CreateInvitationRes = await InvitationService.create(req.user!.id, req.user!.planTier, request);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: ListInvitationRes = await InvitationService.listMine(req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getOwned(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: GetInvitationRes = await InvitationService.getOwned(req.params.id as string, req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: GetInvitationRes = await InvitationService.getPublicBySlug(req.params.slug as string);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: UpdateInvitationReq = req.body as UpdateInvitationReq;
      const response: UpdateInvitationRes = await InvitationService.update(req.params.id as string, req.user!.id, req.user!.planTier, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: UpdateInvitationStatusReq = req.body as UpdateInvitationStatusReq;
      const response: UpdateInvitationStatusRes = await InvitationService.updateStatus(req.params.id as string, req.user!.id, req.user!.planTier, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: DeleteInvitationRes = await InvitationService.remove(req.params.id as string, req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ── Galeri Foto ──────────────────────────────────────────────────────

  static async addGalleryPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const request = req.body as AddGalleryPhotoReq;
      const response: GalleryPhotoRes = await InvitationService.addGalleryPhoto(invitationId, req.user!.id, req.user!.planTier, request);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateGalleryPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const photoId = req.params.id as string;
      const request = req.body as UpdateGalleryPhotoReq;
      const response: GalleryPhotoRes = await InvitationService.updateGalleryPhoto(invitationId, photoId, req.user!.id, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async removeGalleryPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const photoId = req.params.id as string;
      const response = await InvitationService.removeGalleryPhoto(invitationId, photoId, req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ── Kisah Cinta (Love Story) ─────────────────────────────────────────

  static async addLoveStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const request = req.body as AddLoveStoryReq;
      const response: LoveStoryRes = await InvitationService.addLoveStory(invitationId, req.user!.id, request);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateLoveStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const storyId = req.params.id as string;
      const request = req.body as UpdateLoveStoryReq;
      const response: LoveStoryRes = await InvitationService.updateLoveStory(invitationId, storyId, req.user!.id, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async removeLoveStory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const storyId = req.params.id as string;
      const response = await InvitationService.removeLoveStory(invitationId, storyId, req.user!.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ── Admin Moderation & Overview Handlers ─────────────────────────────

  static async listAdminInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = adminInvitationQuerySchema.parse(req.query);
      const response: AdminInvitationListRes = await InvitationService.listInvitationsForAdmin(query);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminInvitationDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AdminInvitationDetailRes = await InvitationService.getInvitationDetailForAdmin(req.params.id as string);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminInvitationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as UpdateInvitationStatusReq;
      const response: UpdateInvitationStatusRes = await InvitationService.updateStatusByAdmin(req.params.id as string, body.status);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
