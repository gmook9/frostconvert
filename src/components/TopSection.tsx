import { Badge } from "@gmook9/pristine-ui";
import { ImageIcon, ShieldCheck, Snowflake, DollarSign } from "lucide-react";
import { ReactCountryFlag } from "react-country-flag";

export default function TopSection() {
  return (
    <section className="relative flex w-full flex-col items-center gap-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[80px] h-[380px] w-[380px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl">
        <nav className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/20">
              <Snowflake className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                FrostConverter
              </p>
              <p className="text-sm font-semibold text-zinc-100">
                Client-only image toolkit
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-zinc-800/70 bg-zinc-950/40 px-3 py-1.5 text-[11px] text-zinc-300 backdrop-blur">
              <span className="flex items-center gap-2 text-sky-200">
                 Made in USA
                <ReactCountryFlag
                  countryCode="US"
                  svg
                  style={{
                    width: "2em",
                    height: "1.2em",
                    borderRadius: "2px",
                    marginLeft: "2px",
                  }}
                  title="US"
                />
              </span>
            </div>
          </div>
        </nav>

        <div className="mt-10 grid w-full items-center gap-8 md:grid-cols-[1fr_auto] md:gap-10">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
              Fast image conversion,
              <span className="block bg-gradient-to-r from-sky-200 via-sky-100 to-zinc-100 bg-clip-text text-transparent">
                right in your browser.
              </span>
            </h1>
            <p className="max-w-2xl text-sm text-zinc-400 sm:text-base md:max-w-xl">
              Convert, resize, and optimize PNG, JPG, and WEBP without uploads.
              Your files never leave this device.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md md:mx-0">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Badge className="flex items-center gap-2 bg-sky-500/15 text-sky-200">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Instant downloads
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
          </div>
        </div>
      </div>
    </section>
  );
}
