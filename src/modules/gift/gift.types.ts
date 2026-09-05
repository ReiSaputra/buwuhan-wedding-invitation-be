export type GiftMethodType = "CASH" | "TRANSFER" | "EWALLET";

export interface GiftAccountData {
  id: string;
  invitationId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGiftAccountReq {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type?: string | undefined;
  order?: number | undefined;
}

export interface UpdateGiftAccountReq {
  bankName?: string | undefined;
  accountNumber?: string | undefined;
  accountHolder?: string | undefined;
  type?: string | undefined;
  order?: number | undefined;
}

export interface CreateGiftAccountRes {
  message: string;
  status: number;
  data: GiftAccountData;
}

export interface ListGiftAccountRes {
  message: string;
  status: number;
  data: GiftAccountData[];
}

export interface UpdateGiftAccountRes {
  message: string;
  status: number;
  data: GiftAccountData;
}

export interface DeleteGiftAccountRes {
  message: string;
  status: number;
  data: null;
}

export interface GiftData {
  id: string;
  invitationId: string;
  giverName: string;
  amount: number;
  method: GiftMethodType;
  note: string | null;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGiftReq {
  giverName: string;
  amount: number;
  method?: GiftMethodType | undefined;
  note?: string | null | undefined;
  receivedAt?: Date | string | undefined;
}

export interface UpdateGiftReq {
  giverName?: string | undefined;
  amount?: number | undefined;
  method?: GiftMethodType | undefined;
  note?: string | null | undefined;
  receivedAt?: Date | string | undefined;
}

export interface MethodBreakdown {
  count: number;
  totalAmount: number;
}

export interface GiftSummaryData {
  totalGifts: number;
  totalAmount: number;
  byMethod: {
    CASH: MethodBreakdown;
    TRANSFER: MethodBreakdown;
    EWALLET: MethodBreakdown;
  };
}

export interface CreateGiftRes {
  message: string;
  status: number;
  data: GiftData;
}

export interface ListGiftRes {
  message: string;
  status: number;
  data: GiftData[];
}

export interface GetGiftSummaryRes {
  message: string;
  status: number;
  data: GiftSummaryData;
}

export interface UpdateGiftRes {
  message: string;
  status: number;
  data: GiftData;
}

export interface DeleteGiftRes {
  message: string;
  status: number;
  data: null;
}

// Helper response formatting
export function toGiftAccountData(account: { id: string; invitationId: string; bankName: string; accountNumber: string; accountHolder: string; type: string; order: number; createdAt: Date; updatedAt: Date }): GiftAccountData {
  return {
    id: account.id,
    invitationId: account.invitationId,
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    accountHolder: account.accountHolder,
    type: account.type,
    order: account.order,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

function toNumeric(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof (val as { toNumber?: () => number }).toNumber === "function") {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

export function toGiftData(gift: { id: string; invitationId: string; giverName: string; amount: unknown; method: string; note: string | null; receivedAt: Date; createdAt: Date; updatedAt: Date }): GiftData {
  return {
    id: gift.id,
    invitationId: gift.invitationId,
    giverName: gift.giverName,
    amount: toNumeric(gift.amount),
    method: gift.method as GiftMethodType,
    note: gift.note,
    receivedAt: gift.receivedAt,
    createdAt: gift.createdAt,
    updatedAt: gift.updatedAt,
  };
}

export function createGiftAccountResponse(account: Parameters<typeof toGiftAccountData>[0]): CreateGiftAccountRes {
  return {
    message: "Rekening hadiah berhasil ditambahkan",
    status: 201,
    data: toGiftAccountData(account),
  };
}

export function listGiftAccountResponse(accounts: Parameters<typeof toGiftAccountData>[0][]): ListGiftAccountRes {
  return {
    message: "Daftar rekening hadiah berhasil diambil",
    status: 200,
    data: accounts.map(toGiftAccountData),
  };
}

export function updateGiftAccountResponse(account: Parameters<typeof toGiftAccountData>[0]): UpdateGiftAccountRes {
  return {
    message: "Rekening hadiah berhasil diperbarui",
    status: 200,
    data: toGiftAccountData(account),
  };
}

export function deleteGiftAccountResponse(): DeleteGiftAccountRes {
  return {
    message: "Rekening hadiah berhasil dihapus",
    status: 200,
    data: null,
  };
}

export function createGiftResponse(gift: Parameters<typeof toGiftData>[0]): CreateGiftRes {
  return {
    message: "Catatan hadiah berhasil ditambahkan",
    status: 201,
    data: toGiftData(gift),
  };
}

export function listGiftResponse(gifts: Parameters<typeof toGiftData>[0][]): ListGiftRes {
  return {
    message: "Daftar hadiah berhasil diambil",
    status: 200,
    data: gifts.map(toGiftData),
  };
}

export function getGiftSummaryResponse(summary: GiftSummaryData): GetGiftSummaryRes {
  return {
    message: "Ringkasan hadiah berhasil diambil",
    status: 200,
    data: summary,
  };
}

export function updateGiftResponse(gift: Parameters<typeof toGiftData>[0]): UpdateGiftRes {
  return {
    message: "Catatan hadiah berhasil diperbarui",
    status: 200,
    data: toGiftData(gift),
  };
}

export function deleteGiftResponse(): DeleteGiftRes {
  return {
    message: "Catatan hadiah berhasil dihapus",
    status: 200,
    data: null,
  };
}
