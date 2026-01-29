"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@gmook9/pristine-ui";
import ImageDropzone from "@/components/ImageDropzone";
import ConvertList from "@/components/ConvertList";
import { convertImage, getImageMeta } from "@/lib/image";
import type { ImageItem, ImageSettings, OutputFormat } from "@/types";

const SUPPORTED_INPUTS = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ??
    `img-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDefaultFormat(type: string): OutputFormat {
  if (type === "image/png" || type === "image/jpeg" || type === "image/webp") {
    return type;
  }
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
  const itemsRef = useRef<ImageItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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
      void convertItem(item);
    },
    [convertItem]
  );

  const handleConvertAll = useCallback(async () => {
    setIsConvertingAll(true);
    const snapshot = itemsRef.current;
    for (const item of snapshot) {
      if (!item.meta) continue;
      await convertItem(item);
    }
    setIsConvertingAll(false);
  }, [convertItem]);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Image Converter</h1>
          <p className="text-sm text-zinc-400">
            Convert and optimize images locally in your browser. No uploads, no
            servers.
          </p>
        </header>

        <ImageDropzone onFilesAdded={handleFilesAdded} />

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
    </div>
  );
}
