import type { BuwuhanItem } from "../../generated/prisma/client";

// ── Request types ────────────────────────────────────────────────────

export interface BuwuhanItemReq {
  itemName: string;
  quantity: number;
  unit: string;
  category?: string | null;
  estimatedValue?: number | null;
}

export interface CreateBuwuhanReq {
  giverName: string;
  note?: string | null;
  receivedAt?: string;
  items: BuwuhanItemReq[];
}

export interface UpdateBuwuhanReq {
  giverName?: string;
  note?: string | null;
  receivedAt?: string;
  items?: BuwuhanItemReq[];
}

// ── Data / Response types ─────────────────────────────────────────────

export interface BuwuhanItemData {
  id: string;
  buwuhanId: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: string | null;
  estimatedValue: number | null;
  createdAt: Date;
}

export interface BuwuhanData {
  id: string;
  invitationId: string;
  giverName: string;
  note: string | null;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  items: BuwuhanItemData[];
}

export interface TopItemData {
  itemName: string;
  totalQuantity: number;
  unit: string;
}

export interface BuwuhanSummaryData {
  totalItems: number;
  totalTransactions: number;
  totalEstimatedValue: number;
  totalItemsThisMonth: number;
  topItem: TopItemData | null;
}

// ── Response envelopes ────────────────────────────────────────────────

export interface CreateBuwuhanRes {
  message: string;
  status: number;
  data: BuwuhanData;
}

export interface GetBuwuhanRes {
  message: string;
  status: number;
  data: BuwuhanData;
}

export interface ListBuwuhanRes {
  message: string;
  status: number;
  data: BuwuhanData[];
}

export interface UpdateBuwuhanRes {
  message: string;
  status: number;
  data: BuwuhanData;
}

export interface DeleteBuwuhanRes {
  message: string;
  status: number;
}

export interface GetBuwuhanSummaryRes {
  message: string;
  status: number;
  data: BuwuhanSummaryData;
}

// ── Helpers ───────────────────────────────────────────────────────────

function toNumeric(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof (val as { toNumber?: () => number }).toNumber === "function") {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

function toNullableNumeric(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  if (typeof (val as { toNumber?: () => number }).toNumber === "function") {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

export function formatBuwuhanItem(item: BuwuhanItem): BuwuhanItemData {
  return {
    id: item.id,
    buwuhanId: item.buwuhanId,
    itemName: item.itemName,
    quantity: toNumeric(item.quantity),
    unit: item.unit,
    category: item.category,
    estimatedValue: toNullableNumeric(item.estimatedValue),
    createdAt: item.createdAt,
  };
}

export function formatBuwuhan(
  buwuhan: {
    id: string;
    invitationId: string;
    giverName: string;
    note: string | null;
    receivedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    items: BuwuhanItem[];
  }
): BuwuhanData {
  return {
    id: buwuhan.id,
    invitationId: buwuhan.invitationId,
    giverName: buwuhan.giverName,
    note: buwuhan.note,
    receivedAt: buwuhan.receivedAt,
    createdAt: buwuhan.createdAt,
    updatedAt: buwuhan.updatedAt,
    items: buwuhan.items.map(formatBuwuhanItem),
  };
}

export function createBuwuhanResponse(buwuhan: Parameters<typeof formatBuwuhan>[0]): CreateBuwuhanRes {
  return { message: "Catatan buwuh berhasil ditambahkan", status: 201, data: formatBuwuhan(buwuhan) };
}

export function getBuwuhanResponse(buwuhan: Parameters<typeof formatBuwuhan>[0]): GetBuwuhanRes {
  return { message: "Data buwuh berhasil diambil", status: 200, data: formatBuwuhan(buwuhan) };
}

export function listBuwuhanResponse(buwuhans: Parameters<typeof formatBuwuhan>[0][]): ListBuwuhanRes {
  return { message: "Daftar buwuh berhasil diambil", status: 200, data: buwuhans.map(formatBuwuhan) };
}

export function updateBuwuhanResponse(buwuhan: Parameters<typeof formatBuwuhan>[0]): UpdateBuwuhanRes {
  return { message: "Catatan buwuh berhasil diperbarui", status: 200, data: formatBuwuhan(buwuhan) };
}

export function deleteBuwuhanResponse(): DeleteBuwuhanRes {
  return { message: "Catatan buwuh berhasil dihapus", status: 200 };
}

export function getBuwuhanSummaryResponse(summary: BuwuhanSummaryData): GetBuwuhanSummaryRes {
  return { message: "Ringkasan buwuh berhasil diambil", status: 200, data: summary };
}
