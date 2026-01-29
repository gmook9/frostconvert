"use client";

import { Badge, Button, Card, CardContent, CardFooter, Input, Select, Switch } from "@gmook9/pristine-ui";
import type { ImageItem, ImageSettings, OutputFormat } from "@/types";

const OUTPUT_OPTIONS: { label: string; value: OutputFormat }[] = [
  { label: "PNG", value: "image/png" },
  { label: "JPG", value: "image/jpeg" },
  { label: "WEBP", value: "image/webp" },
];

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) {
    return "-";
  }
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unitIndex]}`;
}

function getOutputLabel(item: ImageItem): string | null {
  if (!item.output || !item.meta) return null;
  const delta = item.output.size - item.meta.size;
  const percent = (delta / item.meta.size) * 100;
  const sign = percent > 0 ? "+" : "";
  return `${formatBytes(item.output.size)} (${sign}${percent.toFixed(1)}%)`;
}

interface ConvertRowProps {
  item: ImageItem;
  onSettingsChange: (id: string, settings: ImageSettings) => void;
  onConvert: (id: string) => void;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

export default function ConvertRow({
  item,
  onSettingsChange,
  onConvert,
  onRemove,
  onDownload,
}: ConvertRowProps) {
  const resize = item.settings.resize ?? { lockAspect: true };
  const qualityPercent = Math.round((item.settings.quality ?? 0.9) * 100);
  const outputLabel = getOutputLabel(item);
  const availableOptions = OUTPUT_OPTIONS.filter(
    (option) => option.value !== item.file.type
  );

  return (
    <Card className="border border-zinc-800 bg-zinc-900/60 text-zinc-100">
      <CardContent className="grid gap-6 p-6 md:grid-cols-[120px_1fr]">
        <div className="flex items-start">
          <img
            src={item.objectUrl}
            alt={item.file.name}
            className="h-24 w-24 rounded-lg border border-zinc-800 object-cover"
          />
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-base font-semibold text-zinc-50">
                {item.file.name}
              </div>
              <div className="text-xs text-zinc-400">
                {item.meta
                  ? `${item.meta.width}×${item.meta.height} • ${formatBytes(
                      item.meta.size
                    )} • ${item.meta.type || "Unknown"}`
                  : "Reading metadata..."}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.error && (
                <Badge variant="danger" size="sm">
                  {item.error}
                </Badge>
              )}
              {outputLabel && (
                <Badge variant="success" size="sm">
                  {outputLabel}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <label className="flex flex-col gap-2 text-xs text-zinc-400">
              Output format
              <Select
                className="bg-zinc-950 text-zinc-100 border border-zinc-700 focus:border-zinc-500"
                value={item.settings.format}
                onChange={(event) => {
                  const nextFormat = event.target.value as OutputFormat;
                  onSettingsChange(item.id, {
                    ...item.settings,
                    format: nextFormat,
                    quality:
                      nextFormat === "image/png"
                        ? undefined
                        : item.settings.quality ?? 0.9,
                  });
                }}
              >
                {availableOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-zinc-950 text-zinc-100"
                  >
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            {item.settings.format !== "image/png" && (
              <label className="flex flex-col gap-2 text-xs text-zinc-400">
                Quality: {qualityPercent}
                <Input
                  type="range"
                  min={40}
                  max={100}
                  value={qualityPercent}
                  onChange={(event) => {
                    const nextQuality = Number(event.target.value) / 100;
                    onSettingsChange(item.id, {
                      ...item.settings,
                      quality: nextQuality,
                    });
                  }}
                />
              </label>
            )}

            <div className="grid gap-2 text-xs text-zinc-400">
              <div className="flex items-center justify-between">
                Resize (optional)
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500">Lock</span>
                  <Switch
                    checked={resize.lockAspect}
                    onCheckedChange={(checked) => {
                      onSettingsChange(item.id, {
                        ...item.settings,
                        resize: { ...resize, lockAspect: checked },
                      });
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={1}
                  placeholder="Width"
                  value={resize.width ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    onSettingsChange(item.id, {
                      ...item.settings,
                      resize: {
                        ...resize,
                        width: value ? Number(value) : undefined,
                      },
                    });
                  }}
                />
                <Input
                  type="number"
                  min={1}
                  placeholder="Height"
                  value={resize.height ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    onSettingsChange(item.id, {
                      ...item.settings,
                      resize: {
                        ...resize,
                        height: value ? Number(value) : undefined,
                      },
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 px-6 py-4">
        <div className="text-xs text-zinc-500">
          {item.output ? "Ready to download" : "Convert to generate output"}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="subtle"
            type="button"
            onClick={() => onRemove(item.id)}
          >
            Remove
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onConvert(item.id)}
            disabled={!item.meta || item.isConverting}
          >
            {item.isConverting ? "Converting..." : "Convert"}
          </Button>
          <Button
            type="button"
            onClick={() => onDownload(item.id)}
            disabled={!item.output}
          >
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
