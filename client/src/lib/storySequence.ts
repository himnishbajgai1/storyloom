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

export function visualStyleSnapshot(style: { textTreatment: string; textColor: string; gradientStart: string; gradientEnd: string; gradientAngle: number; overlayOpacity: number; textSize: string; textAlign: string; radius: string }) {
  return {
    textTreatment: style.textTreatment,
    textColor: style.textColor,
    gradient: { start: style.gradientStart, end: style.gradientEnd, angle: Math.max(0, Math.min(360, style.gradientAngle)) },
    overlayOpacity: Math.max(0, Math.min(100, style.overlayOpacity)),
    textSize: style.textSize,
    textAlign: style.textAlign,
    radius: style.radius,
  };
}

export function exportStyleConfig(style: { textTreatment: string; textColor: string; gradientStart: string; gradientEnd: string; gradientAngle: number; overlayOpacity: number; textSize: string; textAlign: string; radius: string }) {
  const visual = visualStyleSnapshot(style);
  return { treatment: visual.textTreatment, textColor: visual.textColor, gradient: visual.gradient, overlayAlpha: visual.overlayOpacity / 100, align: visual.textAlign, radius: visual.radius, headlineScale: visual.textSize === "large" ? 1.18 : visual.textSize === "small" ? 0.8 : 1 };
}

export function exportFilename(name: string, extension = "png") {
  const safe = name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "story-card";
  return `${safe}.${extension}`;
}
