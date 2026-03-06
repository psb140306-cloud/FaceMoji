import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const { data: payment, error } = await supabase
    .from("fm_payments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !payment) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "결제 정보를 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  return NextResponse.json(payment);
}
