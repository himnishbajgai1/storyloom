export type StoryCardLike = { id: string; [key: string]: unknown };

export type StorySequencePreset = "conversion" | "education" | "launch";
export type StorySequenceRole = "hook" | "problem" | "mechanism" | "proof" | "cta";

export function sequenceRoleOrder(preset: StorySequencePreset): StorySequenceRole[] {
  return preset === "launch" ? ["hook", "mechanism", "proof", "problem", "cta"] : ["hook", "problem", "mechanism", "proof", "cta"];
}

export function roleForCard(preset: StorySequencePreset, index: number): StorySequenceRole {
  const order = sequenceRoleOrder(preset);
  return order[Math.min(Math.max(0, index), order.length - 1)];
}

export function moveCard<T extends StoryCardLike>(cards: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= cards.length || target < 0 || target >= cards.length) return cards;
  const next = [...cards];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function updateCard<T extends StoryCardLike>(cards: T[], id: string, patch: Partial<T>): T[] {
  return cards.map(card => card.id === id ? { ...card, ...patch } : card);
}

export function sequenceSnapshot(name: string, cards: unknown[]) {
  return { name: name.trim() || "Untitled sequence", cards, cardCount: cards.length };
}

export function canUseSequenceActions(cardCount: number) {
  return cardCount > 0;
}

export async function createStoryCards<T extends StoryCardLike>(cards: T[], goal: string, generateOne: (card: T, goal: string) => Promise<Partial<T>>): Promise<T[]> {
  if (!goal.trim()) throw new Error("A story goal is required");
  if (!cards.length) throw new Error("At least one photo is required");
  return Promise.all(cards.map(async card => ({ ...card, ...(await generateOne(card, goal)) })));
}

export function visualStyleSnapshot(style: { fontFamily?: string; textEffect?: string; textTreatment: string; textColor: string; gradientStart: string; gradientEnd: string; gradientAngle: number; overlayOpacity: number; textSize: string; textAlign: string; radius: string; textScale?: number; panelPaddingX?: number; panelPaddingY?: number; glassOpacity?: number; blurStrength?: number; borderOpacity?: number; shadowStrength?: number; lineHeight?: number; letterSpacing?: number; panelWidth?: number; panelOffsetX?: number; panelOffsetY?: number }) {
  return {
    fontFamily: style.fontFamily ?? "editorial", textEffect: style.textEffect ?? "solid", textTreatment: style.textTreatment,
    textColor: style.textColor,
    gradient: { start: style.gradientStart, end: style.gradientEnd, angle: Math.max(0, Math.min(360, style.gradientAngle)) },
    overlayOpacity: Math.max(0, Math.min(100, style.overlayOpacity)),
    textSize: style.textSize,
    textAlign: style.textAlign,
    radius: style.radius,
    panelPaddingX: Math.max(8, Math.min(40, style.panelPaddingX ?? 16)),
    panelPaddingY: Math.max(8, Math.min(40, style.panelPaddingY ?? 16)),
    glassOpacity: Math.max(5, Math.min(65, style.glassOpacity ?? 22)),
    blurStrength: Math.max(0, Math.min(32, style.blurStrength ?? 18)),
    borderOpacity: Math.max(0, Math.min(70, style.borderOpacity ?? 28)),
    shadowStrength: Math.max(0, Math.min(60, style.shadowStrength ?? 22)),
    lineHeight: Math.max(0.8, Math.min(1.4, style.lineHeight ?? 1)),
    letterSpacing: Math.max(-0.1, Math.min(0.08, style.letterSpacing ?? -0.04)),
    panelWidth: Math.max(55, Math.min(100, style.panelWidth ?? 84)),
    panelOffsetX: Math.max(-8, Math.min(8, style.panelOffsetX ?? 0)),
    panelOffsetY: Math.max(-40, Math.min(40, style.panelOffsetY ?? 0)),
  };
}

export function exportStyleConfig(style: Parameters<typeof visualStyleSnapshot>[0]) {
  const visual = visualStyleSnapshot(style);
  return { fontFamily: visual.fontFamily, textEffect: visual.textEffect, treatment: visual.textTreatment, textColor: visual.textColor, gradient: visual.gradient, overlayAlpha: visual.overlayOpacity / 100, align: visual.textAlign, radius: visual.radius, headlineScale: visual.textSize === "large" ? 1.18 : visual.textSize === "small" ? 0.8 : 1, textScale: style.textScale ?? (visual.textSize === "large" ? 72 : visual.textSize === "small" ? 44 : 58), paddingX: visual.panelPaddingX, paddingY: visual.panelPaddingY, glassOpacity: visual.glassOpacity, blurStrength: visual.blurStrength, borderOpacity: visual.borderOpacity, shadowStrength: visual.shadowStrength, lineHeight: visual.lineHeight, letterSpacing: visual.letterSpacing, panelWidth: visual.panelWidth, offsetX: visual.panelOffsetX, offsetY: visual.panelOffsetY };
}

export function fitTextScale(input: { baseScale: number; headline: string; caption: string }) {
  const headlineFactor = Math.min(1, 260 / Math.max(260, input.headline.length * 9));
  const captionFactor = Math.min(1, 420 / Math.max(420, input.caption.length * 4.2));
  return Math.max(28, Math.round(input.baseScale * Math.min(headlineFactor, captionFactor)));
}

export function fitCaptionScale(input: { baseScale: number; caption: string }) {
  return Math.max(18, Math.round(input.baseScale * Math.min(1, 420 / Math.max(420, input.caption.length * 4.2))));
}

export function estimateTextLines(text: string, charactersPerLine: number) {
  return Math.max(1, Math.ceil(text.trim().length / Math.max(1, charactersPerLine)));
}

export function storyPanelAnchor(placement: "top" | "center" | "bottom") {
  return placement === "top" ? { top: 0.06, bottom: null } : placement === "center" ? { top: 0.5, bottom: null } : { top: null, bottom: 0.07 };
}

export function safePanelLayout(input: { canvasWidth: number; canvasHeight: number; panelWidth: number; panelHeight: number; offsetX: number; offsetY: number; placement: "top" | "center" | "bottom"; anchor?: { top: number | null; bottom: number | null } }) {
  const width = input.canvasWidth * Math.max(0.55, Math.min(1, input.panelWidth / 100));
  const safeTop = input.canvasHeight * 0.09;
  const safeBottom = input.canvasHeight * 0.91;
  const anchor = input.anchor ?? storyPanelAnchor(input.placement);
  const preferredY = anchor.top !== null ? (input.placement === "center" ? input.canvasHeight * anchor.top - input.panelHeight / 2 : input.canvasHeight * anchor.top) : input.canvasHeight * (1 - (anchor.bottom ?? 0)) - input.panelHeight;
  const x = (input.canvasWidth - width) / 2 + input.offsetX * 8;
  const y = Math.max(safeTop, Math.min(preferredY + input.offsetY * 4, safeBottom - input.panelHeight));
  return { x, y, width, height: input.panelHeight };
}

export function shouldDrawTextPanel(style: { treatment: string; textEffect?: string }) {
  return style.treatment !== "plain" && style.textEffect === "solid";
}

export function exportCardRenderPlan(card: { placement: "top" | "center" | "bottom"; textTreatment: string; textEffect?: string }) {
  return { anchor: storyPanelAnchor(card.placement), drawPanel: shouldDrawTextPanel({ treatment: card.textTreatment, textEffect: card.textEffect }) } as const;
}

export function exportCardConfig(card: { headline: string; caption: string; badge?: string; cta?: string; steps?: string; placement: "top" | "center" | "bottom"; textTreatment: string; textEffect?: string; textScale?: number; textSize: string; textAlign: string; radius: string; gradientStart: string; gradientEnd: string; gradientAngle: number; textColor: string; overlayOpacity: number; panelPaddingX?: number; panelPaddingY?: number; glassOpacity?: number; blurStrength?: number; borderOpacity?: number; shadowStrength?: number; lineHeight?: number; letterSpacing?: number; panelWidth?: number; panelOffsetX?: number; panelOffsetY?: number }) {
  const visual = exportStyleConfig(card);
  const headlineScale = fitTextScale({ baseScale: visual.textScale, headline: card.headline, caption: card.caption });
  const captionScale = fitCaptionScale({ baseScale: 30, caption: card.caption });
  const headlineLines = estimateTextLines(card.headline, Math.max(10, Math.floor(((1080 * (visual.panelWidth / 100)) - visual.paddingX * 2) / Math.max(1, headlineScale * 0.55))));
  const captionLines = estimateTextLines(card.caption, Math.max(18, Math.floor(((1080 * (visual.panelWidth / 100)) - visual.paddingX * 2) / Math.max(1, captionScale * 0.55))));
  const blockHeight = (card.badge ? 44 : 0) + (card.steps ? 54 : 0) + (card.cta ? 64 : 0);
  const panelHeight = 150 + visual.paddingY * 2 + headlineLines * headlineScale * visual.lineHeight + captionLines * captionScale * (visual.lineHeight + .25) + 80 + blockHeight;
  const renderPlan = exportCardRenderPlan(card);
  return { headlineScale, captionScale, panel: safePanelLayout({ canvasWidth: 1080, canvasHeight: 1920, panelWidth: visual.panelWidth, panelHeight, offsetX: visual.offsetX, offsetY: visual.offsetY, placement: card.placement, anchor: renderPlan.anchor }), drawPanel: renderPlan.drawPanel, watermark: exportMetadata().watermark } as const;
}

export function exportMetadata() {
  return { watermark: false, canvas: "1080x1920", safeZones: true } as const;
}

export function exportRenderPlan() {
  const metadata = exportMetadata();
  return { canvas: metadata.canvas, drawWatermark: metadata.watermark, respectSafeZones: metadata.safeZones } as const;
}

export function copyableCardStyle(card: Record<string, unknown>) {
  const keys = ["placement", "style", "fontFamily", "textEffect", "textTreatment", "textColor", "gradientStart", "gradientEnd", "gradientAngle", "overlayOpacity", "textSize", "textScale", "textAlign", "radius", "panelPaddingX", "panelPaddingY", "glassOpacity", "blurStrength", "borderOpacity", "shadowStrength", "lineHeight", "letterSpacing", "panelWidth", "panelOffsetX", "panelOffsetY", "safeZone"];
  return Object.fromEntries(keys.filter(key => key in card).map(key => [key, card[key]]));
}

export function exportFilename(name: string, extension = "png") {
  const safe = name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "story-card";
  return `${safe}.${extension}`;
}
