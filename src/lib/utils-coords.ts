// Coordinate utilities for normalized boxes (0-1 range)

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function normalizedToPixel(normalized: number, dimension: number): number {
  return clamp01(normalized) * dimension;
}

export interface BoxPixels {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function normalizedBoxToPixels(
  box: { x: number; y: number; w: number; h: number },
  imageWidth: number,
  imageHeight: number
): BoxPixels {
  return {
    x: normalizedToPixel(box.x, imageWidth),
    y: normalizedToPixel(box.y, imageHeight),
    w: normalizedToPixel(box.w, imageWidth),
    h: normalizedToPixel(box.h, imageHeight),
  };
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
