import { describe, expect, it } from "vitest";
import { canUseSequenceActions, createStoryCards, exportFilename, exportStyleConfig, moveCard, sequenceSnapshot, updateCard, visualStyleSnapshot } from "../client/src/lib/storySequence";

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

  it("serializes visual styles with bounded gradient and opacity values", () => {
    expect(visualStyleSnapshot({ textTreatment: "blur", textColor: "#fff", gradientStart: "#111111", gradientEnd: "#8da28f", gradientAngle: 480, overlayOpacity: 140, textSize: "large", textAlign: "center", radius: "round", panelPaddingX: 36, panelPaddingY: 32, glassOpacity: 60, blurStrength: 30, borderOpacity: 55, shadowStrength: 44, lineHeight: 1.25, letterSpacing: 0.02, panelWidth: 92, panelOffsetX: 6, panelOffsetY: -12 })).toMatchObject({ textTreatment: "blur", textColor: "#fff", gradient: { start: "#111111", end: "#8da28f", angle: 360 }, overlayOpacity: 100, textSize: "large", textAlign: "center", radius: "round", panelPaddingX: 36, panelPaddingY: 32, glassOpacity: 60, blurStrength: 30, borderOpacity: 55, shadowStrength: 44, lineHeight: 1.25, letterSpacing: 0.02, panelWidth: 92, panelOffsetX: 6, panelOffsetY: -12 });
  });

  it("builds the exact export style configuration used by the canvas renderer", () => {
    expect(exportStyleConfig({ textTreatment: "blur", textColor: "#f8e7c9", gradientStart: "#18231f", gradientEnd: "#8da28f", gradientAngle: 270, overlayOpacity: 70, textSize: "large", textAlign: "center", radius: "round", panelPaddingX: 28, panelPaddingY: 22, glassOpacity: 40, blurStrength: 24, borderOpacity: 35, shadowStrength: 30, lineHeight: 1.1, letterSpacing: -0.02, panelWidth: 76, panelOffsetX: 4, panelOffsetY: -10 })).toEqual({ treatment: "blur", textColor: "#f8e7c9", gradient: { start: "#18231f", end: "#8da28f", angle: 270 }, overlayAlpha: 0.7, align: "center", radius: "round", headlineScale: 1.18, paddingX: 28, paddingY: 22, glassOpacity: 40, blurStrength: 24, borderOpacity: 35, shadowStrength: 30, lineHeight: 1.1, letterSpacing: -0.02, panelWidth: 76, offsetX: 4, offsetY: -10 });
  });
});
