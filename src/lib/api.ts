import {
  ImageUploadResponse,
  JobResponse,
  PredictionDetail,
  RentalStartResponse,
  RentalFinishResponse,
  PageResponse,
  RecentPrediction,
} from "@/types/api";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8888/api";

// Helper to build query params (only add if value exists)
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([_, value]) => value !== undefined && value !== "");
  if (entries.length === 0) return "";
  const queryString = entries.map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join("&");
  return `?${queryString}`;
}

// 공통 에러 핸들러: 백엔드 message / error 필드 우선 사용
async function handleErrorResponse(response: Response, defaultMessage: string): Promise<never> {
  let message = defaultMessage;

  try {
    const cloned = response.clone();

    // 1) JSON 시도
    try {
      const data = (await cloned.json()) as any;
      if (data) {
        if (typeof data.message === "string" && data.message.trim().length > 0) {
          message = data.message;
        } else if (typeof data.error === "string" && data.error.trim().length > 0) {
          message = data.error;
        }
      }
    } catch {
      // 2) JSON 실패하면 text 시도
      const text = await cloned.text();
      if (text && text.trim().length > 0) {
        message = text;
      }
    }
  } catch {
    // body 읽다가 또 에러 나면 그냥 defaultMessage 사용
  }

  throw new Error(message);
}

// Upload image
export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/images`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return handleErrorResponse(response, "이미지 업로드에 실패했습니다.");
  }

  return response.json();
}

// Create prediction job
export async function createPredictionJob(
  imageId: number,
  yoloThreshold?: number,
  vitThreshold?: number,
  model?: string
): Promise<JobResponse> {
  const query = buildQueryString({
    yoloThreshold: yoloThreshold,
    vitThreshold: vitThreshold,
    model: model,
  });

  const response = await fetch(`${API_BASE}/predictions/by-image/${imageId}${query}`, {
    method: "POST",
  });

  if (!response.ok) {
    return handleErrorResponse(response, "예측 작업 생성에 실패했습니다.");
  }

  return response.json();
}

// Poll job status
export async function pollJobStatus(jobId: number): Promise<PredictionDetail> {
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds max

  while (attempts < maxAttempts) {
    const response = await fetch(`${API_BASE}/predictions/jobs/${jobId}`);

    if (response.status === 202) {
      // Still processing, wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
      continue;
    }

    if (response.status === 200) {
      return response.json();
    }

    if (response.status === 422) {
      // 여기만 기존 로직 유지: 백엔드가 message 내려준다고 가정
      const error = await response.json();
      throw new Error(error.message || "Prediction failed");
    }

    throw new Error(`Unexpected status: ${response.status}`);
  }

  throw new Error("Job polling timeout");
}

// Rental start
export async function startRental(
  imageId: number,
  vehicleNo: string,
  yoloThreshold?: number,
  vitThreshold?: number,
  model?: string
): Promise<RentalStartResponse> {
  const query = buildQueryString({
    imageId: imageId,
    vehicleNo: vehicleNo,
    yoloThreshold: yoloThreshold,
    vitThreshold: vitThreshold,
    model: model,
  });

  const url = `${API_BASE}/rentals/start/upload${query}`;
  console.log("Starting rental with URL:", url);

  const response = await fetch(url, {
    method: "POST",
  });

  if (!response.ok) {
    // 백엔드 예외 메시지(IllegalArgumentException 등)를 최대한 그대로 사용
    return handleErrorResponse(response, "렌탈을 시작하는 중 오류가 발생했습니다.");
  }

  return response.json();
}

// Rental finish
export async function finishRental(
  rentalId: number,
  imageId: number,
  vehicleNo: string,
  yoloThreshold?: number,
  vitThreshold?: number,
  model?: string
): Promise<RentalFinishResponse> {
  console.log("[finishRental args]", {
    rentalId,
    imageId,
    vehicleNo,
    yoloThreshold,
    vitThreshold,
    model,
  });

  const query = buildQueryString({
    rentalId: rentalId,
    imageId: imageId,
    vehicleNo: vehicleNo,
    yoloThreshold: yoloThreshold,
    vitThreshold: vitThreshold,
    model: model,
  });

  const url = `${API_BASE}/rentals/end/upload${query}`;
  console.log("[finishRental] request URL:", url);

  const response = await fetch(url, {
    method: "POST",
  });

  if (!response.ok) {
    return handleErrorResponse(response, "렌탈을 종료하는 중 오류가 발생했습니다.");
  }

  return response.json();
}

// Get recent predictions
export async function getRecentPredictions(
  page: number = 0,
  size: number = 12
): Promise<PageResponse<RecentPrediction>> {
  const query = buildQueryString({ page, size });

  const response = await fetch(`${API_BASE}/predictions/recent${query}`);

  if (!response.ok) {
    return handleErrorResponse(response, "최근 예측 목록을 불러오지 못했습니다.");
  }

  return response.json();
}