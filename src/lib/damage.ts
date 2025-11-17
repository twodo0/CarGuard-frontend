// Damage type utilities

import { DamageLabel, ImageSlot } from "./dto";

export const DAMAGE_LABELS: Record<DamageLabel, string> = {
  BREAKAGE: "파손",
  CRUSHED: "찌그러짐",
  SCRATCHED: "스크래치",
  SEPARATED: "분리",
};

export const DAMAGE_COLORS: Record<DamageLabel, string> = {
  BREAKAGE: "#3B82F6", // blue-500
  CRUSHED: "#3B82F6", // blue-500
  SCRATCHED: "#3B82F6", // blue-500
  SEPARATED: "#3B82F6", // blue-500
};

export const SLOT_LABELS: Record<ImageSlot, string> = {
  FRONT: "전면",
  REAR: "후면",
  LEFT: "좌측",
  RIGHT: "우측",
};

export function getDamageLabel(type: DamageLabel): string {
  return DAMAGE_LABELS[type] || type;
}

export function getDamageColor(type: DamageLabel): string {
  return DAMAGE_COLORS[type] || "#6b7280";
}

export function getSlotLabel(slot: ImageSlot): string {
  return SLOT_LABELS[slot] || slot;
}
