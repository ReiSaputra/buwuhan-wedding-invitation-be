import { describe, it, expect } from "vitest";
import { checkQuota, PLAN_QUOTA } from "./plan-quota";
import { QuotaExceededError } from "../errors/app.error";

describe("Plan Quota System", () => {
  describe("PLAN_QUOTA definitions", () => {
    it("should have correct limits for FREE tier", () => {
      expect(PLAN_QUOTA.FREE.maxActiveInvitations).toBe(1);
      expect(PLAN_QUOTA.FREE.maxGuestsPerInvitation).toBe(50);
      expect(PLAN_QUOTA.FREE.maxGalleryPhotos).toBe(10);
    });

    it("should have correct limits for PRO tier", () => {
      expect(PLAN_QUOTA.PRO.maxActiveInvitations).toBe(5);
      expect(PLAN_QUOTA.PRO.maxGuestsPerInvitation).toBe(500);
      expect(PLAN_QUOTA.PRO.maxGalleryPhotos).toBe(50);
    });

    it("should have unlimited (-1) for MAX tier", () => {
      expect(PLAN_QUOTA.MAX.maxActiveInvitations).toBe(-1);
      expect(PLAN_QUOTA.MAX.maxGuestsPerInvitation).toBe(-1);
      expect(PLAN_QUOTA.MAX.maxGalleryPhotos).toBe(-1);
    });
  });

  describe("checkQuota helper", () => {
    it("should pass when current usage is below limit", () => {
      expect(() => checkQuota(0, 1, "undangan aktif")).not.toThrow();
      expect(() => checkQuota(49, 50, "tamu")).not.toThrow();
    });

    it("should throw QuotaExceededError when current usage reaches or exceeds limit", () => {
      expect(() => checkQuota(1, 1, "undangan aktif")).toThrow(QuotaExceededError);
      expect(() => checkQuota(50, 50, "tamu")).toThrow(QuotaExceededError);
      expect(() => checkQuota(51, 50, "tamu")).toThrow(QuotaExceededError);
    });

    it("should provide an informative 403 error message", () => {
      try {
        checkQuota(1, 1, "undangan aktif");
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe("QUOTA_EXCEEDED");
        expect(err.message).toBe("Paket kamu hanya mengizinkan 1 undangan aktif");
      }
    });

    it("should never throw when max is -1 (unlimited)", () => {
      expect(() => checkQuota(1000000, -1, "undangan aktif")).not.toThrow();
      expect(() => checkQuota(9999999, -1, "tamu")).not.toThrow();
    });
  });
});
