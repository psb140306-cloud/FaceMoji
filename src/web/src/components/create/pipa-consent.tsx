"use client";

import { useCreateStore } from "@/stores/create-store";
import { Shield } from "lucide-react";
import Link from "next/link";

export function PipaConsent() {
  const { pipaConsented, setPipaConsented } = useCreateStore();

  return (
    <div className="w-full max-w-sm space-y-3 rounded-xl bg-muted/50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Shield className="h-4 w-4 text-primary" />
        개인정보 처리 동의
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={pipaConsented}
          onChange={(e) => setPipaConsented(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary"
        />
        <span className="text-sm text-muted-foreground">
          얼굴 사진의 수집 및 AI 이모티콘 생성 목적 이용에 동의합니다. 사진은 생성 완료 후 즉시
          삭제됩니다.{" "}
          <Link href="/legal/privacy" className="underline hover:text-foreground" target="_blank">
            개인정보처리방침
          </Link>
        </span>
      </label>
    </div>
  );
}
