import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { errorHandler } from "../../src/middlewares/error.middleware";
import { AppError, NotFoundError, ConflictError } from "../../src/errors/app.error";
import { Prisma } from "../../src/generated/prisma/client";
import { logger } from "../../src/utils/log";

describe("Error Middleware Unit Tests", () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  };

  const mockReq = {} as Request;
  const mockNext = vi.fn() as NextFunction;

  it("should handle ZodError and return 400", () => {
    const res = createMockResponse();
    const schema = z.object({ email: z.string().email() });
    let zodError: ZodError | null = null;
    try {
      schema.parse({ email: "invalid-email" });
    } catch (err) {
      zodError = err as ZodError;
    }

    errorHandler(zodError!, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  it("should handle AppError subclasses and return their custom status code and message", () => {
    const res = createMockResponse();
    const appError = new NotFoundError("Data tidak ditemukan");

    errorHandler(appError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Data tidak ditemukan",
    });
  });

  it("should map Prisma P2002 (Unique constraint) to 409 Conflict", () => {
    const res = createMockResponse();
    const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);
    const prismaError = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "7.9.1",
    });

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Data dengan nilai tersebut sudah ada",
    });
    expect(loggerSpy).toHaveBeenCalled();
  });

  it("should map Prisma P2003 (Foreign key constraint) to 409 Conflict", () => {
    const res = createMockResponse();
    const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);
    const prismaError = new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
      code: "P2003",
      clientVersion: "7.9.1",
    });

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Data ini masih terhubung dengan data lain sehingga tidak bisa dihapus",
    });
    expect(loggerSpy).toHaveBeenCalled();
  });

  it("should map Prisma P2014 (Relation violation) to 409 Conflict", () => {
    const res = createMockResponse();
    const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);
    const prismaError = new Prisma.PrismaClientKnownRequestError("Required relation violation", {
      code: "P2014",
      clientVersion: "7.9.1",
    });

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Data ini masih terhubung dengan data lain sehingga tidak bisa dihapus",
    });
    expect(loggerSpy).toHaveBeenCalled();
  });

  it("should map Prisma P2025 (Record not found) to 404 Not Found", () => {
    const res = createMockResponse();
    const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);
    const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "7.9.1",
    });

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Data tidak ditemukan",
    });
    expect(loggerSpy).toHaveBeenCalled();
  });

  it("should fall back to 500 for unhandled Prisma error codes without leaking sensitive details", () => {
    const res = createMockResponse();
    const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);
    const prismaError = new Prisma.PrismaClientKnownRequestError("Unhandled database engine error", {
      code: "P5000",
      clientVersion: "7.9.1",
    });

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
    expect(loggerSpy).toHaveBeenCalled();
  });

  it("should return 500 for generic unexpected errors", () => {
    const res = createMockResponse();
    const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);
    const genericError = new Error("Something went wrong");

    errorHandler(genericError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
    expect(loggerSpy).toHaveBeenCalled();
  });
});
