// Bounding box utilities

import { DetectionDto } from "./dto";

export interface PixelBox {
  x: number;
  y: number;
  width: number;
  height: number;
  top1Label: string;
  top1Prob: number;
}

export function normalizedToPixel(
  detection: DetectionDto,
  displayWidth: number,
  displayHeight: number
): PixelBox {
  const x = detection.x * displayWidth;
  const y = detection.y * displayHeight;
  const width = detection.w * displayWidth;
  const height = detection.h * displayHeight;

  const top1 = detection.class_probs[0] || { label: "UNKNOWN", prob: 0 };

  return {
    x,
    y,
    width,
    height,
    top1Label: top1.label,
    top1Prob: top1.prob,
  };
}
