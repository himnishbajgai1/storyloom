import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} as TrpcContext;

describe("story.generateCopy", () => {
  it("rejects empty image payloads before calling the model", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.story.generateCopy({ imageDataUrl: "", tone: "warm", cardNumber: 1 })).rejects.toThrow();
  });
});
