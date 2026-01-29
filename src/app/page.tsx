"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Toast,
  ToastAction,
  ToastDescription,
  ToastTitle,
} from "@gmook9/pristine-ui";
import ImageDropzone from "@/components/ImageDropzone";
import ConvertList from "@/components/ConvertList";
import PixelSnow from "@/components/PixelSnow";
import TopSection from "@/components/TopSection";
import Footer from "@/components/Footer";
import { convertImage, getImageMeta } from "@/lib/image";
import type { ImageItem, ImageSettings, OutputFormat } from "@/types";

const SUPPORTED_INPUTS = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

const LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_CONVERSIONS = 20;
const CONVERSIONS_KEY = "image_converter_conversions";

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ??
    `img-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDefaultFormat(type: string): OutputFormat {
  if (type === "image/png") return "image/jpeg";
  if (type === "image/jpeg") return "image/webp";
  if (type === "image/webp") return "image/jpeg";
  return "image/png";
}

function getOutputFileName(name: string, format: OutputFormat): string {
  const base = name.replace(/\.[^/.]+$/, "");
  const extension =
    format === "image/png" ? ".png" : format === "image/webp" ? ".webp" : ".jpg";
  return `${base || "image"}${extension}`;
}

export default function Home() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [limitToastOpen, setLimitToastOpen] = useState(false);
  const [limitMinutes, setLimitMinutes] = useState(0);
  const itemsRef = useRef<ImageItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!limitToastOpen) return;
    const timer = window.setTimeout(() => setLimitToastOpen(false), 4500);
    return () => window.clearTimeout(timer);
  }, [limitToastOpen]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.objectUrl);
        if (item.output?.objectUrl) {
          URL.revokeObjectURL(item.output.objectUrl);
        }
      });
    };
  }, []);

  const updateItem = useCallback(
    (id: string, updater: (item: ImageItem) => ImageItem) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updater(item) : item))
      );
    },
    []
  );

  const readHistory = useCallback(() => {
    if (typeof window === "undefined") return [] as number[];
    try {
      const raw = window.localStorage.getItem(CONVERSIONS_KEY);
      const parsed = raw ? (JSON.parse(raw) as number[]) : [];
      return Array.isArray(parsed)
        ? parsed.filter((value) => Number.isFinite(value))
        : [];
    } catch {
      return [] as number[];
    }
  }, []);

  const writeHistory = useCallback((history: number[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CONVERSIONS_KEY, JSON.stringify(history));
  }, []);

  const consumeConversionSlot = useCallback(() => {
    const now = Date.now();
    const recent = readHistory().filter(
      (timestamp) => now - timestamp < LIMIT_WINDOW_MS
    );

    if (recent.length >= MAX_CONVERSIONS) {
      const oldest = Math.min(...recent);
      const remainingMs = Math.max(LIMIT_WINDOW_MS - (now - oldest), 0);
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
      setLimitMinutes(remainingMinutes);
      setLimitToastOpen(true);
      return false;
    }

    const nextHistory = [...recent, now];
    writeHistory(nextHistory);
    return true;
  }, [readHistory, writeHistory]);

  const handleFilesAdded = useCallback((files: File[]) => {
    const incoming = files.filter((file) => SUPPORTED_INPUTS.includes(file.type));
    if (incoming.length === 0) return;

    const newItems: ImageItem[] = incoming.map((file) => ({
      id: createId(),
      file,
      objectUrl: URL.createObjectURL(file),
      settings: {
        format: getDefaultFormat(file.type),
        quality: 0.9,
        resize: { lockAspect: true },
      },
    }));

    setItems((prev) => [...prev, ...newItems]);

    newItems.forEach((item) => {
      getImageMeta(item.file)
        .then((meta) => {
          updateItem(item.id, (current) => ({
            ...current,
            meta,
            error: undefined,
          }));
        })
        .catch(() => {
          updateItem(item.id, (current) => ({
            ...current,
            error: "Failed to read image",
          }));
        });
    });
  }, [updateItem]);

  const handleSettingsChange = useCallback(
    (id: string, settings: ImageSettings) => {
      updateItem(id, (current) => ({
        ...current,
        settings,
      }));
    },
    [updateItem]
  );

  const convertItem = useCallback(async (item: ImageItem) => {
    updateItem(item.id, (current) => ({
      ...current,
      isConverting: true,
      error: undefined,
    }));

    try {
      const blob = await convertImage(item.file, item.settings);
      const objectUrl = URL.createObjectURL(blob);

      updateItem(item.id, (current) => {
        if (current.output?.objectUrl) {
          URL.revokeObjectURL(current.output.objectUrl);
        }
        return {
          ...current,
          output: { blob, size: blob.size, objectUrl },
          isConverting: false,
        };
      });
    } catch (error) {
      updateItem(item.id, (current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Conversion failed",
        isConverting: false,
      }));
    }
  }, [updateItem]);

  const handleConvert = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item || !item.meta) return;
      if (!consumeConversionSlot()) return;
      void convertItem(item);
    },
    [consumeConversionSlot, convertItem]
  );

  const handleConvertAll = useCallback(async () => {
    setIsConvertingAll(true);
    const snapshot = itemsRef.current;
    for (const item of snapshot) {
      if (!item.meta) continue;
      if (!consumeConversionSlot()) break;
      await convertItem(item);
    }
    setIsConvertingAll(false);
  }, [consumeConversionSlot, convertItem]);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.objectUrl);
        if (target.output?.objectUrl) {
          URL.revokeObjectURL(target.output.objectUrl);
        }
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleDownload = useCallback((id: string) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (!target?.output) return;

    const link = document.createElement("a");
    link.href = target.output.objectUrl;
    link.download = getOutputFileName(target.file.name, target.settings.format);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const canConvertAll = useMemo(
    () => items.some((item) => item.meta && !item.isConverting),
    [items]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <PixelSnow
          color="#ffffff"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.25}
          density={0.3}
          direction={125}
          brightness={1}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
        />
      </div>
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 pb-12 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
        <TopSection />

        <section id="converter" className="space-y-6">
          <ImageDropzone onFilesAdded={handleFilesAdded} />
        </section>

        {items.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Conversions</h2>
                <p className="text-xs text-zinc-500">
                  Adjust format, quality, and resize before converting.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleConvertAll}
                disabled={!canConvertAll || isConvertingAll}
              >
                {isConvertingAll ? "Converting..." : "Convert all"}
              </Button>
            </div>
            <ConvertList
              items={items}
              onSettingsChange={handleSettingsChange}
              onConvert={handleConvert}
              onRemove={handleRemove}
              onDownload={handleDownload}
            />
          </section>
        )}
      </main>
      <Footer />
      {limitToastOpen ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-20 w-full max-w-sm">
          <Toast className="pointer-events-auto border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <ToastTitle className="text-sm font-semibold">
                  Rate limit reached
                </ToastTitle>
                <ToastDescription className="text-xs text-zinc-400">
                  You can convert up to {MAX_CONVERSIONS} images per hour. Try
                  again in about {limitMinutes} minute
                  {limitMinutes === 1 ? "" : "s"}.
                </ToastDescription>
              </div>
              <ToastAction
                className="text-xs"
                onClick={() => setLimitToastOpen(false)}
              >
                Dismiss
              </ToastAction>
            </div>
          </Toast>
        </div>
      ) : null}
    </div>
  );
}
