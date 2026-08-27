import type { Couple, GalleryPhoto, Invitation, InvitationStatus, LoveStory, Prisma, Template } from "../../generated/prisma/client";

export type InvitationWithRelations = Invitation & {
  couples: Couple[];
  template: Template | null;
  galleryPhotos: GalleryPhoto[];
  loveStories: LoveStory[];
};

export type CoupleType = "BRIDE" | "GROOM";
export type InvitationStatusType = "DRAFT" | "ACTIVE" | "COMPLETED";

export interface CoupleInput {
  type: CoupleType;
  name: string;
  fatherName: string;
  motherName: string;
}

export interface CreateInvitationReq {
  title: string;
  slug: string;
  couples: CoupleInput[];
  eventDate?: Date | string | undefined;
  eventTime?: string | undefined;
  venue?: string | undefined;
  address?: string | undefined;
  additionalInfo?: Prisma.InputJsonValue | undefined;
  templateId?: string | undefined;
}

export interface UpdateInvitationReq {
  title?: string | undefined;
  slug?: string | undefined;
  couples?: CoupleInput[] | undefined;
  eventDate?: Date | string | null | undefined;
  eventTime?: string | null | undefined;
  venue?: string | null | undefined;
  address?: string | null | undefined;
  additionalInfo?: Prisma.InputJsonValue | undefined;
  templateId?: string | undefined;
}

export interface UpdateInvitationStatusReq {
  status: InvitationStatusType;
}

export interface AddGalleryPhotoReq {
  imageUrl: string;
  caption?: string | null | undefined;
  order?: number | undefined;
}

export interface UpdateGalleryPhotoReq {
  imageUrl?: string | undefined;
  caption?: string | null | undefined;
  order?: number | undefined;
}

export interface AddLoveStoryReq {
  yearOrDate: string;
  title: string;
  story: string;
  imageUrl?: string | null | undefined;
  order?: number | undefined;
}

export interface UpdateLoveStoryReq {
  yearOrDate?: string | undefined;
  title?: string | undefined;
  story?: string | undefined;
  imageUrl?: string | null | undefined;
  order?: number | undefined;
}

export interface GalleryPhotoData {
  id: string;
  imageUrl: string;
  caption: string | null;
  order: number;
  createdAt: Date;
}

export interface LoveStoryData {
  id: string;
  yearOrDate: string;
  title: string;
  story: string;
  imageUrl: string | null;
  order: number;
  createdAt: Date;
}

export interface InvitationData {
  id: string;
  title: string;
  slug: string;
  status: InvitationStatusType;
  publishedAt: Date | null;
  eventDate: Date | null;
  eventTime: string | null;
  venue: string | null;
  address: string | null;
  additionalInfo: unknown;
  couples: {
    type: string;
    name: string;
    fatherName: string;
    motherName: string;
  }[];
  template: {
    id: string;
    name: string;
    slug: string;
  } | null;
  galleryPhotos: GalleryPhotoData[];
  loveStories: LoveStoryData[];
}

export interface CreateInvitationRes {
  message: string;
  status: number;
  data: InvitationData;
}

export interface GetInvitationRes {
  message: string;
  status: number;
  data: InvitationData;
}

export interface ListInvitationRes {
  message: string;
  status: number;
  data: InvitationData[];
}

export interface UpdateInvitationRes {
  message: string;
  status: number;
  data: InvitationData;
}

export interface UpdateInvitationStatusRes {
  message: string;
  status: number;
  data: InvitationData;
}

export interface DeleteInvitationRes {
  message: string;
  status: number;
}

export interface GalleryPhotoRes {
  message: string;
  status: number;
  data: GalleryPhotoData;
}

export interface LoveStoryRes {
  message: string;
  status: number;
  data: LoveStoryData;
}

export function toInvitationData(invitation: InvitationWithRelations): InvitationData {
  return {
    id: invitation.id,
    title: invitation.title,
    slug: invitation.slug,
    status: invitation.status as InvitationStatusType,
    publishedAt: invitation.publishedAt,
    eventDate: invitation.eventDate,
    eventTime: invitation.eventTime,
    venue: invitation.venue,
    address: invitation.address,
    additionalInfo: invitation.additionalInfo,
    couples: (invitation.couples ?? []).map((c) => ({
      type: c.type,
      name: c.name,
      fatherName: c.fatherName,
      motherName: c.motherName,
    })),
    template: invitation.template
      ? {
          id: invitation.template.id,
          name: invitation.template.name,
          slug: invitation.template.slug,
        }
      : null,
    galleryPhotos: (invitation.galleryPhotos ?? []).map((g) => ({
      id: g.id,
      imageUrl: g.imageUrl,
      caption: g.caption,
      order: g.order,
      createdAt: g.createdAt,
    })),
    loveStories: (invitation.loveStories ?? []).map((s) => ({
      id: s.id,
      yearOrDate: s.yearOrDate,
      title: s.title,
      story: s.story,
      imageUrl: s.imageUrl,
      order: s.order,
      createdAt: s.createdAt,
    })),
  };
}

export function createInvitationResponse(invitation: InvitationWithRelations): CreateInvitationRes {
  return {
    message: "Undangan berhasil dibuat",
    status: 201,
    data: toInvitationData(invitation),
  };
}

export function getInvitationResponse(invitation: InvitationWithRelations): GetInvitationRes {
  return {
    message: "Undangan ditemukan",
    status: 200,
    data: toInvitationData(invitation),
  };
}

export function listInvitationResponse(invitations: InvitationWithRelations[]): ListInvitationRes {
  return {
    message: "Daftar undangan berhasil diambil",
    status: 200,
    data: invitations.map(toInvitationData),
  };
}

export function updateInvitationResponse(invitation: InvitationWithRelations): UpdateInvitationRes {
  return {
    message: "Undangan berhasil diperbarui",
    status: 200,
    data: toInvitationData(invitation),
  };
}

export function updateInvitationStatusResponse(invitation: InvitationWithRelations): UpdateInvitationStatusRes {
  return {
    message: "Status undangan berhasil diperbarui",
    status: 200,
    data: toInvitationData(invitation),
  };
}

export function deleteInvitationResponse(): DeleteInvitationRes {
  return {
    message: "Undangan berhasil dihapus",
    status: 200,
  };
}

export function galleryPhotoResponse(photo: GalleryPhoto, message = "Foto galeri berhasil disimpan", status = 200): GalleryPhotoRes {
  return {
    message,
    status,
    data: {
      id: photo.id,
      imageUrl: photo.imageUrl,
      caption: photo.caption,
      order: photo.order,
      createdAt: photo.createdAt,
    },
  };
}

export function loveStoryResponse(story: LoveStory, message = "Kisah cinta berhasil disimpan", status = 200): LoveStoryRes {
  return {
    message,
    status,
    data: {
      id: story.id,
      yearOrDate: story.yearOrDate,
      title: story.title,
      story: story.story,
      imageUrl: story.imageUrl,
      order: story.order,
      createdAt: story.createdAt,
    },
  };
}
