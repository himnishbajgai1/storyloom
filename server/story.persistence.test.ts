import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ createStorySequence: vi.fn(), getStorySequencesByUserId: vi.fn() }));
vi.mock("./db", () => mocks);
const { createStorySequence, getStorySequencesByUserId } = mocks;

import { appRouter } from "./routers";

const anonymousContext = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} as TrpcContext;

const authenticatedContext = {
  user: {
    id: 7,
    openId: "creator-7",
    email: "creator@example.com",
    name: "Creator",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} as TrpcContext;

describe("story persistence access", () => {
  it("requires authentication to save a sequence", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.story.save({ name: "My story", cards: [{ id: "1" }] })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication to list personal sequences", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.story.listMine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("saves with the signed-in user id and returns the created id", async () => {
    createStorySequence.mockResolvedValueOnce(42);
    const caller = appRouter.createCaller(authenticatedContext);
    const result = await caller.story.save({ name: "My story", cards: [{ id: "1", headline: "Hello", showBadge: false, showCta: true, showRole: false, badgeColor: "#ff7a59", ctaColor: "#123456", roleColor: "#e7f0d0" }] });
    expect(result).toEqual({ id: 42, name: "My story" });
    expect(createStorySequence).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, name: "My story", cardsJson: JSON.stringify([{ id: "1", headline: "Hello", showBadge: false, showCta: true, showRole: false, badgeColor: "#ff7a59", ctaColor: "#123456", roleColor: "#e7f0d0" }]) }));
  });

  it("lists and parses only the signed-in user’s stored cards", async () => {
    getStorySequencesByUserId.mockResolvedValueOnce([{ id: 42, userId: 7, name: "My story", cardsJson: JSON.stringify([{ id: "1", showBadge: false, showCta: true, showRole: false, badgeColor: "#ff7a59", ctaColor: "#123456", roleColor: "#e7f0d0" }]), createdAt: new Date(), updatedAt: new Date() }]);
    const caller = appRouter.createCaller(authenticatedContext);
    const result = await caller.story.listMine();
    expect(getStorySequencesByUserId).toHaveBeenCalledWith(7);
    expect(result[0]?.cards).toEqual([{ id: "1", showBadge: false, showCta: true, showRole: false, badgeColor: "#ff7a59", ctaColor: "#123456", roleColor: "#e7f0d0" }]);
  });
});
