import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8000";
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY || "";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요해요" } },
      { status: 401 },
    );
  }

  // Rate limiting: 재생성은 시간당 10회
  const { success: rateLimitOk } = rateLimit(`regenerate:${user.id}`, 10);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." } },
      { status: 429 },
    );
  }

  const { generationId, expression, customPrompt } = await request.json();

  if (!generationId || !expression) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "generation ID와 표정이 필요합니다" } },
      { status: 400 },
    );
  }

  // generation 소유권 + 결제 확인
  const { data: generation } = await supabase
    .from("fm_generations")
    .select("id, user_id, is_paid, style, source_image_path")
    .eq("id", generationId)
    .single();

  if (!generation || generation.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "권한이 없습니다" } },
      { status: 403 },
    );
  }

  if (!generation.is_paid) {
    return NextResponse.json(
      { error: { code: "NOT_PAID", message: "결제 후 재생성이 가능합니다" } },
      { status: 402 },
    );
  }

  try {
    // AI 서버에 단일 스티커 재생성 요청
    const res = await fetch(`${AI_SERVER_URL}/ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": AI_SERVER_API_KEY,
      },
      body: JSON.stringify({
        image_url: generation.source_image_path,
        style: generation.style,
        user_id: user.id,
        generation_id: generationId,
        expressions: [expression],
        custom_prompt: customPrompt || undefined,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI server error: ${res.status}`);
    }

    const result = await res.json();

    return NextResponse.json({
      jobId: result.job_id,
      expression,
      status: "processing",
    });
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json(
      { error: { code: "REGENERATE_FAILED", message: "재생성에 실패했습니다" } },
      { status: 500 },
    );
  }
}
