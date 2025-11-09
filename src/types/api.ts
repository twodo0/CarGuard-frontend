// API response types based on Spring backend contract

export type DamageType = "CAR_DAMAGE" | "DENT" | "GLASS_BREAK" | "SCRATCH";

export interface ImageUploadResponse {
  imageId: number;
  rawUrl: string;
  width: number;
  height: number;
  contentType: string;
}

export interface ClassProb {
  label?: DamageType;
  damageType?: DamageType;
  prob: number;
}

export interface Detection {
  x: number;
  y: number;
  w: number;
  h: number;
  class_probs: ClassProb[];
}

export interface PredictionDetail {
  predictionId: number;
  createdAt: string;
  rawUrl: string;
  heatMapUrl?: string;
  width?: number;
  height?: number;
  detections: Detection[];
}

export interface JobResponse {
  jobId: number;
}

export interface JobStatusResponse {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  predictionDetail?: PredictionDetail;
  message?: string;
}

export interface DamageSummary {
  total: number;
  byClass: Record<DamageType, number>;
}

export interface RentalStartResponse {
  rentalSessionId: number;  // rentalId → rentalSessionId
  vehicleNo: string;
  predictionId: number;     // startPredictionId → predictionId
  start: {                  // startSummary → start
    total: number;
    byClass: {
      [key: string]: number;
    };
  };
  rentalStatus: string;
}

export interface RentalFinishResponse {
  rentalSessionId: number;
  vehicleNo: string;
  predictionId: number;
  finish: {
    total: number;
    byClass: {
      [key: string]: number;
    };
  };
  delta: {
    [key: string]: number;
  };
  rentalStatus: string;
}

export interface RecentPrediction {
  predictionId: number;
  createdAt: string;
  imageUrl: string;
  detectionCount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
