import { describe, expect, it, vi } from "vitest";

const { invokeLLM } = vi.hoisted(() => ({ invokeLLM: vi.fn(async () => ({ choices: [{ message: { content: JSON.stringify({ headline: "Make the next move", caption: "A clear path from idea to action.", kicker: "THE METHOD" }) } }] })) }));
vi.mock("./_core/llm", () => ({ invokeLLM }));
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
    await expect(caller.story.generateCopy({ imageDataUrl: "", tone: "warm", goal: "book calls", cardNumber: 1 })).rejects.toThrow();
  });

  it("forwards valid role and preset context into the AI prompt", async () => {
    const caller = appRouter.createCaller(ctx);
    await caller.story.generateCopy({ imageDataUrl: "data:image/jpeg;base64,abc", tone: "warm", goal: "book calls", cardNumber: 3, role: "mechanism", sequencePreset: "launch" });
    const call = invokeLLM.mock.calls.at(-1)?.[0] as { messages: Array<{ content: unknown }> };
    const userMessage = call.messages[1].content as Array<{ type: string; text?: string }>;
    expect(userMessage[0]?.text).toContain("launch sequence");
    expect(userMessage[0]?.text).toContain("narrative role is mechanism");
  });

  it("rejects unsupported sequence roles before calling the model", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.story.generateCopy({ imageDataUrl: "data:image/jpeg;base64,abc", tone: "warm", goal: "book calls", cardNumber: 1, role: "unsupported" as "hook" })).rejects.toThrow();
  });

  it("requires a product or story goal before calling the model", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.story.generateCopy({ imageDataUrl: "data:image/jpeg;base64,abc", tone: "warm", goal: "", cardNumber: 1 })).rejects.toThrow();
  });
});
