"use client";

import type { ImageItem, ImageSettings } from "@/types";
import ConvertRow from "@/components/ConvertRow";

interface ConvertListProps {
  items: ImageItem[];
  onSettingsChange: (id: string, settings: ImageSettings) => void;
  onConvert: (id: string) => void;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

export default function ConvertList({
  items,
  onSettingsChange,
  onConvert,
  onRemove,
  onDownload,
}: ConvertListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ConvertRow
          key={item.id}
          item={item}
          onSettingsChange={onSettingsChange}
          onConvert={onConvert}
          onRemove={onRemove}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
