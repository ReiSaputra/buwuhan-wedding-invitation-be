import type { NextFunction, Request, Response } from "express";
import { MemberService } from "./member.service";
import type { AcceptInviteReq, InviteMemberReq, UpdateMemberRoleReq } from "./member.types";

export class MemberController {
  static async invite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const currentUserId = req.user!.id;
      const request = req.body as InviteMemberReq;

      const response = await MemberService.invite(invitationId, currentUserId, request);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async resendInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const memberId = req.params.id as string;

      const response = await MemberService.resendInvite(invitationId, memberId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;

      const response = await MemberService.list(invitationId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const memberId = req.params.id as string;

      const response = await MemberService.getById(invitationId, memberId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const memberId = req.params.id as string;
      const request = req.body as UpdateMemberRoleReq;

      const response = await MemberService.updateRole(invitationId, memberId, request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitationId = req.params.invitationId as string;
      const memberId = req.params.id as string;

      const response = await MemberService.remove(invitationId, memberId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body as AcceptInviteReq;
      const userId = req.user!.id;

      const response = await MemberService.accept(token, userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

