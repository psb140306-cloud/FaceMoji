import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requestGeneration } from "@/lib/api/ai-server";
import { rateLimit } from "@/lib/rate-limit";

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

  // Rate limiting: 사용자당 시간당 5회
  const { success } = rateLimit(`generate:${user.id}`, 5);
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." } },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { imageUrl, style, pipaConsent } = body;

  if (!imageUrl || !style) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "이미지와 스타일을 선택해 주세요" } },
      { status: 400 },
    );
  }

  if (!pipaConsent) {
    return NextResponse.json(
      { error: { code: "CONSENT_REQUIRED", message: "개인정보 처리 동의가 필요합니다" } },
      { status: 400 },
    );
  }

  try {
    // 1. DB에 generation 레코드 생성
    const { data: generation, error: dbError } = await supabase
      .from("fm_generations")
      .insert({
        user_id: user.id,
        style,
        status: "pending",
        source_image_path: imageUrl,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. 동의 기록 저장
    await supabase.from("fm_consent_logs").insert({
      user_id: user.id,
      consent_type: "face_processing",
      consent_version: "1.0",
      is_agreed: true,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    });

    // 3. FastAPI AI 서버에 생성 요청
    const aiResult = await requestGeneration({
      imageUrl,
      style,
      userId: user.id,
      generationId: generation.id,
    });

    // 4. generation에 job_id 메모 (status update)
    await supabase
      .from("fm_generations")
      .update({ status: "processing" })
      .eq("id", generation.id);

    return NextResponse.json({
      generationId: generation.id,
      jobId: aiResult.job_id,
      status: "processing",
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: { code: "GENERATION_FAILED", message: "이모티콘 생성을 시작할 수 없습니다" } },
      { status: 500 },
    );
  }
}
