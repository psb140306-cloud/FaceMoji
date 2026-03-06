"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateStore } from "@/stores/create-store";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    useCreateStore.getState().setUploadedImage(null as unknown as File, "");
    useCreateStore.setState({ uploadedImage: null, uploadedImageUrl: null });
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
  }, []);

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
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">얼굴이 잘 보이는 정면 사진이에요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "flex w-full max-w-sm cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error && "border-destructive",
        )}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-7 w-7" />
        </div>
        <div className="text-center">
          <p className="font-medium">사진을 드래그하거나 클릭해 업로드</p>
          <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP / 최대 10MB</p>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

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
      />
    </div>
  );
}
