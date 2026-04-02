import { describe, it, expect, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireApiKeyWhenConfigured } from "./apiKey";

function mockRes(): Response & { statusCode: number; body: unknown } {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(n: number) {
      res.statusCode = n;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
  };
  return res as Response & { statusCode: number; body: unknown };
}

describe("requireApiKeyWhenConfigured", () => {
  const prev = process.env.SOLI_DM_API_KEY;

  afterEach(() => {
    if (prev === undefined) delete process.env.SOLI_DM_API_KEY;
    else process.env.SOLI_DM_API_KEY = prev;
  });

  it("calls next when SOLI_DM_API_KEY is unset", () => {
    delete process.env.SOLI_DM_API_KEY;
    let called = false;
    const next: NextFunction = () => {
      called = true;
    };
    requireApiKeyWhenConfigured(
      { headers: {} } as Request,
      mockRes(),
      next
    );
    expect(called).toBe(true);
  });

  it("returns 401 when key configured but header missing", () => {
    process.env.SOLI_DM_API_KEY = "secret";
    const res = mockRes();
    let nextCalled = false;
    requireApiKeyWhenConfigured(
      { headers: {} } as Request,
      res,
      () => {
        nextCalled = true;
      }
    );
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
    expect((res.body as { error?: string }).error).toMatch(/Unauthorized/);
  });

  it("accepts x-soli-dm-api-key", () => {
    process.env.SOLI_DM_API_KEY = "secret";
    let called = false;
    requireApiKeyWhenConfigured(
      {
        headers: { "x-soli-dm-api-key": "secret" },
      } as unknown as Request,
      mockRes(),
      () => {
        called = true;
      }
    );
    expect(called).toBe(true);
  });

  it("accepts Authorization Bearer", () => {
    process.env.SOLI_DM_API_KEY = "tok";
    let called = false;
    requireApiKeyWhenConfigured(
      {
        headers: { authorization: "Bearer tok" },
      } as unknown as Request,
      mockRes(),
      () => {
        called = true;
      }
    );
    expect(called).toBe(true);
  });
});
