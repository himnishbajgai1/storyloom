import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowDown, ArrowUp, Check, Download, GripVertical, ImagePlus, Loader2, MoreHorizontal, Plus, Sparkles, Trash2, Upload, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { canUseSequenceActions, clampPanelDrag, copyableCardStyle, createStoryCards, exportCardConfig, exportCardRenderPlan, exportFilename, exportMetadata, exportRenderPlan, exportStyleConfig, fitCaptionScale, fitTextScale, exportCropRect, moveCard, normalizeCardVisibility, roleForCard, safePanelLayout, sequenceRoleOrder, shouldDrawTextPanel, storyPanelAnchor, updateCard, visualPresetStyle, readableStoryTextColor, storyCardVerticalFlow, storyCardFlowInput, EXPORT_SCALE } from "@/lib/storySequence";

type Placement = "top" | "center" | "bottom";
type SequenceRole = "hook" | "problem" | "mechanism" | "proof" | "cta";
type VisualPreset = "luxury" | "bold" | "minimal";
type TextTreatment = "plain" | "glass" | "blur";
type FontFamily = "editorial" | "modern" | "grotesk" | "mono" | "rounded";
type TextEffect = "solid" | "glassText" | "blurText";
const presetTextColors = ["#ffffff", "#f8e7c9", "#dce8dc", "#18231f", "#252321", "#f0a08f"];
type Card = { id: string; image: string; name: string; role: SequenceRole; showBadge: boolean; showCta: boolean; showRole: boolean; badge: string; cta: string; steps: string; kicker: string; headline: string; caption: string; placement: Placement; style: "serif" | "sans"; fontFamily: FontFamily; textEffect: TextEffect; textTreatment: TextTreatment; textColor: string; gradientStart: string; gradientEnd: string; gradientAngle: number; overlayOpacity: number; textSize: "small" | "medium" | "large"; textScale: number; textAlign: "left" | "center"; radius: "soft" | "round"; panelPaddingX: number; panelPaddingY: number; glassOpacity: number; blurStrength: number; borderOpacity: number; shadowStrength: number; lineHeight: number; letterSpacing: number; panelWidth: number; panelOffsetX: number; panelOffsetY: number; imagePositionX: number; imagePositionY: number; imageZoom: number; safeZone: boolean; badgeColor: string; ctaColor: string; roleColor: string; aiStatus: "idle" | "generating" | "ready" | "error" };

type SavedSequence = { id: string; name: string; updatedAt: string; cards: Card[] };

const sequenceRoles: SequenceRole[] = sequenceRoleOrder("conversion");
const roleMeta: Record<SequenceRole, { label: string; badge: string; cta: string; steps: string }> = { hook: { label: "Hook", badge: "WHY THIS WORKS", cta: "Keep watching →", steps: "" }, problem: { label: "Problem", badge: "THE PROBLEM", cta: "", steps: "" }, mechanism: { label: "Mechanism", badge: "THE SYSTEM", cta: "", steps: "Message → Method → Momentum" }, proof: { label: "Proof", badge: "REAL RESULTS", cta: "See the full story →", steps: "" }, cta: { label: "CTA", badge: "YOUR NEXT STEP", cta: "Watch now →", steps: "" } };

function makeCard(image: string, index: number, name = `Photo ${String(index + 1).padStart(2, "0")}`, aiStatus: Card["aiStatus"] = "idle"): Card {
  const role = roleForCard("conversion", index);
  return { id: `${Date.now()}-${index}-${Math.random()}`, image, name, role, showBadge: true, showCta: true, showRole: true, badge: roleMeta[role].badge, cta: roleMeta[role].cta, steps: roleMeta[role].steps, kicker: "Your story", headline: "Add your story goal", caption: "Your AI-generated copy will appear here.", placement: index % 3 === 1 ? "center" : index % 3 === 2 ? "top" : "bottom", style: index % 2 ? "sans" : "serif", fontFamily: index % 2 ? "modern" : "editorial", textEffect: "solid", textTreatment: "glass", textColor: "#ffffff", gradientStart: "#18231f", gradientEnd: "#8da28f", gradientAngle: 180, overlayOpacity: 70, textSize: "medium", textScale: 68, textAlign: "left", radius: "round", panelPaddingX: 16, panelPaddingY: 16, glassOpacity: 22, blurStrength: 18, borderOpacity: 28, shadowStrength: 22, lineHeight: 1, letterSpacing: -0.04, panelWidth: 84, panelOffsetX: 0, panelOffsetY: 0, imagePositionX: 50, imagePositionY: 50, imageZoom: 1, safeZone: false, badgeColor: "#d7b27b", ctaColor: "#d7b27b", roleColor: "#f8f1e8", aiStatus };
}

function normalizeCard(card: Partial<Card>, index: number): Card {
  return { ...makeCard(card.image ?? "", index, card.name ?? `Photo ${String(index + 1).padStart(2, "0")}`, card.aiStatus ?? "ready"), ...normalizeCardVisibility(card), role: card.role ?? roleForCard("conversion", index), badge: card.badge ?? "", cta: card.cta ?? "", steps: card.steps ?? "", fontFamily: card.fontFamily ?? (card.style === "sans" ? "modern" : "editorial"), textEffect: card.textEffect ?? "solid", textTreatment: card.textTreatment ?? "glass", textColor: card.textColor ?? "#ffffff", gradientStart: card.gradientStart ?? "#18231f", gradientEnd: card.gradientEnd ?? "#8da28f", gradientAngle: card.gradientAngle ?? 180, overlayOpacity: card.overlayOpacity ?? 70, textSize: card.textSize ?? "medium", textScale: card.textScale ?? (card.textSize === "large" ? 78 : card.textSize === "small" ? 46 : 68), textAlign: card.textAlign ?? "left", radius: card.radius ?? "round", panelPaddingX: card.panelPaddingX ?? 16, panelPaddingY: card.panelPaddingY ?? 16, glassOpacity: card.glassOpacity ?? 22, blurStrength: card.blurStrength ?? 18, borderOpacity: card.borderOpacity ?? 28, shadowStrength: card.shadowStrength ?? 22, lineHeight: card.lineHeight ?? 1, letterSpacing: card.letterSpacing ?? -0.04, panelWidth: card.panelWidth ?? 84, panelOffsetX: card.panelOffsetX ?? 0, panelOffsetY: card.panelOffsetY ?? 0, imagePositionX: card.imagePositionX ?? 50, imagePositionY: card.imagePositionY ?? 50, imageZoom: card.imageZoom ?? 1, safeZone: card.safeZone ?? false, badgeColor: card.badgeColor ?? "#d7b27b", ctaColor: card.ctaColor ?? "#d7b27b", roleColor: card.roleColor ?? "#f8f1e8" } as Card;
}

function loadSaved(): SavedSequence[] {
  try { return (JSON.parse(localStorage.getItem("storyloom-sequences") ?? "[]") as SavedSequence[]).map(item => ({ ...item, cards: item.cards.map(normalizeCard) })); } catch { return []; }
}



function readableTextColor(hex: string) {
  const value = hex.replace("#", ""); const r = parseInt(value.slice(0, 2), 16) || 0; const g = parseInt(value.slice(2, 4), 16) || 0; const b = parseInt(value.slice(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#252321" : "#ffffff";
}

function storyTextColor(hex: string, treatment: TextTreatment) {
  return readableStoryTextColor(hex, treatment);
}

function canvasFontFamily(family: string) {
  return family === "editorial" ? "Georgia" : family === "mono" ? "monospace" : family === "rounded" ? "Arial Rounded MT Bold, Arial" : family === "grotesk" ? "Arial Black, Arial" : "Arial";
}

function fontClass(family: FontFamily) {
  return family === "editorial" ? "font-display" : family === "mono" ? "font-mono" : family === "rounded" ? "font-rounded" : family === "grotesk" ? "font-grotesk" : "font-modern";
}

function StoryCard({ card, active, onClick, editable = false, onDragPanel }: { card: Card; active: boolean; onClick: () => void; editable?: boolean; onDragPanel?: (deltaX: number, deltaY: number, start?: boolean) => void }) {
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const radius = card.radius === "round" ? "rounded-[1.5rem]" : "rounded-[.8rem]";
  const size = fitTextScale({ baseScale: card.textScale, headline: card.headline, caption: card.caption });
  const liveFlowInput = storyCardFlowInput({ headline: card.headline, caption: card.caption, panelWidth: card.panelWidth, paddingX: card.panelPaddingX, headlineSize: size, captionBaseScale: 14, lineHeight: card.lineHeight, panelY: 0, panelHeight: 1000, paddingY: card.panelPaddingY, showAction: Boolean(card.showCta && card.cta) });
  const captionSize = liveFlowInput.captionSize;
  const liveFlow = storyCardVerticalFlow(liveFlowInput);
  const panelBackground = card.textTreatment === "blur" ? `rgba(12,18,16,${card.glassOpacity / 100})` : `rgba(255,255,255,${card.glassOpacity / 100})`;
  const panelShadow = `0 ${Math.round(card.shadowStrength / 2)}px ${card.shadowStrength}px rgba(0,0,0,${card.shadowStrength / 160})`;
  const textOnly = card.textEffect !== "solid";
  const anchor = storyPanelAnchor(card.placement);
  const renderedTextColor = storyTextColor(card.textColor, card.textTreatment);
  const textGlassStyle = card.textEffect === "solid" ? { textShadow: "0 2px 10px rgba(0,0,0,.35)" } : { backgroundImage: `linear-gradient(135deg, ${renderedTextColor}, rgba(255,255,255,.58), ${renderedTextColor})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: card.textEffect === "blurText" ? `0 0 ${Math.max(6, card.blurStrength / 2)}px ${renderedTextColor}` : "0 1px 0 rgba(255,255,255,.55)" };
  return <button onClick={onClick} style={{ borderRadius: card.radius === "round" ? "1.5rem" : ".8rem" }} className={`group relative aspect-[9/16] w-full overflow-hidden text-left story-shadow ${active ? "ring-2 ring-[#8da28f] ring-offset-4 ring-offset-[#f5f4ef]" : ""}`}>
    <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" style={{ objectPosition: `${card.imagePositionX}% ${card.imagePositionY}%`, transform: `scale(${card.imageZoom})` }} />
    <div className="absolute inset-0" style={{ background: `linear-gradient(${card.gradientAngle}deg, ${card.gradientStart}${Math.round(card.overlayOpacity * 0.8).toString(16).padStart(2, "0")}, ${card.gradientEnd}${Math.round(card.overlayOpacity * 0.95).toString(16).padStart(2, "0")})` }} />
    <div className={`absolute ${editable ? "cursor-grab select-none active:cursor-grabbing" : ""}`} onPointerDown={event => { if (!editable || !onDragPanel) return; event.preventDefault(); event.stopPropagation(); dragStart.current = { x: event.clientX, y: event.clientY }; onDragPanel(0, 0, true); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { if (!dragStart.current || !onDragPanel) return; const delta = { x: event.clientX - dragStart.current.x, y: event.clientY - dragStart.current.y }; onDragPanel(delta.x / Math.max(1, event.currentTarget.getBoundingClientRect().width) * 100, delta.y); }} onPointerUp={event => { dragStart.current = null; event.currentTarget.releasePointerCapture?.(event.pointerId); }} style={{ left: `${8 + card.panelOffsetX}%`, width: `${card.panelWidth}%`, top: anchor.top === null ? undefined : `${anchor.top * 100}%`, bottom: anchor.bottom === null ? undefined : `${anchor.bottom * 100}%`, transform: `${card.placement === "center" ? "translateY(-50%)" : ""} translateY(${card.panelOffsetY}px)` }}>
      <div className={`${radius} ${card.textTreatment === "plain" || card.textEffect !== "solid" ? "" : "border"}`} style={{ color: renderedTextColor, textAlign: card.textAlign, background: !textOnly && card.textTreatment !== "plain" ? panelBackground : "transparent", backdropFilter: textOnly || card.textTreatment === "plain" ? undefined : `blur(${card.blurStrength}px) saturate(150%)`, WebkitBackdropFilter: textOnly || card.textTreatment === "plain" ? undefined : `blur(${card.blurStrength}px) saturate(150%)`, borderColor: textOnly || card.textTreatment === "plain" ? "transparent" : `rgba(255,255,255,${card.borderOpacity / 100})`, boxShadow: textOnly || card.textTreatment === "plain" ? "none" : panelShadow, padding: `${card.panelPaddingY}px ${card.panelPaddingX}px` }}>
        {card.showBadge && card.badge && <span className="mb-3 inline-flex w-fit rounded-md border border-white/45 px-3 py-1 font-mono text-[.58rem] font-bold tracking-[.18em]" style={{ backgroundColor: card.badgeColor, color: readableTextColor(card.badgeColor) }}>{card.badge}</span>}
        {card.showBadge && <p className="eyebrow mb-2 opacity-75" style={{ color: card.badgeColor }}>{card.kicker}</p>}
        <h3 className={`max-w-full ${fontClass(card.fontFamily)} ${card.style === "sans" ? "font-semibold" : ""}`} style={{ ...textGlassStyle, color: card.textEffect === "solid" ? renderedTextColor : "transparent", fontSize: `${size}px`, lineHeight: card.lineHeight, letterSpacing: `${card.letterSpacing}em` }}>{card.headline}</h3>
        <p className="max-w-full opacity-80" style={{ ...textGlassStyle, marginTop: `${Math.max(12, liveFlow.minimumGap / 2)}px`, marginBottom: card.showCta && card.cta ? `${liveFlow.minimumGap / 2}px` : undefined, fontSize: `${captionSize}px`, lineHeight: card.lineHeight + .3, letterSpacing: `${card.letterSpacing / 2}em` }}>{card.caption}</p>
        {card.steps && <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 font-mono text-[.52rem] font-bold uppercase tracking-[.08em]" style={{ backgroundColor: card.roleColor, borderColor: card.roleColor, color: readableTextColor(card.roleColor) }}><span>{card.steps}</span></div>}
        {card.showCta && card.cta && <div className="inline-flex items-center rounded-md px-4 py-2 font-mono text-[.62rem] font-bold uppercase tracking-[.1em]" style={{ backgroundColor: card.ctaColor, color: readableTextColor(card.ctaColor) }}>{card.cta}</div>}
      </div>
    </div>
    {card.safeZone && <div className="pointer-events-none absolute inset-x-3 top-[9%] bottom-[9%] rounded-xl border border-dashed border-white/45" />}
    {card.safeZone && <span className="absolute left-4 bottom-4 rounded-full bg-black/35 px-2 py-1 font-mono text-[.5rem] text-white/80">SAFE ZONE</span>}
    {card.aiStatus === "generating" && <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2 py-1 font-mono text-[.55rem] text-[#203529]">AI writing…</span>}
    {card.aiStatus === "error" && <span className="absolute right-4 top-4 rounded-full bg-[#f5e6e1] px-2 py-1 font-mono text-[.55rem] text-[#a25d50]">Retry AI</span>}
    {active && card.aiStatus === "ready" && <span className="absolute right-4 top-4 rounded-full bg-white/90 p-1.5 text-[#203529]"><Check size={13} /></span>}
  </button>;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>(() => {
    const reopened = localStorage.getItem("storyloom-open-sequence");
    if (reopened) { localStorage.removeItem("storyloom-open-sequence"); try { const parsed = JSON.parse(reopened) as { cards?: Card[]; name?: string } | Card[]; return (Array.isArray(parsed) ? parsed : parsed.cards ?? []).map(normalizeCard); } catch { /* fall through */ } }
    return [];
  });
  const [reopenedName] = useState(() => { try { const raw = localStorage.getItem("storyloom-open-sequence-name"); if (raw) { localStorage.removeItem("storyloom-open-sequence-name"); return raw; } } catch {} return "Untitled story sequence"; });
  const [activeId, setActiveId] = useState(cards[0]?.id ?? "");
  const [sequenceName, setSequenceName] = useState(reopenedName);
  const [goal, setGoal] = useState("");
  const [saved, setSaved] = useState<SavedSequence[]>(loadSaved);
  const [generating, setGenerating] = useState(false);
  const [creatingStories, setCreatingStories] = useState(false);
  const [styleClipboard, setStyleClipboard] = useState<Partial<Card> | null>(null);
  const [visualPreset, setVisualPreset] = useState<VisualPreset>("luxury");
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const [sequencePreset, setSequencePreset] = useState<"conversion" | "education" | "launch">("conversion");
  const fileRef = useRef<HTMLInputElement>(null);
  const active = cards.find(card => card.id === activeId) ?? cards[0];
  const { isAuthenticated } = useAuth();
  const generateCopy = trpc.story.generateCopy.useMutation();
  const saveRemote = trpc.story.save.useMutation();

  const activeIndex = useMemo(() => cards.findIndex(card => card.id === active?.id), [cards, active]);

  const updateActive = (patch: Partial<Card>) => {
    if (!active) return;
    setCards(current => updateCard(current, active.id, patch));
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((file, offset) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const next = makeCard(String(reader.result), cards.length + offset, file.name.replace(/\.[^/.]+$/, ""), "idle");
        setCards(current => [...current, next]);
        setActiveId(next.id);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} image${files.length === 1 ? "" : "s"} added to your sequence.`);
  };

  const createStories = async () => {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal) { toast.error("Add what you want this story to do first."); return; }
    if (!cards.length) { toast.error("Upload at least one photo first."); return; }
    setCreatingStories(true);
    try {
      const generated = await createStoryCards(cards, trimmedGoal, async (card, storyGoal) => {
        setCards(current => updateCard(current, card.id, { aiStatus: "generating" }));
        try {
          const targetIndex = cards.findIndex(item => item.id === card.id);
          const result = await generateCopy.mutateAsync({ imageDataUrl: card.image, tone: "warm, thoughtful, quietly confident", goal: storyGoal, cardNumber: targetIndex + 1, role: card.role, sequencePreset });
          setCards(current => updateCard(current, card.id, { ...result, aiStatus: "ready" }));
          return { ...result, aiStatus: "ready" as const };
        } catch (error) {
          setCards(current => updateCard(current, card.id, { aiStatus: "error" }));
          throw error;
        }
      });
      setCards(generated);
      toast.success("Your story sequence is ready to edit.");
    } catch {
      toast.error("One or more cards need a retry. Check the card status and try again.");
    } finally { setCreatingStories(false); }
  };

  const applyVisualPreset = (preset: VisualPreset) => {
    setVisualPreset(preset);
    const style = visualPresetStyle(preset);
    setCards(current => current.map(card => ({ ...card, ...style })) as Card[]);
    toast.success(`${preset[0].toUpperCase()}${preset.slice(1)} visual preset applied.`);
  };

  const handlePanelDrag = (deltaX: number, deltaY: number, start = false) => {
    if (!active) return;
    if (start) { dragOrigin.current = { x: active.panelOffsetX, y: active.panelOffsetY }; return; }
    const origin = dragOrigin.current ?? { x: active.panelOffsetX, y: active.panelOffsetY };
    const next = clampPanelDrag(origin.x + deltaX, origin.y + deltaY); setCards(current => updateCard(current, active.id, { panelOffsetX: next.offsetX, panelOffsetY: next.offsetY }));
  };

  const applySequencePreset = (preset: "conversion" | "education" | "launch") => {
    setSequencePreset(preset);
    const roleOrder = sequenceRoleOrder(preset);
    setCards(current => current.map((card, index) => { const role = roleOrder[Math.min(index, roleOrder.length - 1)]; return { ...card, role, badge: roleMeta[role].badge, cta: roleMeta[role].cta, steps: roleMeta[role].steps }; }));
    toast.success(`${preset[0].toUpperCase()}${preset.slice(1)} sequence structure applied.`);
  };

  const moveActive = (direction: -1 | 1) => {
    if (!active || activeIndex < 0) return;
    const target = activeIndex + direction;
    if (target < 0 || target >= cards.length) return;
    setCards(current => moveCard(current, activeIndex, direction));
  };

  const removeActive = () => {
    if (!active) return;
    const remaining = cards.filter(card => card.id !== active.id);
    setCards(remaining);
    setActiveId(remaining[Math.max(0, activeIndex - 1)]?.id ?? "");
  };

  const copyStyle = () => { if (!active) return; setStyleClipboard(copyableCardStyle(active) as Partial<Card>); toast.success("Card style copied."); };
  const pasteStyle = () => { if (!active || !styleClipboard) return; setCards(current => updateCard(current, active.id, styleClipboard)); toast.success("Style applied to this card."); };

  const generate = async (target: Card | undefined = active, storyGoal: string = goal.trim()) => {
    if (!target) return;
    if (!storyGoal) { toast.error("Add what you want this story to do first."); return; }
    setGenerating(true);
    setCards(current => updateCard(current, target.id, { aiStatus: "generating" }));
    try {
      const targetIndex = cards.findIndex(card => card.id === target.id);
      const result = await generateCopy.mutateAsync({ imageDataUrl: target.image, tone: "warm, thoughtful, quietly confident", goal: storyGoal, cardNumber: targetIndex + 1, role: target.role, sequencePreset });
      setCards(current => updateCard(current, target.id, { ...result, aiStatus: "ready" }));
      toast.success("Fresh copy generated for this card.");
    } catch {
      setCards(current => updateCard(current, target.id, { aiStatus: "error" }));
      toast.error("Copy generation needs a moment. Try again.");
    } finally { setGenerating(false); }
  };

  const retryCard = (card: Card) => {
    setActiveId(card.id);
    void generate(card);
  };

  const saveSequence = () => {
    if (!canUseSequenceActions(cards.length)) { toast.error("Upload photos before saving a sequence."); return; }
    const next: SavedSequence = { id: `${Date.now()}`, name: sequenceName.trim() || "Untitled sequence", updatedAt: new Date().toISOString(), cards };
    const nextSaved = [next, ...saved.filter(item => item.name !== next.name)].slice(0, 6);
    setSaved(nextSaved);
    localStorage.setItem("storyloom-sequences", JSON.stringify(nextSaved));
    if (isAuthenticated) {
      void saveRemote.mutateAsync({ name: next.name, cards: next.cards }).then(() => toast.success("Sequence saved to your library.")).catch(() => toast.error("We couldn't sync this sequence right now; it remains saved on this device."));
    } else toast.success("Sequence saved on this device. Sign in to revisit it anywhere.");
  };

  const exportCard = async (card: Card) => {
    if (!canUseSequenceActions(cards.length)) { toast.error("Upload photos before exporting."); return; }
    const image = new Image(); image.crossOrigin = "anonymous"; image.src = card.image;
    await new Promise(resolve => { image.onload = resolve; image.onerror = resolve; });
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const visual = exportStyleConfig(card); const renderPlan = exportRenderPlan(); const exportConfig = exportCardConfig({ ...card, badge: card.showBadge ? card.badge : "", kicker: card.showBadge ? card.kicker : "", cta: card.showCta ? card.cta : "" });
    const { sourceX, sourceY, sourceWidth, sourceHeight } = exportCropRect(image.width, image.height, card.imageZoom, card.imagePositionX, card.imagePositionY, canvas.width / canvas.height);
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, Math.cos(visual.gradient.angle * Math.PI / 180) * canvas.width, Math.sin(visual.gradient.angle * Math.PI / 180) * canvas.height);
    gradient.addColorStop(0, hexToRgba(visual.gradient.start, visual.overlayAlpha)); gradient.addColorStop(1, hexToRgba(visual.gradient.end, Math.min(1, visual.overlayAlpha + .18))); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const y = card.placement === "top" ? 360 : card.placement === "center" ? 960 : 1430;
    const panelH = exportConfig.panel.height; const panel = exportConfig.panel; const panelW = panel.width; const panelX = panel.x; const panelY = panel.y; const paddingX = exportConfig.paddingX; const paddingY = exportConfig.paddingY; const textX = visual.align === "center" ? canvas.width / 2 : panelX + paddingX; const maxTextWidth = panelW - paddingX * 2; const blockTop = panelY + paddingY; const badge = card.showBadge ? card.badge : ""; const kicker = card.showBadge ? card.kicker : ""; const cta = card.showCta ? card.cta : ""; const headlineSize = exportConfig.headlineScale; const kickerOffset = kicker ? 30 * EXPORT_SCALE : 0; const textY = blockTop + (badge ? 52 * EXPORT_SCALE : 0) + kickerOffset + headlineSize * 1.15;
    if (exportConfig.drawPanel) { ctx.save(); ctx.shadowColor = `rgba(0,0,0,${visual.shadowStrength / 160})`; ctx.shadowBlur = visual.shadowStrength; ctx.shadowOffsetY = visual.shadowStrength / 2; ctx.filter = visual.treatment === "blur" ? `blur(${Math.min(8, visual.blurStrength / 4)}px)` : "none"; ctx.fillStyle = visual.treatment === "blur" ? `rgba(12,18,16,${visual.glassOpacity / 100})` : `rgba(255,255,255,${visual.glassOpacity / 100})`; drawRoundedRect(ctx, panelX, panelY, panelW, panelH, visual.radius === "round" ? 42 * EXPORT_SCALE : 20 * EXPORT_SCALE); ctx.fill(); ctx.filter = "none"; ctx.shadowColor = "transparent"; ctx.strokeStyle = `rgba(255,255,255,${visual.borderOpacity / 100})`; ctx.stroke(); ctx.restore(); }
    if (badge) { ctx.fillStyle = exportConfig.badgeColor; drawRoundedRect(ctx, panelX + paddingX, blockTop, Math.min(250 * EXPORT_SCALE, maxTextWidth), 34 * EXPORT_SCALE, 8 * EXPORT_SCALE); ctx.fill(); ctx.fillStyle = readableTextColor(exportConfig.badgeColor); ctx.font = `700 ${18 * EXPORT_SCALE}px monospace`; ctx.fillText(badge, panelX + paddingX + 14 * EXPORT_SCALE, blockTop + 23 * EXPORT_SCALE); } if (kicker) { ctx.fillStyle = exportConfig.badgeColor; ctx.globalAlpha = .78; ctx.font = `500 ${16 * EXPORT_SCALE}px monospace`; ctx.fillText(kicker.toUpperCase(), textX, blockTop + (badge ? 68 : 18) * EXPORT_SCALE); ctx.globalAlpha = 1; }
    if (exportConfig.watermark && renderPlan.drawWatermark) { ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = "500 28px monospace"; ctx.fillText("STORYLOOM", 86, 108); } ctx.fillStyle = readableStoryTextColor(visual.textColor, visual.treatment); ctx.textAlign = visual.align as CanvasTextAlign;
    if (visual.textEffect !== "solid") { ctx.globalAlpha = visual.textEffect === "blurText" ? .78 : .9; ctx.shadowColor = visual.textColor; ctx.shadowBlur = visual.textEffect === "blurText" ? Math.max(8, visual.blurStrength / 2) : 2; } else { ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2; }
    ctx.font = `600 ${headlineSize}px ${canvasFontFamily(visual.fontFamily)}`; wrapText(ctx, card.headline, textX, textY, maxTextWidth, (headlineSize + 8) * visual.lineHeight, visual.align as CanvasTextAlign, visual.letterSpacing * headlineSize);
    const captionSize = exportConfig.captionScale; ctx.font = `400 ${captionSize}px ${canvasFontFamily(visual.fontFamily)}`; const flow = storyCardVerticalFlow({ panelY, panelHeight: panelH, paddingY, headlineLines: exportConfig.headlineLines, headlineSize, captionLines: exportConfig.captionLines, captionSize, lineHeight: visual.lineHeight, showAction: Boolean(cta) }); const captionStart = blockTop + (badge ? 52 * EXPORT_SCALE : 0) + kickerOffset; const captionY = captionStart + flow.captionY; wrapText(ctx, card.caption, textX, captionY, maxTextWidth, captionSize * (visual.lineHeight + .25), visual.align as CanvasTextAlign, visual.letterSpacing * 15); ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.shadowColor = "transparent";
    const captionBottom = captionY + (flow.captionBottom - flow.captionY); const actionY = Math.max(panelY + panelH - paddingY - (cta ? 42 * EXPORT_SCALE : 0), captionBottom + 24 * EXPORT_SCALE); if (card.steps) { ctx.fillStyle = exportConfig.roleColor; drawRoundedRect(ctx, panelX + paddingX, actionY - (cta ? 58 : 34) * EXPORT_SCALE, maxTextWidth, 42 * EXPORT_SCALE, 8 * EXPORT_SCALE); ctx.fill(); ctx.fillStyle = readableTextColor(exportConfig.roleColor); ctx.font = `700 ${16 * EXPORT_SCALE}px monospace`; ctx.fillText(card.steps, panelX + paddingX + 12 * EXPORT_SCALE, actionY - (cta ? 31 : 7) * EXPORT_SCALE); } if (cta) { ctx.fillStyle = exportConfig.ctaColor; drawRoundedRect(ctx, panelX + paddingX, actionY - 42 * EXPORT_SCALE, Math.min(maxTextWidth, 260 * EXPORT_SCALE), 42 * EXPORT_SCALE, 8 * EXPORT_SCALE); ctx.fill(); ctx.fillStyle = readableTextColor(exportConfig.ctaColor); ctx.font = `700 ${18 * EXPORT_SCALE}px monospace`; ctx.fillText(cta, panelX + paddingX + 16 * EXPORT_SCALE, actionY - 15 * EXPORT_SCALE); }
    const link = document.createElement("a"); link.download = exportFilename(card.name || "story-card"); link.href = canvas.toDataURL("image/png"); link.click();
  };

  const exportAll = async () => { if (!canUseSequenceActions(cards.length)) { toast.error("Upload photos before exporting."); return; } for (const card of cards) await exportCard(card); toast.success("Your story cards are ready to share."); };

  return <div className="min-h-screen paper-grid">
    <header className="sticky top-0 z-20 border-b border-black/10 glass">
      <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#252321] text-[#f5f4ef]"><Sparkles size={17} /></div><span className="font-display text-[1.55rem] tracking-[-.04em]">storyloom</span></div>
        <div className="hidden items-center gap-8 md:flex"><span className="eyebrow text-[#77736c]">Workspace / 01</span><span className="h-1 w-1 rounded-full bg-[#8da28f]" /><span className="eyebrow text-[#77736c]">{cards.length} cards</span></div>
        <div className="flex items-center gap-2"><Link href="/dashboard" className="hidden rounded-full px-3 py-2 text-sm text-[#77736c] hover:bg-white hover:text-[#252321] sm:inline-flex">Library</Link><button onClick={saveSequence} disabled={!canUseSequenceActions(cards.length)} className="hidden rounded-full border border-black/15 px-4 py-2 text-sm font-medium hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 md:inline-flex">Save sequence</button><button onClick={exportAll} disabled={!canUseSequenceActions(cards.length)} className="inline-flex items-center gap-2 rounded-full bg-[#252321] px-4 py-2 text-sm font-medium text-white hover:bg-[#403c38] disabled:cursor-not-allowed disabled:opacity-40"><Download size={15} /> Export</button></div>
      </div>
    </header>

    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
      <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="eyebrow mb-4 text-[#7a8b7d]">Create a story sequence</p><h1 className="font-display max-w-2xl text-5xl leading-[.95] tracking-[-.055em] sm:text-6xl">Turn a moment into <em className="text-[#819686]">something more.</em></h1></div><div className="max-w-xs text-sm leading-relaxed text-[#77736c]">Upload your photos, let AI find the words, then make each card feel unmistakably yours.</div></div>
      <div className="mb-8 grid gap-4 rounded-[1.5rem] border border-black/10 bg-[#fbfaf7] p-5 shadow-[0_18px_50px_rgba(42,36,30,.05)] lg:grid-cols-[1fr_auto] lg:items-end"><label className="block"><span className="eyebrow text-[#77736c]">What should this story help you do?</span><textarea value={goal} onChange={e => setGoal(e.target.value)} rows={2} placeholder="Example: book more calls for my coaching offer, get sales for a new product, or drive people to a launch." className="mt-3 w-full resize-none rounded-xl border border-black/10 bg-[#f5f4ef] p-3 text-sm leading-relaxed outline-none focus:border-[#8da28f]" /></label><div className="flex flex-col gap-2 lg:items-end"><label className="block w-full lg:w-52"><span className="eyebrow text-[#77736c]">Sequence structure</span><select value={sequencePreset} onChange={e => applySequencePreset(e.target.value as "conversion" | "education" | "launch")} className="mt-2 w-full rounded-xl border border-black/10 bg-[#f5f4ef] px-3 py-2 text-xs"><option value="conversion">Conversion path</option><option value="education">Teach + explain</option><option value="launch">Launch sequence</option></select></label><button onClick={() => void createStories()} disabled={creatingStories || !cards.length || !goal.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#252321] px-5 text-sm font-semibold text-white hover:bg-[#403c38] disabled:cursor-not-allowed disabled:opacity-40"><WandSparkles size={16} />{creatingStories ? "Creating stories…" : "Create stories"}</button></div></div>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow text-[#77736c]">Your sequence</p><p className="mt-2 text-sm text-[#77736c]">Drag, edit, and make it yours.</p></div><button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-[#fbfaf7] px-4 py-2 text-sm font-medium hover:border-[#8da28f] hover:bg-[#eef3eb]"><Plus size={15} /> Add photos</button><input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={event => addFiles(event.target.files)} /></div>
          {cards.length ? <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{cards.map((card, index) => <div key={card.id} className="rise-in" style={{ animationDelay: `${index * 45}ms` }}><StoryCard card={card} active={card.id === active?.id} onClick={() => setActiveId(card.id)} /><div className="mt-3 flex items-center justify-between px-1"><span className="font-mono text-[.66rem]" style={{ color: card.showRole ? card.roleColor : "#938e85" }}>{String(index + 1).padStart(2, "0")} {card.showRole ? `/ ${roleMeta[card.role].label} ` : ""}· {card.name}</span><div className="flex items-center gap-2">{card.aiStatus === "error" && <button onClick={() => retryCard(card)} className="rounded-md px-1 text-[.6rem] font-medium text-[#a25d50] hover:bg-[#f5e6e1]">Retry</button>}<button onClick={() => void exportCard(card)} className="rounded-md p-1 text-[#77736c] hover:bg-[#e8e5dc]" title={`Export ${card.name}`}><Download size={13} /></button><GripVertical size={15} className="text-[#aaa49b]" /></div></div></div>)}</div> : <button onClick={() => fileRef.current?.click()} className="flex min-h-[360px] w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-black/20 bg-[#fbfaf7]/70 text-center hover:border-[#8da28f] hover:bg-[#eef3eb]"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e8e5dc]"><ImagePlus size={24} /></div><p className="font-display text-2xl">Start with your photos</p><p className="mt-2 text-sm text-[#77736c]">Drop in as many as you like.</p></button>}
        </section>

        <aside className="sticky top-24 self-start"><div className="mb-4 rounded-[1.5rem] border border-black/10 bg-[#252321] p-3 shadow-[0_18px_50px_rgba(42,36,30,.12)]"><p className="eyebrow mb-2 px-1 text-white/55">Live preview</p>{active ? <StoryCard card={active} active={false} onClick={() => undefined} editable onDragPanel={handlePanelDrag} /> : <div className="grid aspect-[9/16] place-items-center rounded-2xl bg-white/10 text-sm text-white/60">Upload a photo to preview</div>}</div><div className="rounded-[1.5rem] border border-black/10 bg-[#fbfaf7] p-5 shadow-[0_18px_50px_rgba(42,36,30,.07)]"><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow text-[#77736c]">Edit card</p><p className="mt-2 font-display text-2xl">{active ? `Card ${String(activeIndex + 1).padStart(2, "0")}` : "No card selected"}</p></div><button className="rounded-full p-2 text-[#77736c] hover:bg-[#e8e5dc]"><MoreHorizontal size={18} /></button></div>{active && <><div className="mb-5 grid grid-cols-2 gap-2"><button onClick={copyStyle} className="rounded-xl border border-black/10 bg-[#f5f4ef] px-3 py-2 text-xs font-semibold hover:bg-[#eaf1e8]">Copy style</button><button onClick={pasteStyle} disabled={!styleClipboard} className="rounded-xl border border-black/10 bg-[#f5f4ef] px-3 py-2 text-xs font-semibold hover:bg-[#eaf1e8] disabled:cursor-not-allowed disabled:opacity-40">Paste style</button></div><div className="mb-5 rounded-2xl border border-black/10 bg-[#f5f4ef] p-3"><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Visual preset</span><span className="font-mono text-[.58rem] uppercase text-[#938e85]">Applies to all cards</span></div><div className="mt-2 grid grid-cols-3 gap-1"><button onClick={() => applyVisualPreset("luxury")} className={`rounded-lg border px-2 py-2 text-[.62rem] font-semibold ${visualPreset === "luxury" ? "border-[#9b7545] bg-[#f8e7c9]" : "border-black/10 bg-white/50"}`}>Luxury</button><button onClick={() => applyVisualPreset("bold")} className={`rounded-lg border px-2 py-2 text-[.62rem] font-semibold ${visualPreset === "bold" ? "border-[#8da28f] bg-[#dce8dc]" : "border-black/10 bg-white/50"}`}>Bold</button><button onClick={() => applyVisualPreset("minimal")} className={`rounded-lg border px-2 py-2 text-[.62rem] font-semibold ${visualPreset === "minimal" ? "border-[#252321] bg-white" : "border-black/10 bg-white/50"}`}>Minimal</button></div></div></>}{active ? <div className="space-y-5">
            {active.showRole && <div className="rounded-2xl border border-[#d7b27b]/45 p-3" style={{ backgroundColor: active.roleColor }}><div className="flex items-center justify-between"><span className="eyebrow" style={{ color: readableTextColor(active.roleColor) }}>Card role</span><button onClick={() => updateActive({ showRole: false })} className="rounded-full border border-[#9b7545]/40 px-2 py-1 font-mono text-[.56rem] uppercase text-[#806747]">Hide</button><span className="font-mono text-[.6rem]" style={{ color: readableTextColor(active.roleColor) }}>{roleMeta[active.role].label}</span></div><div className="mt-2 grid grid-cols-5 gap-1">{sequenceRoles.map(role => <button key={role} onClick={() => updateActive({ role, badge: roleMeta[role].badge, cta: roleMeta[role].cta, steps: roleMeta[role].steps })} className={`rounded-lg border px-1 py-2 text-[.58rem] capitalize ${active.role === role ? "border-[#9b7545] bg-[#d7b27b]/45" : "border-black/10 bg-white/40"}`}>{roleMeta[role].label}</button>)}</div></div>}{!active.showRole && <button onClick={() => updateActive({ showRole: true })} className="w-full rounded-xl border border-dashed border-[#9b7545]/50 bg-[#f8f1e8] px-3 py-2 text-xs font-semibold text-[#806747]">Show card role controls</button>}
            <button onClick={() => void generate()} disabled={generating || !goal.trim()} className="group flex w-full items-center justify-between rounded-2xl bg-[#dce8dc] px-4 py-3.5 text-left text-[#203529] hover:bg-[#cfe0cf] disabled:opacity-60"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#b8cfba]"><WandSparkles size={16} /></span><span><span className="block text-sm font-semibold">{generating ? "Finding the words..." : "Generate with AI"}</span><span className="mt-0.5 block text-xs text-[#58705d]">Uses your story goal: {goal.trim() || "add a goal above"}</span></span></span>{generating ? <Loader2 className="animate-spin" size={16} /> : <span className="text-lg transition group-hover:translate-x-1">→</span>}</button>
            <div className="grid gap-3 sm:grid-cols-2"><label className="block"><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Badge / eyebrow</span><button onClick={() => updateActive({ showBadge: !active.showBadge })} className="font-mono text-[.56rem] uppercase text-[#819686]">{active.showBadge ? "On" : "Off"}</button></div><input value={active.badge} onChange={e => updateActive({ badge: e.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-[#f5f4ef] px-3 py-2 text-xs outline-none focus:border-[#8da28f]" /></label><label className="block"><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">CTA button</span><button onClick={() => updateActive({ showCta: !active.showCta })} className="font-mono text-[.56rem] uppercase text-[#819686]">{active.showCta ? "On" : "Off"}</button></div><input value={active.cta} onChange={e => updateActive({ cta: e.target.value })} placeholder="Watch now →" className="mt-2 w-full rounded-xl border border-black/10 bg-[#f5f4ef] px-3 py-2 text-xs outline-none focus:border-[#8da28f]" /></label></div><div className="grid gap-3 sm:grid-cols-3"><label className="block"><span className="eyebrow text-[#77736c]">Badge color</span><input type="color" value={active.badgeColor} onChange={e => updateActive({ badgeColor: e.target.value })} className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-black/10 bg-[#f5f4ef] p-1" /></label><label className="block"><span className="eyebrow text-[#77736c]">CTA color</span><input type="color" value={active.ctaColor} onChange={e => updateActive({ ctaColor: e.target.value })} className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-black/10 bg-[#f5f4ef] p-1" /></label><label className="block"><span className="eyebrow text-[#77736c]">Role color</span><input type="color" value={active.roleColor} onChange={e => updateActive({ roleColor: e.target.value })} className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-black/10 bg-[#f5f4ef] p-1" /></label></div><label className="block"><span className="eyebrow text-[#77736c]">Kicker</span><input value={active.kicker} onChange={e => updateActive({ kicker: e.target.value })} className="mt-2 w-full border-b border-black/15 bg-transparent py-2 text-sm outline-none focus:border-[#8da28f]" /></label>
            <label className="block"><span className="eyebrow text-[#77736c]">Headline</span><textarea rows={2} value={active.headline} onChange={e => updateActive({ headline: e.target.value })} className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#f5f4ef] p-3 font-display text-xl leading-tight outline-none focus:border-[#8da28f]" /></label>
            <label className="block"><span className="eyebrow text-[#77736c]">Caption</span><textarea rows={3} value={active.caption} onChange={e => updateActive({ caption: e.target.value })} className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#f5f4ef] p-3 text-sm leading-relaxed outline-none focus:border-[#8da28f]" /></label><label className="block"><span className="eyebrow text-[#77736c]">Step ribbon</span><input value={active.steps} onChange={e => updateActive({ steps: e.target.value })} placeholder="Message → Method → Momentum" className="mt-2 w-full rounded-xl border border-black/10 bg-[#f5f4ef] px-3 py-2 text-xs outline-none focus:border-[#8da28f]" /></label>
            <div><span className="eyebrow text-[#77736c]">Text placement</span><div className="mt-2 grid grid-cols-3 gap-2">{(["top", "center", "bottom"] as Placement[]).map(item => <button key={item} onClick={() => updateActive({ placement: item })} className={`rounded-xl border px-2 py-2 text-xs capitalize ${active.placement === item ? "border-[#8da28f] bg-[#eaf1e8] text-[#203529]" : "border-black/10 hover:bg-[#f5f4ef]"}`}>{item}</button>)}</div></div>
            <div><span className="eyebrow text-[#77736c]">Image framing</span><div className="mt-2 grid grid-cols-3 gap-3"><label className="text-[.65rem] text-[#77736c]">Zoom<input type="range" min="1" max="1.35" step="0.01" value={active.imageZoom} onChange={e => updateActive({ imageZoom: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label><label className="text-[.65rem] text-[#77736c]">Focus X<input type="range" min="0" max="100" value={active.imagePositionX} onChange={e => updateActive({ imagePositionX: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label><label className="text-[.65rem] text-[#77736c]">Focus Y<input type="range" min="0" max="100" value={active.imagePositionY} onChange={e => updateActive({ imagePositionY: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label></div></div>
            <div><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Text size</span><span className="font-mono text-[.6rem] text-[#938e85]">{active.textScale}px</span></div><input type="range" min="32" max="76" value={active.textScale} onChange={e => updateActive({ textScale: Number(e.target.value), textSize: Number(e.target.value) < 48 ? "small" : Number(e.target.value) > 64 ? "large" : "medium" })} className="mt-3 w-full accent-[#819686]" /><p className="mt-1 text-[.68rem] text-[#938e85]">Keep important copy inside the safe area.</p></div>
            <div><span className="eyebrow text-[#77736c]">Font</span><div className="mt-2 grid grid-cols-5 gap-1.5">{([{ id: "editorial", label: "Serif" }, { id: "modern", label: "Modern" }, { id: "grotesk", label: "Grotesk" }, { id: "mono", label: "Mono" }, { id: "rounded", label: "Round" }] as const).map(item => <button key={item.id} onClick={() => updateActive({ fontFamily: item.id, style: item.id === "editorial" ? "serif" : "sans" })} className={`rounded-lg border px-1 py-2 text-[.58rem] ${active.fontFamily === item.id ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10 hover:bg-[#f5f4ef]"}`}>{item.label}</button>)}</div></div>
            <div><span className="eyebrow text-[#77736c]">Text treatment</span><div className="mt-2 grid grid-cols-3 gap-2">{(["plain", "glass", "blur"] as TextTreatment[]).map(item => <button key={item} onClick={() => updateActive({ textTreatment: item })} className={`rounded-xl border px-2 py-2 text-xs capitalize ${active.textTreatment === item ? "border-[#8da28f] bg-[#eaf1e8] text-[#203529]" : "border-black/10 hover:bg-[#f5f4ef]"}`}>{item === "blur" ? "Blur glass" : item}</button>)}</div><div className="mt-3"><span className="eyebrow text-[#77736c]">Text finish</span><div className="mt-2 grid grid-cols-3 gap-2">{([{ id: "solid", label: "Solid" }, { id: "glassText", label: "Glass text" }, { id: "blurText", label: "Blur glass" }] as const).map(item => <button key={item.id} onClick={() => updateActive({ textEffect: item.id })} className={`rounded-lg border px-2 py-2 text-[.62rem] ${active.textEffect === item.id ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10 hover:bg-[#f5f4ef]"}`}>{item.label}</button>)}</div></div></div>
            <div className="grid grid-cols-2 gap-3"><label className="block"><span className="eyebrow text-[#77736c]">Text color</span><div className="mt-2 flex flex-wrap gap-1.5">{presetTextColors.map(color => <button key={color} onClick={() => updateActive({ textColor: color })} aria-label={`Use ${color} text`} className={`h-7 w-7 rounded-full border-2 ${active.textColor === color ? "border-[#819686] ring-2 ring-[#dce8dc]" : "border-white"}`} style={{ backgroundColor: color }} />)}<span className="flex items-center gap-2 rounded-lg border border-black/10 bg-[#f5f4ef] px-2"><input type="color" value={active.textColor} onChange={e => updateActive({ textColor: e.target.value })} className="h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0" /><span className="font-mono text-[.58rem] uppercase text-[#77736c]">Custom</span></span></div></label><label className="block"><span className="eyebrow text-[#77736c]">Radius</span><div className="mt-2 grid grid-cols-2 gap-1"><button onClick={() => updateActive({ radius: "soft" })} className={`rounded-lg border px-2 py-2 text-[.65rem] ${active.radius === "soft" ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10"}`}>Soft</button><button onClick={() => updateActive({ radius: "round" })} className={`rounded-lg border px-2 py-2 text-[.65rem] ${active.radius === "round" ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10"}`}>Round</button></div></label></div>
            <div><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Gradient overlay</span><span className="font-mono text-[.62rem] text-[#938e85]">{active.overlayOpacity}%</span></div><div className="mt-2 grid grid-cols-2 gap-2"><label className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#f5f4ef] p-2"><input type="color" value={active.gradientStart} onChange={e => updateActive({ gradientStart: e.target.value })} className="h-7 w-7 cursor-pointer rounded-lg border-0 bg-transparent p-0" /><span className="font-mono text-[.58rem] text-[#77736c]">Start</span></label><label className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#f5f4ef] p-2"><input type="color" value={active.gradientEnd} onChange={e => updateActive({ gradientEnd: e.target.value })} className="h-7 w-7 cursor-pointer rounded-lg border-0 bg-transparent p-0" /><span className="font-mono text-[.58rem] text-[#77736c]">End</span></label></div><div className="mt-3 flex items-center gap-2"><span className="eyebrow text-[#77736c]">Direction</span>{([{ label: "↓", angle: 180 }, { label: "→", angle: 90 }, { label: "↑", angle: 0 }, { label: "←", angle: 270 }] as const).map(item => <button key={item.angle} onClick={() => updateActive({ gradientAngle: item.angle })} className={`rounded-lg border px-2.5 py-1 text-xs ${active.gradientAngle === item.angle ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10"}`}>{item.label}</button>)}</div><input type="range" min="0" max="100" value={active.overlayOpacity} onChange={e => updateActive({ overlayOpacity: Number(e.target.value) })} className="mt-3 w-full accent-[#819686]" /></div>
            <div className="grid grid-cols-2 gap-3"><label className="block"><span className="eyebrow text-[#77736c]">Text size</span><select value={active.textSize} onChange={e => { const next = e.target.value as Card["textSize"]; updateActive({ textSize: next, textScale: next === "small" ? 44 : next === "large" ? 72 : 58 }); }} className="mt-2 w-full rounded-xl border border-black/10 bg-[#f5f4ef] px-3 py-2 text-xs"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label><label className="block"><span className="eyebrow text-[#77736c]">Alignment</span><div className="mt-2 grid grid-cols-2 gap-1"><button onClick={() => updateActive({ textAlign: "left" })} className={`rounded-lg border px-2 py-2 text-[.65rem] ${active.textAlign === "left" ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10"}`}>Left</button><button onClick={() => updateActive({ textAlign: "center" })} className={`rounded-lg border px-2 py-2 text-[.65rem] ${active.textAlign === "center" ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10"}`}>Center</button></div></label></div>
            <div className="grid grid-cols-3 gap-3"><label className="block"><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Panel width</span><span className="font-mono text-[.58rem] text-[#938e85]">{active.panelWidth}%</span></div><input type="range" min="55" max="100" value={active.panelWidth} onChange={e => updateActive({ panelWidth: Number(e.target.value) })} className="mt-3 w-full accent-[#819686]" /></label><label className="block"><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Panel X</span><span className="font-mono text-[.58rem] text-[#938e85]">{active.panelOffsetX}</span></div><input type="range" min="-8" max="8" value={active.panelOffsetX} onChange={e => updateActive({ panelOffsetX: Number(e.target.value) })} className="mt-3 w-full accent-[#819686]" /></label><label className="block"><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Panel Y</span><span className="font-mono text-[.58rem] text-[#938e85]">{active.panelOffsetY}</span></div><input type="range" min="-40" max="40" value={active.panelOffsetY} onChange={e => updateActive({ panelOffsetY: Number(e.target.value) })} className="mt-3 w-full accent-[#819686]" /></label></div>
            <div><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Padding</span><span className="font-mono text-[.58rem] text-[#938e85]">{active.panelPaddingX} / {active.panelPaddingY}</span></div><div className="mt-2 grid grid-cols-2 gap-3"><label className="text-[.65rem] text-[#77736c]">Horizontal<input type="range" min="8" max="40" value={active.panelPaddingX} onChange={e => updateActive({ panelPaddingX: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label><label className="text-[.65rem] text-[#77736c]">Vertical<input type="range" min="8" max="40" value={active.panelPaddingY} onChange={e => updateActive({ panelPaddingY: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label></div></div>
            <div><span className="eyebrow text-[#77736c]">Glass surface</span><div className="mt-2 grid grid-cols-2 gap-3"><label className="text-[.65rem] text-[#77736c]">Opacity<input type="range" min="5" max="65" value={active.glassOpacity} onChange={e => updateActive({ glassOpacity: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label><label className="text-[.65rem] text-[#77736c]">Blur<input type="range" min="0" max="32" value={active.blurStrength} onChange={e => updateActive({ blurStrength: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label><label className="text-[.65rem] text-[#77736c]">Border<input type="range" min="0" max="70" value={active.borderOpacity} onChange={e => updateActive({ borderOpacity: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label><label className="text-[.65rem] text-[#77736c]">Shadow<input type="range" min="0" max="60" value={active.shadowStrength} onChange={e => updateActive({ shadowStrength: Number(e.target.value) })} className="mt-2 w-full accent-[#819686]" /></label></div></div>
            <div><div className="flex items-center justify-between"><span className="eyebrow text-[#77736c]">Type spacing</span><button onClick={() => updateActive({ safeZone: !active.safeZone })} className={`rounded-lg border px-2 py-1 text-[.6rem] ${active.safeZone ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10"}`}>{active.safeZone ? "Hide safe zone" : "Show safe zone"}</button></div><div className="mt-2 grid grid-cols-2 gap-3"><label className="text-[.65rem] text-[#77736c]">Line height<input type="range" min="80" max="140" value={Math.round(active.lineHeight * 100)} onChange={e => updateActive({ lineHeight: Number(e.target.value) / 100 })} className="mt-2 w-full accent-[#819686]" /></label><label className="text-[.65rem] text-[#77736c]">Letter spacing<input type="range" min="-10" max="8" value={Math.round(active.letterSpacing * 100)} onChange={e => updateActive({ letterSpacing: Number(e.target.value) / 100 })} className="mt-2 w-full accent-[#819686]" /></label></div></div>
            <div className="flex items-center justify-between border-t border-black/10 pt-5"><div className="flex gap-1"><button onClick={() => moveActive(-1)} className="rounded-lg border border-black/10 p-2 hover:bg-[#f5f4ef]" title="Move left"><ArrowUp size={15} /></button><button onClick={() => moveActive(1)} className="rounded-lg border border-black/10 p-2 hover:bg-[#f5f4ef]" title="Move right"><ArrowDown size={15} /></button></div><button onClick={removeActive} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-[#a25d50] hover:bg-[#f5e6e1]"><Trash2 size={14} /> Remove card</button></div>
          </div> : <p className="text-sm leading-relaxed text-[#77736c]">Select a story card to start editing its copy and placement.</p>}</div>
          <div className="mt-4 rounded-[1.5rem] border border-black/10 bg-[#252321] p-5 text-[#f5f4ef]"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#aaa49b]">Save your work</p><p className="mt-2 font-display text-xl">Name this sequence</p></div><Check size={18} className="text-[#b8cfba]" /></div><input value={sequenceName} onChange={e => setSequenceName(e.target.value)} className="mt-5 w-full border-b border-white/20 bg-transparent py-2 text-sm outline-none focus:border-[#b8cfba]" /><button onClick={saveSequence} disabled={!canUseSequenceActions(cards.length)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5f4ef] py-3 text-sm font-semibold text-[#252321] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">Save sequence <span>→</span></button></div>
        </aside>
      </div>

      <section className="mt-16 border-t border-black/10 pt-8"><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow text-[#77736c]">Your library</p><h2 className="mt-2 font-display text-3xl tracking-[-.04em]">Past sequences</h2></div><span className="text-sm text-[#77736c]">{saved.length} saved</span></div>{saved.length ? <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{saved.map(item => <button key={item.id} onClick={() => { setCards(item.cards.map(normalizeCard)); setSequenceName(item.name); setActiveId(item.cards[0]?.id ?? ""); }} className="flex items-center gap-4 rounded-2xl border border-black/10 bg-[#fbfaf7] p-3 text-left hover:-translate-y-0.5 hover:border-[#8da28f]"><div className="flex -space-x-3">{item.cards.slice(0, 3).map(card => <img key={card.id} src={card.image} alt="" className="h-12 w-9 rounded-lg object-cover ring-2 ring-[#fbfaf7]" />)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="mt-1 font-mono text-[.62rem] text-[#938e85]">{item.cards.length} cards · {new Date(item.updatedAt).toLocaleDateString()}</p></div></button>)}</div> : <div className="rounded-2xl border border-dashed border-black/15 px-5 py-8 text-center text-sm text-[#77736c]">Saved sequences will appear here.</div>}</section>
    </main>
    <footer className="mx-auto flex max-w-[1440px] justify-between px-5 pb-8 pt-2 text-[.65rem] text-[#938e85] lg:px-10"><span className="font-mono">STORYLOOM / 2026</span><span>Made for the moments worth keeping.</span></footer>
  </div>;
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", ""); const r = parseInt(value.slice(0, 2), 16); const g = parseInt(value.slice(2, 4), 16); const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${Number.isFinite(r) ? r : 0},${Number.isFinite(g) ? g : 0},${Number.isFinite(b) ? b : 0},${alpha})`;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, align: CanvasTextAlign = "left", letterSpacing = 0) {
  const words = text.split(" "); let line = ""; ctx.textAlign = align;
  const widthOf = (value: string) => ctx.measureText(value).width + Math.max(0, value.length - 1) * letterSpacing;
  const draw = (value: string) => { if (!letterSpacing) { ctx.fillText(value, x, y); return; } const chars = value.split(""); const total = widthOf(value); let cursor = align === "center" ? x - total / 2 : x; if (align === "right") cursor = x - total; ctx.textAlign = "left"; chars.forEach(char => { ctx.fillText(char, cursor, y); cursor += ctx.measureText(char).width + letterSpacing; }); ctx.textAlign = align; };
  for (const word of words) { const test = line ? `${line} ${word}` : word; if (widthOf(test) > maxWidth && line) { draw(line); line = word; y += lineHeight; } else line = test; }
  if (line) draw(line);
}
