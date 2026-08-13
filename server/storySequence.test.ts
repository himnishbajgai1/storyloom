import { describe, expect, it } from "vitest";
import { canUseSequenceActions, copyableCardStyle, createStoryCards, exportCardConfig, exportCropRect, clampPanelDrag, normalizeCardVisibility, roleForCard, sequenceRoleOrder, visualPresetStyle, exportCardRenderPlan, exportFilename, exportMetadata, exportRenderPlan, exportStyleConfig, fitTextScale, moveCard, safePanelLayout, shouldDrawTextPanel, storyPanelAnchor, sequenceSnapshot, updateCard, visualStyleSnapshot } from "../client/src/lib/storySequence";

describe("story sequence utilities", () => {
  const cards = [{ id: "a", headline: "A" }, { id: "b", headline: "B" }, { id: "c", headline: "C" }];

  it("clamps direct canvas drag offsets to the safe editor bounds", () => {
    expect(clampPanelDrag(30, -100)).toEqual({ offsetX: 8, offsetY: -40 });
    expect(clampPanelDrag(-4, 18)).toEqual({ offsetX: -4, offsetY: 18 });
  });

  it("provides distinct luxury, bold, and minimal visual preset contracts", () => {
    expect(visualPresetStyle("luxury").textTreatment).toBe("blur");
    expect(visualPresetStyle("bold").fontFamily).toBe("grotesk");
    expect(visualPresetStyle("minimal").textTreatment).toBe("plain");
  });

  it("maps conversion and launch presets to deterministic narrative roles", () => {
    expect(sequenceRoleOrder("conversion")).toEqual(["hook", "problem", "mechanism", "proof", "cta"]);
    expect(sequenceRoleOrder("launch")).toEqual(["hook", "mechanism", "proof", "problem", "cta"]);
    expect(roleForCard("launch", 2)).toBe("proof");
    expect(roleForCard("conversion", 99)).toBe("cta");
  });

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

  it("preserves the story crop aspect ratio and bounds focal positioning", () => {
    const crop = exportCropRect(1080, 1920, 1.35, 85, 15);
    expect(crop.sourceWidth / crop.sourceHeight).toBeCloseTo(9 / 16, 5);
    expect(crop.sourceX).toBeGreaterThanOrEqual(0);
    expect(crop.sourceY).toBeGreaterThanOrEqual(0);
    expect(crop.sourceX + crop.sourceWidth).toBeLessThanOrEqual(1080);
    expect(crop.sourceY + crop.sourceHeight).toBeLessThanOrEqual(1920);
  });

  it("exposes fitted line metadata for export text flow", () => {
    const config = exportCardConfig({ headline: "A headline long enough to wrap across multiple lines", caption: "A longer caption that should remain readable inside the card panel.", placement: "bottom", textScale: 58 } as any);
    expect(config.headlineLines).toBeGreaterThanOrEqual(1);
    expect(config.captionLines).toBeGreaterThanOrEqual(1);
    expect(config.panel.height).toBeGreaterThan(0);
  });

  it("normalizes saved cards for the editor reopen path", () => {
    expect(normalizeCardVisibility({ id: "legacy" })).toMatchObject({ showBadge: true, showCta: true, showRole: true });
    expect(normalizeCardVisibility({ id: "saved", showBadge: false, showCta: true, showRole: false })).toMatchObject({ showBadge: false, showCta: true, showRole: false });
  });

  it("preserves element visibility flags in saved sequence snapshots", () => {
    const snapshot = sequenceSnapshot("Preset test", [{ id: "a", showBadge: false, showCta: true, showRole: false }]);
    expect(snapshot.cards).toEqual([{ id: "a", showBadge: false, showCta: true, showRole: false }]);
  });

  it("serializes a visual preset through the shared style contract", () => {
    const preset = visualPresetStyle("luxury");
    expect(visualStyleSnapshot(preset as any)).toMatchObject({ fontFamily: "editorial", textTreatment: "blur", textColor: "#f8e7c9", panelPaddingX: 22, panelPaddingY: 20 });
  });

  it("normalizes untitled sequence names and preserves card count", () => {
    expect(sequenceSnapshot("  ", cards)).toMatchObject({ name: "Untitled sequence", cardCount: 3 });
    expect(sequenceSnapshot(" Summer notes ", cards).name).toBe("Summer notes");
  });

  it("copies visual style settings without copying image or text content", () => {
    const style = copyableCardStyle({ image: "photo.jpg", headline: "Private headline", fontFamily: "rounded", textEffect: "glassText", textTreatment: "blur", textScale: 44, panelPaddingX: 26, panelOffsetY: -12 });
    expect(style).toEqual({ fontFamily: "rounded", textEffect: "glassText", textTreatment: "blur", textScale: 44, panelPaddingX: 26, panelOffsetY: -12 });
  });

  it("scales down long copy and exports without a watermark", () => {
    expect(fitTextScale({ baseScale: 58, headline: "A very long headline that needs to fit safely inside a story panel", caption: "A longer supporting caption that should remain readable without covering the image." })).toBeLessThan(58);
    expect(exportMetadata()).toEqual({ watermark: false, canvas: "1080x1920", safeZones: true });
    expect(exportRenderPlan()).toEqual({ canvas: "1080x1920", drawWatermark: false, respectSafeZones: true });
  });

  it("keeps live and exported panel anchors aligned", () => {
    expect(storyPanelAnchor("top")).toEqual({ top: 0.06, bottom: null });
    expect(storyPanelAnchor("center")).toEqual({ top: 0.5, bottom: null });
    expect(storyPanelAnchor("bottom")).toEqual({ top: null, bottom: 0.07 });
  });

  it("skips the panel renderer for text-only glass effects", () => {
    expect(shouldDrawTextPanel({ treatment: "glass", textEffect: "solid" })).toBe(true);
    expect(shouldDrawTextPanel({ treatment: "glass", textEffect: "glassText" })).toBe(false);
    expect(shouldDrawTextPanel({ treatment: "blur", textEffect: "blurText" })).toBe(false);
    expect(exportCardRenderPlan({ placement: "top", textTreatment: "glass", textEffect: "solid" })).toEqual({ anchor: { top: 0.06, bottom: null }, drawPanel: true });
    expect(exportCardRenderPlan({ placement: "center", textTreatment: "glass", textEffect: "solid" })).toEqual({ anchor: { top: 0.5, bottom: null }, drawPanel: true });
    expect(exportCardRenderPlan({ placement: "bottom", textTreatment: "glass", textEffect: "glassText" })).toEqual({ anchor: { top: null, bottom: 0.07 }, drawPanel: false });
  });

  it("builds a safe, fitted, watermark-free production export config", () => {
    const config = exportCardConfig({ headline: "A very long headline that should be reduced to fit the 9:16 card", caption: "A longer caption that needs independent fitting so it stays readable and inside the safe panel.", placement: "bottom", textTreatment: "glass", textEffect: "glassText", textScale: 58, textSize: "medium", textAlign: "left", radius: "soft", gradientStart: "#18231f", gradientEnd: "#8da28f", gradientAngle: 135, textColor: "#ffffff", overlayOpacity: 70, panelPaddingX: 16, panelPaddingY: 16, glassOpacity: 22, blurStrength: 18, borderOpacity: 28, shadowStrength: 22, lineHeight: 1, letterSpacing: -0.04, panelWidth: 84, panelOffsetX: 0, panelOffsetY: 0 } as any);
    expect(config.headlineScale).toBeLessThan(58);
    expect(config.captionScale).toBeLessThanOrEqual(30);
    expect(config.panel.y).toBeGreaterThanOrEqual(172.8);
    expect(config.panel.y + config.panel.height).toBeLessThanOrEqual(1747.2);
    expect(config.drawPanel).toBe(false);
    expect(config.watermark).toBe(false);
  });

  it("reserves export space for example-inspired CTA blocks", () => {
    const base = { headline: "Hook", caption: "Caption", placement: "bottom", textTreatment: "glass", textEffect: "solid", textScale: 58, textSize: "medium", textAlign: "left", radius: "soft", gradientStart: "#18231f", gradientEnd: "#8da28f", gradientAngle: 180, textColor: "#ffffff", overlayOpacity: 70, panelWidth: 84 } as any;
    const plain = exportCardConfig(base);
    const withBlocks = exportCardConfig({ ...base, badge: "WHY THIS WORKS", steps: "Message → Method → Momentum", cta: "Watch now →" });
    const hiddenBlocks = exportCardConfig({ ...base, steps: "Message → Method → Momentum" });
    expect(withBlocks.panel.height).toBeGreaterThan(plain.panel.height);
    expect(hiddenBlocks.panel.height).toBeLessThan(withBlocks.panel.height);
    expect(withBlocks.watermark).toBe(false);
  });

  it("preserves independent badge, CTA, and role colors in export configuration", () => {
    const config = exportCardConfig({ headline: "Color test", caption: "Caption", badge: "BADGE", cta: "Act now", steps: "Step", placement: "bottom", badgeColor: "#ff7a59", ctaColor: "#123456", roleColor: "#e7f0d0", ...visualPresetStyle("minimal") } as any);
    expect(config).toMatchObject({ badgeColor: "#ff7a59", ctaColor: "#123456", roleColor: "#e7f0d0" });
  });

  it("exports a preset with hidden badge and CTA blocks without a watermark", () => {
    const preset = visualPresetStyle("luxury");
    const config = exportCardConfig({ headline: "Luxury story", caption: "A considered moment.", badge: "", cta: "", steps: "", placement: "bottom", ...preset } as any);
    expect(config.watermark).toBe(false);
    expect(config.panel.height).toBeLessThan(exportCardConfig({ headline: "Luxury story", caption: "A considered moment.", badge: "THE PROBLEM", cta: "Watch now →", steps: "", placement: "bottom", ...preset } as any).panel.height);
  });

  it("keeps live and exported panel X offsets in the same coordinate system", () => {
    const centered = safePanelLayout({ canvasWidth: 1080, canvasHeight: 1920, panelWidth: 84, panelHeight: 700, offsetX: 0, offsetY: 0, placement: "bottom" });
    const dragged = safePanelLayout({ canvasWidth: 1080, canvasHeight: 1920, panelWidth: 84, panelHeight: 700, offsetX: 8, offsetY: 0, placement: "bottom" });
    expect(dragged.x - centered.x).toBeCloseTo(86.4, 5);
  });

  it("keeps exported panels inside the story safe area", () => {
    const panel = safePanelLayout({ canvasWidth: 1080, canvasHeight: 1920, panelWidth: 84, panelHeight: 900, offsetX: 8, offsetY: 40, placement: "bottom", anchor: exportCardRenderPlan({ placement: "bottom", textTreatment: "glass", textEffect: "solid" }).anchor });
    expect(panel.y).toBeGreaterThanOrEqual(172.8);
    expect(panel.y + panel.height).toBeLessThanOrEqual(1747.2);
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
    expect(visualStyleSnapshot({ fontFamily: "mono", textEffect: "blurText", textTreatment: "blur", textColor: "#fff", gradientStart: "#111111", gradientEnd: "#8da28f", gradientAngle: 480, overlayOpacity: 140, textSize: "large", textAlign: "center", radius: "round", panelPaddingX: 36, panelPaddingY: 32, glassOpacity: 60, blurStrength: 30, borderOpacity: 55, shadowStrength: 44, lineHeight: 1.25, letterSpacing: 0.02, panelWidth: 92, panelOffsetX: 6, panelOffsetY: -12 })).toMatchObject({ fontFamily: "mono", textEffect: "blurText", textTreatment: "blur", textColor: "#fff", gradient: { start: "#111111", end: "#8da28f", angle: 360 }, overlayOpacity: 100, textSize: "large", textAlign: "center", radius: "round", panelPaddingX: 36, panelPaddingY: 32, glassOpacity: 60, blurStrength: 30, borderOpacity: 55, shadowStrength: 44, lineHeight: 1.25, letterSpacing: 0.02, panelWidth: 92, panelOffsetX: 6, panelOffsetY: -12 });
  });

  it("builds the exact export style configuration used by the canvas renderer", () => {
    expect(exportStyleConfig({ fontFamily: "mono", textEffect: "blurText", textTreatment: "plain", textColor: "#f8e7c9", gradientStart: "#18231f", gradientEnd: "#8da28f", gradientAngle: 270, overlayOpacity: 70, textSize: "large", textAlign: "center", radius: "round", panelPaddingX: 28, panelPaddingY: 22, glassOpacity: 40, blurStrength: 24, borderOpacity: 35, shadowStrength: 30, lineHeight: 1.1, letterSpacing: -0.02, panelWidth: 76, panelOffsetX: 4, panelOffsetY: -10 })).toEqual({ fontFamily: "mono", textEffect: "blurText", treatment: "plain", textColor: "#f8e7c9", gradient: { start: "#18231f", end: "#8da28f", angle: 270 }, overlayAlpha: 0.7, align: "center", radius: "round", headlineScale: 1.18, textScale: 72, paddingX: 28, paddingY: 22, glassOpacity: 40, blurStrength: 24, borderOpacity: 35, shadowStrength: 30, lineHeight: 1.1, letterSpacing: -0.02, panelWidth: 76, offsetX: 4, offsetY: -10 });
  });
});
