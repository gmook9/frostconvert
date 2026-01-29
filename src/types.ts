export type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

export interface ImageMeta {
  width: number;
  height: number;
  type: string;
  size: number;
}

export interface ResizeSettings {
  width?: number;
  height?: number;
  lockAspect: boolean;
}

export interface ImageSettings {
  format: OutputFormat;
  quality?: number;
  resize?: ResizeSettings;
}

export interface ImageOutput {
  blob: Blob;
  size: number;
  objectUrl: string;
}

export interface ImageItem {
  id: string;
  file: File;
  objectUrl: string;
  meta?: ImageMeta;
  settings: ImageSettings;
  output?: ImageOutput;
  error?: string;
  isConverting?: boolean;
}
