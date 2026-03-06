"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StickerCanvas } from "@/components/editor/sticker-canvas";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { useEditorStore } from "@/stores/editor-store";
import { ArrowLeft, Download, Loader2, Save } from "lucide-react";

interface StickerData {
  expression: string;
  sortOrder: number;
  url: string;
}

export default function EditorPage() {
  const params = useParams<{ generationId: string }>();
  const router = useRouter();
  const { selectedStickerIndex, setSelectedStickerIndex, setGenerationId } = useEditorStore();
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGenerationId(params.generationId);

    async function loadStickers() {
      try {
        const res = await fetch(`/api/download/${params.generationId}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error?.message || "스티커를 불러올 수 없습니다");
          return;
        }
        const data = await res.json();
        setStickers(data.stickers);
      } catch {
        setError("스티커를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    }

    loadStickers();
  }, [params.generationId, setGenerationId]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Canvas를 이미지로 export → Storage에 업로드
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-medium text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  const currentSticker = stickers[selectedStickerIndex];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* 상단 바 */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          이전으로
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            저장
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* 메인 캔버스 */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">
            {currentSticker?.expression || "이모티콘"} 편집
          </h2>
          {currentSticker && (
            <StickerCanvas
              imageUrl={currentSticker.url}
              stickerIndex={selectedStickerIndex}
            />
          )}
        </div>

        {/* 오른쪽 패널 */}
        <div className="space-y-4">
          <EditorToolbar />
        </div>
      </div>

      {/* 하단 스티커 목록 */}
      <div className="mt-6">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">전체 스티커</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stickers.map((sticker, index) => (
            <button
              key={sticker.sortOrder}
              onClick={() => setSelectedStickerIndex(index)}
              className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === selectedStickerIndex
                  ? "border-primary shadow-md"
                  : "border-transparent hover:border-muted-foreground/20"
              }`}
            >
              <img
                src={sticker.url}
                alt={sticker.expression}
                className="h-16 w-16 object-contain"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
