"use client";

import { useEditorStore } from "@/stores/editor-store";
import { FONTS, BUBBLE_STYLES, TEXT_MAX_LENGTH } from "@/lib/utils/editor-constants";
import { Button } from "@/components/ui/button";
import { Type, MessageCircle, Plus, Minus } from "lucide-react";

export function EditorToolbar() {
  const {
    currentText,
    currentFont,
    currentFontSize,
    currentColor,
    currentBubbleStyle,
    selectedStickerIndex,
    setCurrentText,
    setCurrentFont,
    setCurrentFontSize,
    setCurrentColor,
    setCurrentBubbleStyle,
    addTextOverlay,
  } = useEditorStore();

  const handleAddText = () => {
    if (!currentText.trim()) return;

    addTextOverlay(selectedStickerIndex, {
      id: crypto.randomUUID(),
      text: currentText,
      fontFamily: currentFont,
      fontSize: currentFontSize,
      color: currentColor,
      x: 370,
      y: 560,
      hasBubble: currentBubbleStyle !== null,
      bubbleStyle: currentBubbleStyle || "basic",
    });

    setCurrentText("");
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      {/* 텍스트 입력 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
          <Type className="h-4 w-4" />
          텍스트
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentText}
            onChange={(e) => {
              if (e.target.value.length <= TEXT_MAX_LENGTH) {
                setCurrentText(e.target.value);
              }
            }}
            placeholder="최대 10자"
            maxLength={TEXT_MAX_LENGTH}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <Button size="sm" onClick={handleAddText} disabled={!currentText.trim()}>
            추가
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {currentText.length}/{TEXT_MAX_LENGTH}
        </p>
      </div>

      {/* 폰트 선택 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">폰트</label>
        <div className="flex gap-2">
          {FONTS.map((font) => (
            <button
              key={font.key}
              onClick={() => setCurrentFont(font.family)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                currentFont === font.family
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "hover:bg-muted"
              }`}
              style={{ fontFamily: font.family }}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* 글자 크기 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">크기</label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentFontSize(Math.max(16, currentFontSize - 4))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="min-w-[3ch] text-center text-sm font-medium">{currentFontSize}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentFontSize(Math.min(96, currentFontSize + 4))}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 색상 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">색상</label>
        <div className="flex gap-2">
          {["#000000", "#FFFFFF", "#FF4D3A", "#FFB800", "#00B894", "#0984E3", "#6C5CE7"].map(
            (color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`h-8 w-8 rounded-full border-2 transition-transform ${
                  currentColor === color ? "scale-110 border-primary" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ),
          )}
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-full"
          />
        </div>
      </div>

      {/* 말풍선 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
          <MessageCircle className="h-4 w-4" />
          말풍선
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentBubbleStyle(null)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              currentBubbleStyle === null
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "hover:bg-muted"
            }`}
          >
            없음
          </button>
          {BUBBLE_STYLES.map((style) => (
            <button
              key={style.key}
              onClick={() => setCurrentBubbleStyle(style.key)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                currentBubbleStyle === style.key
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
