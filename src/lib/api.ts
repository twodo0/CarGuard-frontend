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

// Upload image
export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/images`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
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
    throw new Error(`Failed to create prediction job: ${response.statusText}`);
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

  console.log("Starting rental with URL:", `${API_BASE}/rentals/start/upload${query}`);

  const response = await fetch(`${API_BASE}/rentals/start/upload${query}`, {
    method: "POST",
  });

  console.log("Rental response status:", response.status);
  console.log("Rental response headers:", Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Rental error response:", errorText);
    throw new Error(`Failed to start rental: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  console.log("Rental response body:", responseText);

  try {
    const jsonData = JSON.parse(responseText);
    console.log("Parsed rental data:", jsonData);
    return jsonData;
  } catch (e) {
    console.error("Failed to parse rental response:", e);
    throw new Error(`Invalid JSON response: ${responseText}`);
  }
}

// Rental finish
export async function finishRental(
  rentalId: number,
  imageId: number,
  yoloThreshold?: number,
  vitThreshold?: number,
  model?: string
): Promise<RentalFinishResponse> {
  const query = buildQueryString({
    rentalId: rentalId,
    imageId: imageId,
    yoloThreshold: yoloThreshold,
    vitThreshold: vitThreshold,
    model: model,
  });

  const response = await fetch(`${API_BASE}/rentals/end/upload${query}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to finish rental: ${response.statusText}`);
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
    throw new Error(`Failed to fetch recent predictions: ${response.statusText}`);
  }

  return response.json();
}
