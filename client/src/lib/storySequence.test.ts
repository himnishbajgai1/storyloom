import { describe, expect, it } from "vitest";
import { moveCard, sequenceSnapshot, updateCard } from "./storySequence";

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
});
