import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowDown, ArrowUp, Check, Download, GripVertical, ImagePlus, Loader2, MoreHorizontal, Plus, Sparkles, Trash2, Upload, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { exportFilename, moveCard, updateCard } from "@/lib/storySequence";

type Placement = "top" | "center" | "bottom";
type Card = { id: string; image: string; name: string; kicker: string; headline: string; caption: string; placement: Placement; style: "serif" | "sans"; aiStatus: "idle" | "generating" | "ready" | "error" };

type SavedSequence = { id: string; name: string; updatedAt: string; cards: Card[] };

const demoImages = [
  "/manus-storage/743146400_18026441918841931_3728504278865614099_n_3ca0d565.jpg",
  "/manus-storage/742111068_18026441927841931_619524750111925809_n_5d0e8879.jpg",
  "/manus-storage/734944956_18026441951841931_8177036868791149679_n_a737cc2f.jpg",
  "/manus-storage/IMG_7039_e3cd7fdd.webp",
];

const starterCopy = [
  { kicker: "The beginning", headline: "Make room for the good stuff", caption: "A little more intention. A little less noise. This is where the next chapter starts." },
  { kicker: "In motion", headline: "Let the day surprise you", caption: "The best parts rarely arrive on schedule. Stay curious enough to notice them." },
  { kicker: "A softer pace", headline: "Keep what feels like you", caption: "Small rituals, honest work, and a point of view that stays unmistakably yours." },
  { kicker: "Keep going", headline: "This is only the beginning", caption: "Take the feeling with you. The story is already becoming something more." },
];

function makeCard(image: string, index: number, name = `Photo ${String(index + 1).padStart(2, "0")}`, aiStatus: Card["aiStatus"] = "ready"): Card {
  const copy = starterCopy[index % starterCopy.length];
  return { id: `${Date.now()}-${index}-${Math.random()}`, image, name, ...copy, placement: index % 3 === 1 ? "center" : index % 3 === 2 ? "top" : "bottom", style: index % 2 ? "sans" : "serif", aiStatus };
}

function loadSaved(): SavedSequence[] {
  try { return JSON.parse(localStorage.getItem("storyloom-sequences") ?? "[]"); } catch { return []; }
}

function StoryCard({ card, active, onClick }: { card: Card; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`group relative aspect-[9/16] w-full overflow-hidden rounded-[1.25rem] text-left story-shadow ${active ? "ring-2 ring-[#8da28f] ring-offset-4 ring-offset-[#f5f4ef]" : ""}`}>
    <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/75" />
    <div className={`absolute inset-x-5 ${card.placement === "top" ? "top-6" : card.placement === "center" ? "top-1/2 -translate-y-1/2" : "bottom-7"} text-white`}>
      <p className="eyebrow mb-2 text-white/70">{card.kicker}</p>
      <h3 className={`max-w-[14rem] text-[1.65rem] leading-[.98] tracking-[-.04em] ${card.style === "serif" ? "font-display" : "font-semibold"}`}>{card.headline}</h3>
      <p className="mt-3 max-w-[13rem] text-[.7rem] leading-[1.35] text-white/80">{card.caption}</p>
    </div>
    <span className="absolute left-4 top-4 font-mono text-[.62rem] text-white/65">STORYLOOM</span>
    {card.aiStatus === "generating" && <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2 py-1 font-mono text-[.55rem] text-[#203529]">AI writing…</span>}
    {card.aiStatus === "error" && <span className="absolute right-4 top-4 rounded-full bg-[#f5e6e1] px-2 py-1 font-mono text-[.55rem] text-[#a25d50]">Retry AI</span>}
    {active && card.aiStatus === "ready" && <span className="absolute right-4 top-4 rounded-full bg-white/90 p-1.5 text-[#203529]"><Check size={13} /></span>}
  </button>;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>(() => {
    const reopened = localStorage.getItem("storyloom-open-sequence");
    if (reopened) { localStorage.removeItem("storyloom-open-sequence"); try { const parsed = JSON.parse(reopened) as { cards?: Card[]; name?: string } | Card[]; return Array.isArray(parsed) ? parsed : parsed.cards ?? []; } catch { /* fall through */ } }
    return demoImages.map((image, index) => makeCard(image, index));
  });
  const [reopenedName] = useState(() => { try { const raw = localStorage.getItem("storyloom-open-sequence-name"); if (raw) { localStorage.removeItem("storyloom-open-sequence-name"); return raw; } } catch {} return "A softer kind of progress"; });
  const [activeId, setActiveId] = useState(cards[0]?.id ?? "");
  const [sequenceName, setSequenceName] = useState(reopenedName);
  const [saved, setSaved] = useState<SavedSequence[]>(loadSaved);
  const [generating, setGenerating] = useState(false);
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
        const next = makeCard(String(reader.result), cards.length + offset, file.name.replace(/\.[^/.]+$/, ""), "generating");
        setCards(current => [...current, next]);
        setActiveId(next.id);
        void generateCopy.mutateAsync({ imageDataUrl: String(reader.result), tone: "warm, thoughtful, quietly confident", cardNumber: cards.length + offset + 1 }).then(result => {
          setCards(current => current.map(card => card.id === next.id ? { ...card, ...result, aiStatus: "ready" } : card));
        }).catch(() => { setCards(current => current.map(card => card.id === next.id ? { ...card, aiStatus: "error" } : card)); toast.error(`Could not generate copy for ${file.name}. Tap Retry AI on the card.`); });
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} image${files.length === 1 ? "" : "s"} added to your sequence.`);
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

  const generate = async (target: Card | undefined = active) => {
    if (!target) return;
    setGenerating(true);
    setCards(current => updateCard(current, target.id, { aiStatus: "generating" }));
    try {
      const targetIndex = cards.findIndex(card => card.id === target.id);
      const result = await generateCopy.mutateAsync({ imageDataUrl: target.image, tone: "warm, thoughtful, quietly confident", cardNumber: targetIndex + 1 });
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
    const next: SavedSequence = { id: `${Date.now()}`, name: sequenceName.trim() || "Untitled sequence", updatedAt: new Date().toISOString(), cards };
    const nextSaved = [next, ...saved.filter(item => item.name !== next.name)].slice(0, 6);
    setSaved(nextSaved);
    localStorage.setItem("storyloom-sequences", JSON.stringify(nextSaved));
    if (isAuthenticated) {
      void saveRemote.mutateAsync({ name: next.name, cards: next.cards }).then(() => toast.success("Sequence saved to your library.")).catch(() => toast.error("We couldn't sync this sequence right now; it remains saved on this device."));
    } else toast.success("Sequence saved on this device. Sign in to revisit it anywhere.");
  };

  const exportCard = async (card: Card) => {
    const image = new Image(); image.crossOrigin = "anonymous"; image.src = card.image;
    await new Promise(resolve => { image.onload = resolve; image.onerror = resolve; });
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height); const w = image.width * scale; const h = image.height * scale;
    ctx.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, "rgba(0,0,0,.05)"); gradient.addColorStop(1, "rgba(0,0,0,.78)"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white"; ctx.font = "500 28px monospace"; ctx.fillText("STORYLOOM", 86, 108);
    const y = card.placement === "top" ? 340 : card.placement === "center" ? 970 : 1490;
    ctx.font = card.style === "serif" ? "600 92px Georgia" : "600 86px Arial"; wrapText(ctx, card.headline, 86, y, 890, 102);
    ctx.font = "400 34px Arial"; wrapText(ctx, card.caption, 86, y + 170, 820, 48);
    const link = document.createElement("a"); link.download = exportFilename(card.name || "story-card"); link.href = canvas.toDataURL("image/png"); link.click();
  };

  const exportAll = async () => { for (const card of cards) await exportCard(card); toast.success("Your story cards are ready to share."); };

  return <div className="min-h-screen paper-grid">
    <header className="sticky top-0 z-20 border-b border-black/10 glass">
      <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#252321] text-[#f5f4ef]"><Sparkles size={17} /></div><span className="font-display text-[1.55rem] tracking-[-.04em]">storyloom</span></div>
        <div className="hidden items-center gap-8 md:flex"><span className="eyebrow text-[#77736c]">Workspace / 01</span><span className="h-1 w-1 rounded-full bg-[#8da28f]" /><span className="eyebrow text-[#77736c]">{cards.length} cards</span></div>
        <div className="flex items-center gap-2"><Link href="/dashboard" className="hidden rounded-full px-3 py-2 text-sm text-[#77736c] hover:bg-white hover:text-[#252321] sm:inline-flex">Library</Link><button onClick={saveSequence} className="hidden rounded-full border border-black/15 px-4 py-2 text-sm font-medium hover:bg-white md:inline-flex">Save sequence</button><button onClick={exportAll} className="inline-flex items-center gap-2 rounded-full bg-[#252321] px-4 py-2 text-sm font-medium text-white hover:bg-[#403c38]"><Download size={15} /> Export</button></div>
      </div>
    </header>

    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
      <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="eyebrow mb-4 text-[#7a8b7d]">Create a story sequence</p><h1 className="font-display max-w-2xl text-5xl leading-[.95] tracking-[-.055em] sm:text-6xl">Turn a moment into <em className="text-[#819686]">something more.</em></h1></div><div className="max-w-xs text-sm leading-relaxed text-[#77736c]">Upload your photos, let AI find the words, then make each card feel unmistakably yours.</div></div>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow text-[#77736c]">Your sequence</p><p className="mt-2 text-sm text-[#77736c]">Drag, edit, and make it yours.</p></div><button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-[#fbfaf7] px-4 py-2 text-sm font-medium hover:border-[#8da28f] hover:bg-[#eef3eb]"><Plus size={15} /> Add photos</button><input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={event => addFiles(event.target.files)} /></div>
          {cards.length ? <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{cards.map((card, index) => <div key={card.id} className="rise-in" style={{ animationDelay: `${index * 45}ms` }}><StoryCard card={card} active={card.id === active?.id} onClick={() => setActiveId(card.id)} /><div className="mt-3 flex items-center justify-between px-1"><span className="font-mono text-[.66rem] text-[#938e85]">{String(index + 1).padStart(2, "0")} / {card.name}</span><div className="flex items-center gap-2">{card.aiStatus === "error" && <button onClick={() => retryCard(card)} className="rounded-md px-1 text-[.6rem] font-medium text-[#a25d50] hover:bg-[#f5e6e1]">Retry</button>}<button onClick={() => void exportCard(card)} className="rounded-md p-1 text-[#77736c] hover:bg-[#e8e5dc]" title={`Export ${card.name}`}><Download size={13} /></button><GripVertical size={15} className="text-[#aaa49b]" /></div></div></div>)}</div> : <button onClick={() => fileRef.current?.click()} className="flex min-h-[360px] w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-black/20 bg-[#fbfaf7]/70 text-center hover:border-[#8da28f] hover:bg-[#eef3eb]"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e8e5dc]"><ImagePlus size={24} /></div><p className="font-display text-2xl">Start with your photos</p><p className="mt-2 text-sm text-[#77736c]">Drop in as many as you like.</p></button>}
        </section>

        <aside className="xl:sticky xl:top-24 xl:self-start"><div className="rounded-[1.5rem] border border-black/10 bg-[#fbfaf7] p-5 shadow-[0_18px_50px_rgba(42,36,30,.07)]"><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow text-[#77736c]">Edit card</p><p className="mt-2 font-display text-2xl">{active ? `Card ${String(activeIndex + 1).padStart(2, "0")}` : "No card selected"}</p></div><button className="rounded-full p-2 text-[#77736c] hover:bg-[#e8e5dc]"><MoreHorizontal size={18} /></button></div>{active ? <div className="space-y-5">
            <button onClick={() => void generate()} disabled={generating} className="group flex w-full items-center justify-between rounded-2xl bg-[#dce8dc] px-4 py-3.5 text-left text-[#203529] hover:bg-[#cfe0cf] disabled:opacity-60"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#b8cfba]"><WandSparkles size={16} /></span><span><span className="block text-sm font-semibold">{generating ? "Finding the words..." : "Generate with AI"}</span><span className="mt-0.5 block text-xs text-[#58705d]">Keeps your tone thoughtful</span></span></span>{generating ? <Loader2 className="animate-spin" size={16} /> : <span className="text-lg transition group-hover:translate-x-1">→</span>}</button>
            <label className="block"><span className="eyebrow text-[#77736c]">Kicker</span><input value={active.kicker} onChange={e => updateActive({ kicker: e.target.value })} className="mt-2 w-full border-b border-black/15 bg-transparent py-2 text-sm outline-none focus:border-[#8da28f]" /></label>
            <label className="block"><span className="eyebrow text-[#77736c]">Headline</span><textarea rows={2} value={active.headline} onChange={e => updateActive({ headline: e.target.value })} className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#f5f4ef] p-3 font-display text-xl leading-tight outline-none focus:border-[#8da28f]" /></label>
            <label className="block"><span className="eyebrow text-[#77736c]">Caption</span><textarea rows={3} value={active.caption} onChange={e => updateActive({ caption: e.target.value })} className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#f5f4ef] p-3 text-sm leading-relaxed outline-none focus:border-[#8da28f]" /></label>
            <div><span className="eyebrow text-[#77736c]">Text placement</span><div className="mt-2 grid grid-cols-3 gap-2">{(["top", "center", "bottom"] as Placement[]).map(item => <button key={item} onClick={() => updateActive({ placement: item })} className={`rounded-xl border px-2 py-2 text-xs capitalize ${active.placement === item ? "border-[#8da28f] bg-[#eaf1e8] text-[#203529]" : "border-black/10 hover:bg-[#f5f4ef]"}`}>{item}</button>)}</div></div>
            <div><span className="eyebrow text-[#77736c]">Headline style</span><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={() => updateActive({ style: "serif" })} className={`rounded-xl border px-3 py-2 text-left font-display text-lg ${active.style === "serif" ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10"}`}>Editorial</button><button onClick={() => updateActive({ style: "sans" })} className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold ${active.style === "sans" ? "border-[#8da28f] bg-[#eaf1e8]" : "border-black/10"}`}>Modern</button></div></div>
            <div className="flex items-center justify-between border-t border-black/10 pt-5"><div className="flex gap-1"><button onClick={() => moveActive(-1)} className="rounded-lg border border-black/10 p-2 hover:bg-[#f5f4ef]" title="Move left"><ArrowUp size={15} /></button><button onClick={() => moveActive(1)} className="rounded-lg border border-black/10 p-2 hover:bg-[#f5f4ef]" title="Move right"><ArrowDown size={15} /></button></div><button onClick={removeActive} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-[#a25d50] hover:bg-[#f5e6e1]"><Trash2 size={14} /> Remove card</button></div>
          </div> : <p className="text-sm leading-relaxed text-[#77736c]">Select a story card to start editing its copy and placement.</p>}</div>
          <div className="mt-4 rounded-[1.5rem] border border-black/10 bg-[#252321] p-5 text-[#f5f4ef]"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#aaa49b]">Save your work</p><p className="mt-2 font-display text-xl">Name this sequence</p></div><Check size={18} className="text-[#b8cfba]" /></div><input value={sequenceName} onChange={e => setSequenceName(e.target.value)} className="mt-5 w-full border-b border-white/20 bg-transparent py-2 text-sm outline-none focus:border-[#b8cfba]" /><button onClick={saveSequence} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5f4ef] py-3 text-sm font-semibold text-[#252321] hover:bg-white">Save sequence <span>→</span></button></div>
        </aside>
      </div>

      <section className="mt-16 border-t border-black/10 pt-8"><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow text-[#77736c]">Your library</p><h2 className="mt-2 font-display text-3xl tracking-[-.04em]">Past sequences</h2></div><span className="text-sm text-[#77736c]">{saved.length} saved</span></div>{saved.length ? <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{saved.map(item => <button key={item.id} onClick={() => { setCards(item.cards); setSequenceName(item.name); setActiveId(item.cards[0]?.id ?? ""); }} className="flex items-center gap-4 rounded-2xl border border-black/10 bg-[#fbfaf7] p-3 text-left hover:-translate-y-0.5 hover:border-[#8da28f]"><div className="flex -space-x-3">{item.cards.slice(0, 3).map(card => <img key={card.id} src={card.image} alt="" className="h-12 w-9 rounded-lg object-cover ring-2 ring-[#fbfaf7]" />)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="mt-1 font-mono text-[.62rem] text-[#938e85]">{item.cards.length} cards · {new Date(item.updatedAt).toLocaleDateString()}</p></div></button>)}</div> : <div className="rounded-2xl border border-dashed border-black/15 px-5 py-8 text-center text-sm text-[#77736c]">Saved sequences will appear here.</div>}</section>
    </main>
    <footer className="mx-auto flex max-w-[1440px] justify-between px-5 pb-8 pt-2 text-[.65rem] text-[#938e85] lg:px-10"><span className="font-mono">STORYLOOM / 2026</span><span>Made for the moments worth keeping.</span></footer>
  </div>;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" "); let line = "";
  for (const word of words) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, y); line = word; y += lineHeight; } else line = test; }
  if (line) ctx.fillText(line, x, y);
}
