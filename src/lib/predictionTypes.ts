// Prediction types matching backend contract

export type DamageLabel = 'BREAKAGE' | 'CRUSHED' | 'SCRATCHED' | 'SEPARATED';

export interface ApiClassProb {
  label: DamageLabel;
  prob: number;
}

export interface BoxDto {
  x: number;
  y: number;
  w: number;
  h: number;
  class_probs: ApiClassProb[];
}

export interface PredictRes {
  model: string;
  threshold_used: number;
  boxes: BoxDto[];
}

// Coordinate conversion utility
export const toPx = (norm: number, size: number) => 
  Math.max(0, Math.min(size, norm * size));

// Normalize class_probs to standard format, removing NORMAL and sorting by probability
export function normalizeProbs(input?: any[]): ApiClassProb[] {
  if (!input || !Array.isArray(input)) return [];
  
  const allowed: DamageLabel[] = ['BREAKAGE', 'CRUSHED', 'SCRATCHED', 'SEPARATED'];
  
  return input
    .map(p => ({
      label: (p?.label ?? p?.damageType) as string,
      prob: Number(p?.prob ?? 0),
    }))
    .filter(p => allowed.includes(p.label as any))
    .map(p => ({ label: p.label as DamageLabel, prob: p.prob }))
    .sort((a, b) => b.prob - a.prob);
}
