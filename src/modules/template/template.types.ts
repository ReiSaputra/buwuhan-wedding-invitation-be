// Taruh file ini di: src/modules/template/template.types.ts

import type { EventCategory, PlanTier, Template } from "../../generated/prisma/client";

// urutan rank tier -- dipakai buat bandingin "cukup tier atau tidak".
// FREE=0, PRO=1, MAX=2. Kalau nanti ada tier baru, tinggal tambah di sini.
const PLAN_TIER_RANK: Record<PlanTier, number> = {
  FREE: 0,
  PRO: 1,
  MAX: 2,
};

export function isTierSufficient(userTier: PlanTier, requiredTier: PlanTier): boolean {
  return PLAN_TIER_RANK[userTier] >= PLAN_TIER_RANK[requiredTier];
}

interface CreateTemplateReq {
  name: string;
  slug: string;
  tier: PlanTier;
  eventCategory?: EventCategory;
  previewImageUrl: string;
  isActive?: boolean;
}

interface UpdateTemplateReq {
  name?: string;
  slug?: string;
  tier?: PlanTier;
  eventCategory?: EventCategory;
  previewImageUrl?: string;
  isActive?: boolean;
}

interface TemplateData {
  id: string;
  name: string;
  slug: string;
  tier: PlanTier;
  eventCategory: EventCategory;
  previewImageUrl: string;
  isActive: boolean;
  // dihitung dari planTier user yang request -- true kalau user boleh pakai
  // template ini buat undangannya
  isAccessible: boolean;
}

interface CreateTemplateRes {
  message: string;
  status: number;
  data: TemplateData;
}

interface GetTemplateRes {
  message: string;
  status: number;
  data: TemplateData;
}

interface ListTemplateRes {
  message: string;
  status: number;
  data: TemplateData[];
}

interface UpdateTemplateRes {
  message: string;
  status: number;
  data: TemplateData;
}

interface DeactivateTemplateRes {
  message: string;
  status: number;
}

function toTemplateData(template: Template, userTier: PlanTier): TemplateData {
  return {
    id: template.id,
    name: template.name,
    slug: template.slug,
    tier: template.tier,
    eventCategory: template.eventCategory,
    previewImageUrl: template.previewImageUrl,
    isActive: template.isActive,
    isAccessible: isTierSufficient(userTier, template.tier),
  };
}

function createTemplateResponse(template: Template, requesterTier: PlanTier): CreateTemplateRes {
  return {
    message: "Template berhasil dibuat",
    status: 201,
    data: toTemplateData(template, requesterTier),
  };
}

function getTemplateResponse(template: Template, requesterTier: PlanTier): GetTemplateRes {
  return {
    message: "Template ditemukan",
    status: 200,
    data: toTemplateData(template, requesterTier),
  };
}

function listTemplateResponse(templates: Template[], requesterTier: PlanTier): ListTemplateRes {
  return {
    message: "Daftar template berhasil diambil",
    status: 200,
    data: templates.map((t) => toTemplateData(t, requesterTier)),
  };
}

function updateTemplateResponse(template: Template, requesterTier: PlanTier): UpdateTemplateRes {
  return {
    message: "Template berhasil diperbarui",
    status: 200,
    data: toTemplateData(template, requesterTier),
  };
}

function deactivateTemplateResponse(): DeactivateTemplateRes {
  return {
    message: "Template berhasil dinonaktifkan",
    status: 200,
  };
}

// ── Admin Template Management Types ─────────────────────────────────

export interface AdminTemplateFilterParams {
  isActive?: boolean | undefined;
  tier?: PlanTier | undefined;
  eventCategory?: EventCategory | undefined;
  search?: string | undefined;
}

export interface AdminTemplateListItem {
  id: string;
  name: string;
  slug: string;
  tier: PlanTier;
  eventCategory: EventCategory;
  previewImageUrl: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminTemplateListRes {
  message: string;
  status: number;
  data: AdminTemplateListItem[];
}

export interface RestoreTemplateRes {
  message: string;
  status: number;
  data: TemplateData;
}

export function adminTemplateListResponse(templates: AdminTemplateListItem[]): AdminTemplateListRes {
  return {
    message: "Daftar seluruh template berhasil diambil",
    status: 200,
    data: templates,
  };
}

export function restoreTemplateResponse(template: Template, requesterTier: PlanTier): RestoreTemplateRes {
  return {
    message: "Template berhasil diaktifkan kembali",
    status: 200,
    data: toTemplateData(template, requesterTier),
  };
}

export type {
  CreateTemplateReq,
  UpdateTemplateReq,
  TemplateData,
  CreateTemplateRes,
  GetTemplateRes,
  ListTemplateRes,
  UpdateTemplateRes,
  DeactivateTemplateRes,
};
export {
  createTemplateResponse,
  getTemplateResponse,
  listTemplateResponse,
  updateTemplateResponse,
  deactivateTemplateResponse,
};

