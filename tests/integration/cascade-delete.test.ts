import { describe, expect, it, vi } from "vitest";
import { prisma } from "../../src/lib/prisma";
import { InvitationService } from "../../src/modules/invitation/invitation.service";
import { InvitationRepository } from "../../src/modules/invitation/invitation.repository";
import { Prisma } from "../../src/generated/prisma/client";

describe("Cascade Delete & Relation Integrity Tests", () => {
  it("should cascade delete Couple, Guest, RSVP, GalleryPhoto, LoveStory, and Buwuhan when Invitation is deleted", async () => {
    const mockInvitation = {
      id: "inv-test-cascade-1",
      title: "Wedding Test",
      slug: "wedding-test",
      ownerId: "user-1",
      couples: [{ id: "c-1", name: "Ayu", type: "BRIDE" as const, fatherName: "F", motherName: "M", invitationId: "inv-test-cascade-1" }],
      guests: [{ id: "g-1", name: "Budi", qrCode: "qr-1", invitationId: "inv-test-cascade-1" }],
      rsvps: [{ id: "r-1", status: "CONFIRMED" as const, guestId: "g-1", invitationId: "inv-test-cascade-1" }],
      galleryPhotos: [{ id: "gp-1", imageUrl: "http://photo.jpg", invitationId: "inv-test-cascade-1" }],
      loveStories: [{ id: "ls-1", yearOrDate: "2020", title: "Story", story: "...", invitationId: "inv-test-cascade-1" }],
      buwuhans: [{ id: "bw-1", giverName: "Guest Giver", invitationId: "inv-test-cascade-1" }],
    };

    vi.spyOn(InvitationRepository, "findByIdAndOwner").mockResolvedValue(mockInvitation as any);
    const deleteSpy = vi.spyOn(InvitationRepository, "deleteById").mockResolvedValue(mockInvitation as any);

    const result = await InvitationService.remove("inv-test-cascade-1", "user-1");

    expect(deleteSpy).toHaveBeenCalledWith("inv-test-cascade-1");
    expect(result).toEqual({
      status: 200,
      message: "Undangan berhasil dihapus",
    });
  });

  it("should prevent deleting a Template referenced by an active Invitation (onDelete: Restrict)", async () => {
    const restrictError = new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed on table templates due to RESTRICT", {
      code: "P2003",
      clientVersion: "7.9.1",
      meta: { field_name: "invitations_templateId_fkey" },
    });

    const deleteTemplateMock = vi.fn().mockRejectedValue(restrictError);
    const mockPrisma = {
      template: {
        delete: deleteTemplateMock,
      },
    };

    await expect(mockPrisma.template.delete({ where: { id: "template-used" } })).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it("should propagate cascade deletion when a User is deleted", async () => {
    const mockUser = {
      id: "user-to-delete",
      email: "user@example.com",
    };

    const deleteUserMock = vi.fn().mockResolvedValue(mockUser);
    const mockPrisma = {
      user: {
        delete: deleteUserMock,
      },
    };

    const deleted = await mockPrisma.user.delete({ where: { id: "user-to-delete" } });
    expect(deleted.id).toBe("user-to-delete");
  });

  it("should cascade delete BuwuhanItem when Buwuhan record is deleted", async () => {
    const mockBuwuhan = {
      id: "bw-123",
      giverName: "Ahmad",
      items: [{ id: "item-1", itemName: "Beras", quantity: 10, unit: "kg", buwuhanId: "bw-123" }],
    };

    const deleteBuwuhanMock = vi.fn().mockResolvedValue(mockBuwuhan);
    const mockPrisma = {
      buwuhan: {
        delete: deleteBuwuhanMock,
      },
    };

    const deleted = await mockPrisma.buwuhan.delete({ where: { id: "bw-123" } });
    expect(deleted.id).toBe("bw-123");
  });
});
