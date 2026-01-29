import type { ImageMeta, ImageSettings, OutputFormat } from "@/types";

type DecodedImage = {
  image: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  dispose: () => void;
};

const SUPPORTED_OUTPUTS: OutputFormat[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

function isValidOutput(format: string): format is OutputFormat {
  return SUPPORTED_OUTPUTS.includes(format as OutputFormat);
}

async function decodeWithImageBitmap(file: File): Promise<DecodedImage> {
  const bitmap = await createImageBitmap(file);
  return {
    image: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    dispose: () => bitmap.close(),
  };
}

async function decodeWithImageElement(file: File): Promise<DecodedImage> {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";
  img.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to decode image."));
  });

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  URL.revokeObjectURL(objectUrl);

  return {
    image: img,
    width,
    height,
    dispose: () => undefined,
  };
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    return decodeWithImageBitmap(file);
  }

  return decodeWithImageElement(file);
}

function getTargetSize(
  width: number,
  height: number,
  settings?: ImageSettings["resize"]
): { width: number; height: number } {
  if (!settings || (!settings.width && !settings.height)) {
    return { width, height };
  }

  const targetWidth = settings.width && settings.width > 0 ? settings.width : undefined;
  const targetHeight = settings.height && settings.height > 0 ? settings.height : undefined;

  if (!settings.lockAspect) {
    return {
      width: targetWidth ?? width,
      height: targetHeight ?? height,
    };
  }

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round((targetWidth / width) * height),
    };
  }

  if (targetHeight && !targetWidth) {
    return {
      width: Math.round((targetHeight / height) * width),
      height: targetHeight,
    };
  }

  if (targetWidth && targetHeight) {
    return {
      width: targetWidth,
      height: Math.round((targetWidth / width) * height),
    };
  }

  return { width, height };
}

export async function getImageMeta(file: File): Promise<ImageMeta> {
  const decoded = await decodeImage(file);
  decoded.dispose();

  return {
    width: decoded.width,
    height: decoded.height,
    type: file.type || "image/*",
    size: file.size,
  };
}

export async function convertImage(
  file: File,
  settings: ImageSettings
): Promise<Blob> {
  if (!isValidOutput(settings.format)) {
    throw new Error("Unsupported output format.");
  }

  const decoded = await decodeImage(file);
  const { width, height } = getTargetSize(
    decoded.width,
    decoded.height,
    settings.resize
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    decoded.dispose();
    throw new Error("Canvas context unavailable.");
  }

  context.drawImage(decoded.image, 0, 0, width, height);
  decoded.dispose();

  const quality =
    settings.format === "image/png" ? undefined : settings.quality;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Failed to encode image."));
          return;
        }
        resolve(result);
      },
      settings.format,
      quality
    );
  });

  return blob;
}
