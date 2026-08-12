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

export function visualStyleSnapshot(style: { textTreatment: string; textColor: string; gradientStart: string; gradientEnd: string; gradientAngle: number; overlayOpacity: number; textSize: string; textAlign: string; radius: string; panelPaddingX?: number; panelPaddingY?: number; glassOpacity?: number; blurStrength?: number; borderOpacity?: number; shadowStrength?: number; lineHeight?: number; letterSpacing?: number; panelWidth?: number; panelOffsetX?: number; panelOffsetY?: number }) {
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
  return { treatment: visual.textTreatment, textColor: visual.textColor, gradient: visual.gradient, overlayAlpha: visual.overlayOpacity / 100, align: visual.textAlign, radius: visual.radius, headlineScale: visual.textSize === "large" ? 1.18 : visual.textSize === "small" ? 0.8 : 1, paddingX: visual.panelPaddingX, paddingY: visual.panelPaddingY, glassOpacity: visual.glassOpacity, blurStrength: visual.blurStrength, borderOpacity: visual.borderOpacity, shadowStrength: visual.shadowStrength, lineHeight: visual.lineHeight, letterSpacing: visual.letterSpacing, panelWidth: visual.panelWidth, offsetX: visual.panelOffsetX, offsetY: visual.panelOffsetY };
}

export function exportFilename(name: string, extension = "png") {
  const safe = name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "story-card";
  return `${safe}.${extension}`;
}
