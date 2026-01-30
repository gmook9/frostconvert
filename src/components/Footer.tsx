import { Flag, Heart, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-zinc-900/60 px-6 py-6 text-center text-[12px] text-zinc-500"
      id="faq"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-start sm:text-left">
          <span>© {new Date().getFullYear()} FrostConverter</span>
          <span className="text-zinc-700">•</span>
          <a
            href="https://www.enchantingbutterfly.com/"
            className="text-zinc-400 transition hover:text-zinc-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Created by Enchanting Butterfly LLC
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-rose-300" />
            Built for Mobile + Web
          </span>
          <span className="text-zinc-700">•</span>
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private by design
          </span>
        </div>
      </div>
    </footer>
  );
}
