import { describe, expect, it } from "vitest";
import { canUseSequenceActions, createStoryCards, exportFilename, moveCard, sequenceSnapshot, updateCard } from "../client/src/lib/storySequence";

describe("story sequence utilities", () => {
  const cards = [{ id: "a", headline: "A" }, { id: "b", headline: "B" }, { id: "c", headline: "C" }];

  it("moves a card without mutating the original sequence", () => {
    expect(moveCard(cards, 1, -1).map(card => card.id)).toEqual(["b", "a", "c"]);
    expect(cards.map(card => card.id)).toEqual(["a", "b", "c"]);
    expect(moveCard(cards, 0, -1)).toBe(cards);
  });

  it("updates only the selected card", () => {
    expect(updateCard(cards, "b", { headline: "Edited" })).toEqual([
      { id: "a", headline: "A" },
      { id: "b", headline: "Edited" },
      { id: "c", headline: "C" },
    ]);
  });

  it("normalizes untitled sequence names and preserves card count", () => {
    expect(sequenceSnapshot("  ", cards)).toMatchObject({ name: "Untitled sequence", cardCount: 3 });
    expect(sequenceSnapshot(" Summer notes ", cards).name).toBe("Summer notes");
  });

  it("creates safe filenames for individual card exports", () => {
    expect(exportFilename(" Morning / notes ")).toBe("morning-notes.png");
    expect(exportFilename("", "jpg")).toBe("story-card.jpg");
  });

  it("keeps save and export unavailable until photos exist", () => {
    expect(canUseSequenceActions(0)).toBe(false);
    expect(canUseSequenceActions(1)).toBe(true);
  });

  it("creates generated copy for uploaded cards only when a goal is supplied", async () => {
    const uploaded = [{ id: "photo-1", headline: "Add your story goal" }];
    const generated = await createStoryCards(uploaded, "book more calls", async (card, goal) => ({ headline: `${goal}: ${card.id}` }));
    expect(generated[0]?.headline).toBe("book more calls: photo-1");
    await expect(createStoryCards(uploaded, "", async () => ({ headline: "should not run" }))).rejects.toThrow("story goal");
  });
});
