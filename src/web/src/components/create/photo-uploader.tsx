"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Camera, CheckCircle2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateStore } from "@/stores/create-store";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const FACE_CHECKLIST = [
  "정면 얼굴이 보여요",
  "얼굴이 선명해요",
  "배경이 단순해요",
];

export function PhotoUploader() {
  const { uploadedImageUrl, setUploadedImage } = useCreateStore();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("JPG, PNG, WebP 파일만 업로드 가능합니다.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("10MB 이하 이미지를 업로드해 주세요.");
        return;
      }
      const url = URL.createObjectURL(file);
      setUploadedImage(file, url);
    },
    [setUploadedImage],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const clearImage = useCallback(() => {
    useCreateStore.setState({ uploadedImage: null, uploadedImageUrl: null });
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [],
  );

  if (uploadedImageUrl) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-48 w-48 overflow-hidden rounded-full ring-4 ring-primary/20">
            <Image
              src={uploadedImageUrl}
              alt="업로드된 사진"
              width={192}
              height={192}
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-1 -top-1 h-8 w-8 rounded-full"
            onClick={clearImage}
            aria-label="사진 삭제"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 얼굴 감지 체크리스트 */}
        <div className="w-full max-w-xs space-y-1.5">
          {FACE_CHECKLIST.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          사진이 잘 안 나왔다면 다시 업로드해 주세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="사진 업로드 영역. 클릭하거나 드래그하세요."
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full max-w-sm cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error && "border-destructive",
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-7 w-7" />
        </div>
        <div className="text-center">
          <p className="font-medium">사진을 드래그하거나 클릭해 업로드</p>
          <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP / 최대 10MB</p>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}

      {/* 모바일: 카메라 촬영 버튼 */}
      <div className="flex gap-3 md:hidden">
        <Button
          variant="outline"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.capture = "user";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleFile(file);
            };
            input.click();
          }}
        >
          <Camera className="mr-2 h-4 w-4" />
          셀카 촬영
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
