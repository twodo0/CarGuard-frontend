// API utility functions

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Extract clean error message without stack traces
    const data = await response.json().catch(() => null);
    const msg = data?.message || data?.error || data?.detail || (await response.text().catch(() => ''));
    throw new Error(msg || '요청 실패');
  }
  return response.json();
}

export async function uploadImage(file: File): Promise<{ imageId: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/images`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

export async function startRentalBatch(req: any): Promise<any> {
  const response = await fetch(`${API_BASE}/rentals/batch/start/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  return handleResponse(response);
}

export async function finishRentalBatch(req: any): Promise<any> {
  const response = await fetch(`${API_BASE}/rentals/batch/end/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  return handleResponse(response);
}

export async function getRecentRentals(page = 0, size = 20): Promise<any> {
  const response = await fetch(`${API_BASE}/rentals/recent?page=${page}&size=${size}`);
  return handleResponse(response);
}

export async function getRentalDetail(id: number, phase?: "START" | "END"): Promise<any> {
  const url = phase
    ? `${API_BASE}/rentals/${id}?phase=${phase}`
    : `${API_BASE}/rentals/${id}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function detectByImageId(
  imageId: number,
  yoloThreshold = 0.3
): Promise<{ jobId: string }> {
  const response = await fetch(
    `${API_BASE}/predictions/by-image/${imageId}?yoloThreshold=${yoloThreshold}`,
    { method: "POST" }
  );
  return handleResponse(response);
}

export async function pollJob(jobId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/predictions/jobs/${jobId}`);
  
  if (response.status === 202) {
    // Still processing
    const retryAfter = response.headers.get("Retry-After") || "1";
    await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
    return pollJob(jobId); // Retry
  }

  if (response.status === 422) {
    const error = await response.json();
    throw new Error(error.message || "Validation error");
  }

  return handleResponse(response);
}

export async function getPredictionDetail(predictionId: number): Promise<any> {
  const response = await fetch(`${API_BASE}/predictions/jobs/${predictionId}`);
  
  if (response.status === 202) {
    throw new Error('예측이 아직 준비되지 않았습니다.');
  }
  
  if (response.status === 422) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || '예측에 실패했습니다.');
  }
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `서버 오류(${response.status})`);
  }
  
  return response.json();
}
