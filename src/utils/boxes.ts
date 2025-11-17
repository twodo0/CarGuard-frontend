// Box and detection utilities

import { DetectionDto, ClassProb, DamageLabel } from "@/lib/dto";

/**
 * Normalize class probabilities to sum to 1.0
 */
export function normalizeClassProbs(probs: ClassProb[]): ClassProb[] {
  const sum = probs.reduce((acc, p) => acc + p.prob, 0);
  if (sum === 0) return probs;
  return probs.map(p => ({ ...p, prob: p.prob / sum }));
}

/**
 * Extract and filter detections, defensively removing NORMAL labels if present
 */
export function extractDetections(detections: DetectionDto[]): DetectionDto[] {
  return detections
    .map(det => ({
      ...det,
      class_probs: normalizeClassProbs(
        det.class_probs.filter((cp: any) => cp.label !== "NORMAL")
      ),
    }))
    .filter(det => det.class_probs.length > 0);
}

/**
 * Convert normalized box (0-1) to pixel coordinates
 */
export function normBoxToPixels(
  x: number,
  y: number,
  w: number,
  h: number,
  displayWidth: number,
  displayHeight: number
) {
  return {
    x: x * displayWidth,
    y: y * displayHeight,
    width: w * displayWidth,
    height: h * displayHeight,
  };
}
