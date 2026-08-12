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

export function exportFilename(name: string, extension = "png") {
  const safe = name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "story-card";
  return `${safe}.${extension}`;
}
