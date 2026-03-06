"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/create/step-indicator";
import { PhotoUploader } from "@/components/create/photo-uploader";
import { PipaConsent } from "@/components/create/pipa-consent";
import { useCreateStore } from "@/stores/create-store";

const STEPS = [{ label: "사진 업로드" }, { label: "스타일 선택" }, { label: "생성" }];

export default function CreatePage() {
  const router = useRouter();
  const { uploadedImage, pipaConsented } = useCreateStore();

  const canProceed = uploadedImage && pipaConsented;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <StepIndicator steps={STEPS} currentStep={0} />

      <div className="mt-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">셀카를 업로드하세요</h1>
          <p className="mt-2 text-muted-foreground">정면 얼굴이 잘 보이는 사진이 좋아요</p>
        </div>

        <PhotoUploader />
        <PipaConsent />

        <Button
          size="lg"
          className="w-full max-w-sm text-base font-semibold"
          disabled={!canProceed}
          onClick={() => router.push("/create/style")}
        >
          다음: 스타일 선택
        </Button>
      </div>
    </div>
  );
}
