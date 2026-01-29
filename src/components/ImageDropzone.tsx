"use client";

import { useCallback, useRef, useState } from "react";
import type { DragEvent } from "react";
import { Button, Card, CardContent } from "@gmook9/pristine-ui";
import { FilePlus2 } from "lucide-react";

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

function filterSupportedFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter((file) =>
    ACCEPTED_TYPES.includes(file.type)
  );
}

interface ImageDropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export default function ImageDropzone({ onFilesAdded }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const filtered = filterSupportedFiles(files);
      if (filtered.length > 0) {
        onFilesAdded(filtered);
      }
    },
    [onFilesAdded]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer?.files?.length) {
        handleFiles(event.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <Card
      className={`border border-dashed bg-zinc-900/60 text-zinc-100 transition-colors ${
        isDragging
          ? "border-zinc-200/70 bg-zinc-800/70"
          : "border-zinc-700"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onClick={handleBrowse}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleBrowse();
        }
      }}
    >
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="text-lg font-semibold">Drop images here</div>
        <p className="max-w-md text-sm text-zinc-400">
          PNG, JPG/JPEG, WEBP (GIF supported as a static image).
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={(event) => {
            event.stopPropagation();
            handleBrowse();
          }}
          className="gap-2"
        >
          <FilePlus2 className="h-4 w-4" />
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) {
              handleFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
