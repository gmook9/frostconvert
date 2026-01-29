import { Badge, Button } from "@gmook9/pristine-ui";
import { ImageIcon, ShieldCheck, Snowflake } from "lucide-react";
import { DollarSign } from "lucide-react";

export default function TopSection() {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <nav className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/20">
            <Snowflake className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              FrostConverter
            </p>
            <p className="text-sm font-semibold text-zinc-100">
              Client-only image toolkit
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-6 text-xs text-zinc-400 md:flex">

        </div>
      </nav>

      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          Fast image conversion, right in your browser.
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
          Convert, resize, and optimize PNG, JPG, and WEBP without uploads. Your
          files never leave this device.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3" id="features">
        <Badge className="flex items-center gap-2 bg-sky-500/15 text-sky-200">
          <ImageIcon className="h-3.5 w-3.5" />
          Instant previews
        </Badge>
        <Badge className="flex items-center gap-2 bg-zinc-800/60 text-zinc-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          No uploads
        </Badge>
        <Badge className="flex items-center gap-2 bg-emerald-500/15 text-emerald-200">
          <DollarSign className="h-3.5 w-3.5" />
          No paywall
        </Badge>
      </div>

    </section>
  );
}
