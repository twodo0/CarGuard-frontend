// Type definitions matching backend contract

export type RentalStatus = "IN_RENT" | "RETURNED";
export type DamageLabel = "BREAKAGE" | "CRUSHED" | "SCRATCHED" | "SEPARATED";
export type ImageSlot = "FRONT" | "REAR" | "LEFT" | "RIGHT";
export type DamageSummary = Partial<Record<DamageLabel, number>>;

// 1) Rental Start (Batch)
export interface RentalStartBatchReq {
  vehicleNo: string;
  yoloThreshold?: number; // default 0.3
  images: { imageId: number; slot: ImageSlot }[];
}

export interface RentalStartBatchRes {
  rentalId: number;
  vehicleNo: string;
  totalDamage: number;
  startSummary: DamageSummary;
  results: { slot: ImageSlot; predictionId: number }[];
  status: RentalStatus; // IN_RENT
}

// 2) Rental Finish (Batch)
export interface RentalFinishBatchReq extends RentalStartBatchReq {
  rentalId: number;
}

export interface RentalFinishBatchRes {
  rentalId: number;
  vehicleNo: string;
  totalDamage: number;
  finishSummary: DamageSummary;
  delta: DamageSummary; // only increases
  results: { slot: ImageSlot; predictionId: number }[];
  status: "RETURNED";
}

// 3) Recent List (Batch)
export interface RentalRowView {
  rentalId: number;
  vehicleNo: string;
  status: RentalStatus;
  startAt: string; // ISO8601
  finishedAt: string | null; // RETURNED only
  newDamageTotal: number | null; // null if no new damage → hide in UI
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// 4) Rental Detail (Batch)
export interface RentalImageDto {
  slot: ImageSlot;
  predictionId: number | null;
  rawUrl: string | null;
  heatmapUrl: string | null;
  summaryByImage: Partial<Record<DamageLabel, number>>;
  detections: DetectionDto[];
}

export interface RentalDetailDto {
  rentalId: number;
  vehicleNo: string;
  status: RentalStatus;
  startedAt: string;
  finishedAt: string | null;

  startSummary: DamageSummary;
  finishSummary: DamageSummary; // {} if IN_RENT
  deltaSummary: DamageSummary; // {} if IN_RENT
  startTotal: number;
  finishTotal: number | null;
  newDamageTotal: number | null;

  startImages: RentalImageDto[];
  finishImages: RentalImageDto[]; // [] if IN_RENT
}

// 5) Single Detection
export interface ClassProb {
  label: DamageLabel;
  prob: number;
}

export interface DetectionDto {
  x: number;
  y: number;
  w: number;
  h: number; // 0~1 normalized
  class_probs: ClassProb[];
}

export interface PredictionDetailDto {
  predictionId: number;
  createdAt: string;
  rawUrl: string;
  heatmapUrl?: string | null; // null if NORMAL top1 - matches Java @JsonProperty("heatmapUrl")
  width?: number;
  height?: number;
  detections: DetectionDto[];
}

// Image upload response
export interface ImageUploadResponse {
  imageId: number;
}

// Job polling response
export interface JobResponse {
  jobId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  result?: PredictionDetailDto;
}
