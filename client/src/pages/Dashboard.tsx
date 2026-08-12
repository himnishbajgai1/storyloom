import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";

function reopen(sequence: { name: string; cards: unknown[] }) {
  localStorage.setItem("storyloom-open-sequence", JSON.stringify({ cards: sequence.cards, name: sequence.name }));
  localStorage.setItem("storyloom-open-sequence-name", sequence.name);
  window.location.href = "/";
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const sequences = trpc.story.listMine.useQuery(undefined, { enabled: isAuthenticated });

  return <div className="min-h-screen paper-grid"><header className="border-b border-black/10 glass"><div className="mx-auto flex h-[4.5rem] max-w-[1200px] items-center justify-between px-5 lg:px-10"><Link href="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#252321] text-[#f5f4ef]"><Sparkles size={17} /></span><span className="font-display text-[1.55rem] tracking-[-.04em]">storyloom</span></Link><Link href="/" className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm hover:bg-white"><ArrowLeft size={15} /> Back to editor</Link></div></header><main className="mx-auto max-w-[1200px] px-5 py-12 lg:px-10"><p className="eyebrow text-[#7a8b7d]">Personal library</p><h1 className="mt-4 font-display text-5xl tracking-[-.055em]">Stories worth returning to.</h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-[#77736c]">Your saved sequences, kept together and ready for the next edit or export.</p>{!isAuthenticated ? <div className="mt-12 rounded-[1.5rem] border border-black/10 bg-[#fbfaf7] p-8 text-center"><p className="font-display text-2xl">Sign in to revisit your stories anywhere.</p><p className="mx-auto mt-3 max-w-md text-sm text-[#77736c]">Your editor still works on this device without signing in.</p><button onClick={() => startLogin()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#252321] px-5 py-3 text-sm font-medium text-white"><LogIn size={15} /> Sign in</button></div> : sequences.isLoading ? <p className="mt-12 text-sm text-[#77736c]">Gathering your stories...</p> : sequences.data?.length ? <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{sequences.data.map(sequence => <button key={sequence.id} onClick={() => reopen(sequence)} className="group rounded-[1.25rem] border border-black/10 bg-[#fbfaf7] p-4 text-left hover:-translate-y-1 hover:border-[#8da28f]"><div className="grid grid-cols-4 gap-2">{sequence.cards.slice(0, 4).map((card: any) => <img key={card.id} src={card.image} alt="" className="aspect-[3/4] w-full rounded-lg object-cover" />)}</div><p className="mt-4 font-display text-xl">{sequence.name}</p><p className="mt-1 font-mono text-[.62rem] text-[#938e85]">{sequence.cards.length} cards · saved {new Date(sequence.updatedAt).toLocaleDateString()}</p></button>)}</div> : <div className="mt-12 rounded-[1.5rem] border border-dashed border-black/15 px-5 py-12 text-center text-sm text-[#77736c]">No saved sequences yet. Your next one belongs here.</div>}<p className="mt-10 text-xs text-[#938e85]">Signed in as {user?.name ?? user?.email ?? "Storyloom creator"}</p></main></div>;
}
