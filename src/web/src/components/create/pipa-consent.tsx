"use client";

import { useCreateStore } from "@/stores/create-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import Link from "next/link";

export function PipaConsent() {
  const {
    pipaConsented,
    setPipaConsented,
    pipaTransferConsented,
    setPipaTransferConsented,
  } = useCreateStore();

  return (
    <div className="w-full max-w-sm space-y-3 rounded-xl bg-muted/50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Shield className="h-4 w-4 text-primary" />
        개인정보 처리 동의
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="pipa-collect"
          checked={pipaConsented}
          onCheckedChange={(checked) => setPipaConsented(checked === true)}
        />
        <label htmlFor="pipa-collect" className="cursor-pointer text-sm leading-relaxed text-muted-foreground">
          [필수] 얼굴 사진의 수집 및 AI 이모티콘 생성 목적 이용에 동의합니다.
          사진은 생성 완료 후 즉시 삭제됩니다.{" "}
          <Link href="/legal/privacy" className="underline hover:text-foreground" target="_blank">
            개인정보처리방침
          </Link>
        </label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="pipa-transfer"
          checked={pipaTransferConsented}
          onCheckedChange={(checked) => setPipaTransferConsented(checked === true)}
        />
        <label htmlFor="pipa-transfer" className="cursor-pointer text-sm leading-relaxed text-muted-foreground">
          [필수] 얼굴 사진의 해외 이전(AI 서버)에 동의합니다.
          이전 국가: 미국, 목적: AI 이모티콘 생성, 보유기간: 생성 완료 즉시 삭제.
        </label>
      </div>
    </div>
  );
}
