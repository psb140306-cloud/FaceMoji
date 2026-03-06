"use client";

import { useEffect, useRef, useCallback } from "react";
import { Canvas, FabricText, FabricImage, Rect, Triangle } from "fabric";
import { useEditorStore } from "@/stores/editor-store";
import { EDITOR_CANVAS_SIZE } from "@/lib/utils/editor-constants";

interface StickerCanvasProps {
  imageUrl: string;
  stickerIndex: number;
}

export function StickerCanvas({ imageUrl, stickerIndex }: StickerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const { textOverlays } = useEditorStore();

  const initCanvas = useCallback(async () => {
    if (!canvasRef.current) return;

    // 기존 캔버스 정리
    if (fabricRef.current) {
      fabricRef.current.dispose();
    }

    const canvas = new Canvas(canvasRef.current, {
      width: EDITOR_CANVAS_SIZE.width,
      height: EDITOR_CANVAS_SIZE.height,
      backgroundColor: "transparent",
    });

    fabricRef.current = canvas;

    // 배경 이미지 로드
    try {
      const img = await FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" });
      const scaleX = EDITOR_CANVAS_SIZE.width / (img.width || 1);
      const scaleY = EDITOR_CANVAS_SIZE.height / (img.height || 1);
      const scale = Math.min(scaleX, scaleY);

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (EDITOR_CANVAS_SIZE.width - (img.width || 0) * scale) / 2,
        top: (EDITOR_CANVAS_SIZE.height - (img.height || 0) * scale) / 2,
        selectable: false,
        evented: false,
      });

      canvas.add(img);
      canvas.sendObjectToBack(img);
    } catch (err) {
      console.error("Failed to load sticker image:", err);
    }

    // 텍스트 오버레이 렌더링
    const overlays = textOverlays.get(stickerIndex) || [];
    for (const overlay of overlays) {
      if (overlay.hasBubble) {
        addBubbleToCanvas(canvas, overlay);
      }
      addTextToCanvas(canvas, overlay);
    }

    canvas.renderAll();
  }, [imageUrl, stickerIndex, textOverlays]);

  useEffect(() => {
    initCanvas();
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [initCanvas]);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-[url('/grid-pattern.svg')] bg-repeat">
      <canvas
        ref={canvasRef}
        className="mx-auto block"
        style={{
          maxWidth: "100%",
          height: "auto",
          aspectRatio: `${EDITOR_CANVAS_SIZE.width}/${EDITOR_CANVAS_SIZE.height}`,
        }}
      />
    </div>
  );
}

function addTextToCanvas(
  canvas: Canvas,
  overlay: { text: string; fontFamily: string; fontSize: number; color: string; x: number; y: number },
) {
  const text = new FabricText(overlay.text, {
    left: overlay.x,
    top: overlay.y,
    fontFamily: overlay.fontFamily,
    fontSize: overlay.fontSize,
    fill: overlay.color,
    textAlign: "center",
    originX: "center",
    originY: "center",
  });
  canvas.add(text);
}

function addBubbleToCanvas(
  canvas: Canvas,
  overlay: {
    text: string;
    fontFamily: string;
    fontSize: number;
    x: number;
    y: number;
    bubbleStyle: "basic" | "round" | "explosion";
  },
) {
  const padding = 20;
  const estimatedWidth = overlay.text.length * overlay.fontSize * 0.6 + padding * 2;
  const estimatedHeight = overlay.fontSize + padding * 2;

  let borderRadius = 12;
  if (overlay.bubbleStyle === "round") borderRadius = 999;
  if (overlay.bubbleStyle === "explosion") borderRadius = 0;

  const bubble = new Rect({
    left: overlay.x,
    top: overlay.y,
    width: estimatedWidth,
    height: estimatedHeight,
    rx: borderRadius,
    ry: borderRadius,
    fill: "white",
    stroke: "#333",
    strokeWidth: 3,
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
  });

  // 말풍선 꼬리
  const tail = new Triangle({
    left: overlay.x,
    top: overlay.y + estimatedHeight / 2 + 10,
    width: 20,
    height: 15,
    fill: "white",
    stroke: "#333",
    strokeWidth: 3,
    angle: 180,
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
  });

  canvas.add(bubble);
  canvas.add(tail);
}

export function exportCanvasAsBlob(canvasEl: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvasEl.toBlob((blob) => resolve(blob), "image/png");
  });
}
