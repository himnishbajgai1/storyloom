export type StoryCardLike = { id: string; [key: string]: unknown };

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

export function visualStyleSnapshot(style: { textTreatment: string; textColor: string; gradientStart: string; gradientEnd: string; gradientAngle: number; overlayOpacity: number; textSize: string; textAlign: string; radius: string; textScale?: number; panelPaddingX?: number; panelPaddingY?: number; glassOpacity?: number; blurStrength?: number; borderOpacity?: number; shadowStrength?: number; lineHeight?: number; letterSpacing?: number; panelWidth?: number; panelOffsetX?: number; panelOffsetY?: number }) {
  return {
    textTreatment: style.textTreatment,
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
  return { treatment: visual.textTreatment, textColor: visual.textColor, gradient: visual.gradient, overlayAlpha: visual.overlayOpacity / 100, align: visual.textAlign, radius: visual.radius, headlineScale: visual.textSize === "large" ? 1.18 : visual.textSize === "small" ? 0.8 : 1, textScale: style.textScale ?? (visual.textSize === "large" ? 72 : visual.textSize === "small" ? 44 : 58), paddingX: visual.panelPaddingX, paddingY: visual.panelPaddingY, glassOpacity: visual.glassOpacity, blurStrength: visual.blurStrength, borderOpacity: visual.borderOpacity, shadowStrength: visual.shadowStrength, lineHeight: visual.lineHeight, letterSpacing: visual.letterSpacing, panelWidth: visual.panelWidth, offsetX: visual.panelOffsetX, offsetY: visual.panelOffsetY };
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

export function safePanelLayout(input: { canvasWidth: number; canvasHeight: number; panelWidth: number; panelHeight: number; offsetX: number; offsetY: number; placement: "top" | "center" | "bottom" }) {
  const width = input.canvasWidth * Math.max(0.55, Math.min(1, input.panelWidth / 100));
  const safeTop = input.canvasHeight * 0.09;
  const safeBottom = input.canvasHeight * 0.91;
  const preferredY = input.placement === "top" ? input.canvasHeight * 0.18 : input.placement === "center" ? input.canvasHeight * 0.5 - input.panelHeight / 2 : input.canvasHeight * 0.68;
  const x = (input.canvasWidth - width) / 2 + input.offsetX * 8;
  const y = Math.max(safeTop, Math.min(preferredY + input.offsetY * 4, safeBottom - input.panelHeight));
  return { x, y, width, height: input.panelHeight };
}

export function exportMetadata() {
  return { watermark: false, canvas: "1080x1920", safeZones: true } as const;
}

export function exportRenderPlan() {
  const metadata = exportMetadata();
  return { canvas: metadata.canvas, drawWatermark: metadata.watermark, respectSafeZones: metadata.safeZones } as const;
}

export function copyableCardStyle(card: Record<string, unknown>) {
  const keys = ["placement", "style", "textTreatment", "textColor", "gradientStart", "gradientEnd", "gradientAngle", "overlayOpacity", "textSize", "textScale", "textAlign", "radius", "panelPaddingX", "panelPaddingY", "glassOpacity", "blurStrength", "borderOpacity", "shadowStrength", "lineHeight", "letterSpacing", "panelWidth", "panelOffsetX", "panelOffsetY", "safeZone"];
  return Object.fromEntries(keys.filter(key => key in card).map(key => [key, card[key]]));
}

export function exportFilename(name: string, extension = "png") {
  const safe = name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "story-card";
  return `${safe}.${extension}`;
}
