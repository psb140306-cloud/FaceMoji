const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8000";
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY || "";

interface RequestGenerationParams {
  imageUrl: string;
  style: string;
  userId: string;
  generationId: string;
  expressions?: string[];
}

interface GenerateJobResponse {
  job_id: string;
  estimated_time: number;
}

interface CompletedSticker {
  expression: string;
  sort_order: number;
  image_url: string | null;
}

interface JobStatusResponse {
  job_id: string;
  generation_id: string;
  status: string;
  progress: number;
  total: number;
  completed_stickers: CompletedSticker[];
  errors: string[];
}

export async function requestGeneration(params: RequestGenerationParams): Promise<GenerateJobResponse> {
  const res = await fetch(`${AI_SERVER_URL}/ai/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": AI_SERVER_API_KEY,
    },
    body: JSON.stringify({
      image_url: params.imageUrl,
      style: params.style,
      user_id: params.userId,
      generation_id: params.generationId,
      expressions: params.expressions,
    }),
  });

  if (!res.ok) {
    throw new Error(`AI server error: ${res.status}`);
  }

  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${AI_SERVER_URL}/ai/status/${jobId}`, {
    headers: {
      "X-API-Key": AI_SERVER_API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`AI server error: ${res.status}`);
  }

  return res.json();
}
