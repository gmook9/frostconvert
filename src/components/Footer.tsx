import { Globe, Heart, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-zinc-900/60 px-6 py-6 text-center text-[12px] text-zinc-500"
      id="faq"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} FrostConverter</span>
          <span className="text-zinc-700">•</span>
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private by design
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-rose-300" />
            Built for iOS + web
          </span>
          <span className="inline-flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            Works offline once loaded
          </span>
        </div>
      </div>
    </footer>
  );
}
