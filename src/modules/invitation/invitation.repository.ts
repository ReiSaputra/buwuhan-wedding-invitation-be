import { prisma } from "../../lib/prisma";
import { Prisma, type EventCategory } from "../../generated/prisma/client";
import type { AddGalleryPhotoReq, AddLoveStoryReq, CreateInvitationReq, InvitationStatusType, UpdateGalleryPhotoReq, UpdateInvitationReq, UpdateLoveStoryReq } from "./invitation.types";

const includeRelations = {
  couples: true,
  template: true,
  galleryPhotos: {
    orderBy: { order: "asc" as const },
  },
  loveStories: {
    orderBy: { order: "asc" as const },
  },
  giftAccounts: {
    orderBy: { order: "asc" as const },
  },
} as const;

export class InvitationRepository {
  static async findBySlug(slug: string) {
    return await prisma.invitation.findUnique({
      where: { slug },
      include: includeRelations,
    });
  }

  static async findByIdAndOwner(id: string, ownerId: string) {
    return await prisma.invitation.findFirst({
      where: { id, ownerId },
      include: includeRelations,
    });
  }

  static async findManyByOwner(ownerId: string) {
    return await prisma.invitation.findMany({
      where: { ownerId },
      include: includeRelations,
      orderBy: { createdAt: "desc" },
    });
  }

  static async countActiveByOwner(ownerId: string): Promise<number> {
    return await prisma.invitation.count({
      where: { ownerId, status: "ACTIVE" },
    });
  }

  static async countGalleryPhotos(invitationId: string): Promise<number> {
    return await prisma.galleryPhoto.count({
      where: { invitationId },
    });
  }

  static async create(ownerId: string, request: CreateInvitationReq) {
    try {
      return await prisma.invitation.create({
        data: {
          title: request.title,
          slug: request.slug,
          ownerId,
          status: "DRAFT",
          eventCategory: request.eventCategory ?? "WEDDING",
          eventDate: request.eventDate ? new Date(request.eventDate) : null,
          eventTime: request.eventTime ?? null,
          venue: request.venue ?? null,
          address: request.address ?? null,
          giftAddress: request.giftAddress ?? null,
          templateId: request.templateId ?? null,
          additionalInfo: request.additionalInfo ?? {},
          ...(request.couples && request.couples.length > 0
            ? {
                couples: {
                  create: request.couples.map((c) => ({
                    type: c.type,
                    name: c.name,
                    fatherName: c.fatherName,
                    motherName: c.motherName,
                  })),
                },
              }
            : {}),
        },
        include: includeRelations,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Slug sudah digunakan");
      }
      throw error;
    }
  }

  static async update(id: string, request: UpdateInvitationReq) {
    try {
      return await prisma.$transaction(async (tx) => {
        if (request.couples) {
          await tx.couple.deleteMany({ where: { invitationId: id } });
        }

        const data: Prisma.InvitationUncheckedUpdateInput = {};

        if (request.title !== undefined) data.title = request.title;
        if (request.slug !== undefined) data.slug = request.slug;
        if (request.eventCategory !== undefined) data.eventCategory = request.eventCategory;
        if (request.eventDate !== undefined) {
          data.eventDate = request.eventDate ? new Date(request.eventDate) : null;
        }
        if (request.eventTime !== undefined) data.eventTime = request.eventTime;
        if (request.venue !== undefined) data.venue = request.venue;
        if (request.address !== undefined) data.address = request.address;
        if (request.giftAddress !== undefined) data.giftAddress = request.giftAddress;
        if (request.additionalInfo !== undefined) data.additionalInfo = request.additionalInfo;
        if (request.templateId !== undefined) data.templateId = request.templateId;
        if (request.couples !== undefined) {
          data.couples = {
            create: request.couples.map((c) => ({
              type: c.type,
              name: c.name,
              fatherName: c.fatherName,
              motherName: c.motherName,
            })),
          };
        }

        return await tx.invitation.update({
          where: { id },
          data,
          include: includeRelations,
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Slug sudah digunakan");
      }
      throw error;
    }
  }

  static async updateStatus(id: string, ownerId: string, status: InvitationStatusType, publishedAt?: Date | null) {
    const data: Prisma.InvitationUncheckedUpdateInput = { status };
    if (publishedAt !== undefined) {
      data.publishedAt = publishedAt;
    }

    return await prisma.invitation.update({
      where: { id, ownerId },
      data,
      include: includeRelations,
    });
  }

  static async deleteById(id: string) {
    return await prisma.invitation.delete({ where: { id } });
  }

  // ── Galeri Foto ──────────────────────────────────────────────────────

  static async addGalleryPhoto(invitationId: string, request: AddGalleryPhotoReq) {
    return await prisma.galleryPhoto.create({
      data: {
        invitationId,
        imageUrl: request.imageUrl,
        caption: request.caption ?? null,
        order: request.order ?? 0,
      },
    });
  }

  static async findGalleryPhotoById(id: string, invitationId: string) {
    return await prisma.galleryPhoto.findFirst({
      where: { id, invitationId },
    });
  }

  static async updateGalleryPhoto(id: string, request: UpdateGalleryPhotoReq) {
    const data: Prisma.GalleryPhotoUpdateInput = {};
    if (request.imageUrl !== undefined) data.imageUrl = request.imageUrl;
    if (request.caption !== undefined) data.caption = request.caption;
    if (request.order !== undefined) data.order = request.order;

    return await prisma.galleryPhoto.update({
      where: { id },
      data,
    });
  }

  static async deleteGalleryPhoto(id: string) {
    return await prisma.galleryPhoto.delete({
      where: { id },
    });
  }

  // ── Kisah Cinta (Love Story) ─────────────────────────────────────────

  static async addLoveStory(invitationId: string, request: AddLoveStoryReq) {
    return await prisma.loveStory.create({
      data: {
        invitationId,
        yearOrDate: request.yearOrDate,
        title: request.title,
        story: request.story,
        imageUrl: request.imageUrl ?? null,
        order: request.order ?? 0,
      },
    });
  }

  static async findLoveStoryById(id: string, invitationId: string) {
    return await prisma.loveStory.findFirst({
      where: { id, invitationId },
    });
  }

  static async updateLoveStory(id: string, request: UpdateLoveStoryReq) {
    const data: Prisma.LoveStoryUpdateInput = {};
    if (request.yearOrDate !== undefined) data.yearOrDate = request.yearOrDate;
    if (request.title !== undefined) data.title = request.title;
    if (request.story !== undefined) data.story = request.story;
    if (request.imageUrl !== undefined) data.imageUrl = request.imageUrl;
    if (request.order !== undefined) data.order = request.order;

    return await prisma.loveStory.update({
      where: { id },
      data,
    });
  }

  static async deleteLoveStory(id: string) {
    return await prisma.loveStory.delete({
      where: { id },
    });
  }

  // ── Admin Moderation & Overview ─────────────────────────────────────

  static async findManyWithFilterForAdmin(params: AdminInvitationFilterParams) {
    const where: Prisma.InvitationWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.eventCategory) {
      where.eventCategory = params.eventCategory;
    }

    if (params.search && params.search.trim()) {
      const searchTerm = params.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { slug: { contains: searchTerm, mode: "insensitive" } },
        { owner: { fullName: { contains: searchTerm, mode: "insensitive" } } },
        { owner: { email: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    const [total, invitations] = await Promise.all([
      prisma.invitation.count({ where }),
      prisma.invitation.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              planTier: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
              slug: true,
              previewImageUrl: true,
            },
          },
          _count: {
            select: {
              guests: true,
              rsvps: true,
            },
          },
        },
      }),
    ]);

    return { total, invitations };
  }

  static async findByIdForAdmin(id: string) {
    return await prisma.invitation.findUnique({
      where: { id },
      include: {
        ...includeRelations,
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            planTier: true,
          },
        },
        _count: {
          select: {
            guests: true,
            rsvps: true,
          },
        },
      },
    });
  }

  static async updateStatusByAdmin(id: string, status: InvitationStatusType, publishedAt?: Date | null) {
    const data: Prisma.InvitationUncheckedUpdateInput = { status };
    if (publishedAt !== undefined) {
      data.publishedAt = publishedAt;
    }

    return await prisma.invitation.update({
      where: { id },
      data,
      include: includeRelations,
    });
  }
}

export interface AdminInvitationFilterParams {
  page: number;
  limit: number;
  search?: string | undefined;
  status?: InvitationStatusType | undefined;
  eventCategory?: EventCategory | undefined;
}
