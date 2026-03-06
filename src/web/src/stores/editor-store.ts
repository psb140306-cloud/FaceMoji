import { create } from "zustand";

interface TextOverlay {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  hasBubble: boolean;
  bubbleStyle: "basic" | "round" | "explosion";
}

interface EditorStore {
  generationId: string | null;
  selectedStickerIndex: number;
  textOverlays: Map<number, TextOverlay[]>;
  currentText: string;
  currentFont: string;
  currentFontSize: number;
  currentColor: string;
  currentBubbleStyle: "basic" | "round" | "explosion" | null;
  isDirty: boolean;

  setGenerationId: (id: string) => void;
  setSelectedStickerIndex: (index: number) => void;
  setCurrentText: (text: string) => void;
  setCurrentFont: (font: string) => void;
  setCurrentFontSize: (size: number) => void;
  setCurrentColor: (color: string) => void;
  setCurrentBubbleStyle: (style: "basic" | "round" | "explosion" | null) => void;
  addTextOverlay: (stickerIndex: number, overlay: TextOverlay) => void;
  removeTextOverlay: (stickerIndex: number, overlayId: string) => void;
  updateTextOverlay: (stickerIndex: number, overlayId: string, updates: Partial<TextOverlay>) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

const initialState = {
  generationId: null as string | null,
  selectedStickerIndex: 0,
  textOverlays: new Map<number, TextOverlay[]>(),
  currentText: "",
  currentFont: "Pretendard",
  currentFontSize: 48,
  currentColor: "#000000",
  currentBubbleStyle: null as "basic" | "round" | "explosion" | null,
  isDirty: false,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setGenerationId: (id) => set({ generationId: id }),
  setSelectedStickerIndex: (index) => set({ selectedStickerIndex: index }),
  setCurrentText: (text) => set({ currentText: text }),
  setCurrentFont: (font) => set({ currentFont: font }),
  setCurrentFontSize: (size) => set({ currentFontSize: size }),
  setCurrentColor: (color) => set({ currentColor: color }),
  setCurrentBubbleStyle: (style) => set({ currentBubbleStyle: style }),

  addTextOverlay: (stickerIndex, overlay) => {
    const overlays = new Map(get().textOverlays);
    const list = overlays.get(stickerIndex) || [];
    overlays.set(stickerIndex, [...list, overlay]);
    set({ textOverlays: overlays, isDirty: true });
  },

  removeTextOverlay: (stickerIndex, overlayId) => {
    const overlays = new Map(get().textOverlays);
    const list = overlays.get(stickerIndex) || [];
    overlays.set(stickerIndex, list.filter((o) => o.id !== overlayId));
    set({ textOverlays: overlays, isDirty: true });
  },

  updateTextOverlay: (stickerIndex, overlayId, updates) => {
    const overlays = new Map(get().textOverlays);
    const list = overlays.get(stickerIndex) || [];
    overlays.set(
      stickerIndex,
      list.map((o) => (o.id === overlayId ? { ...o, ...updates } : o)),
    );
    set({ textOverlays: overlays, isDirty: true });
  },

  setDirty: (dirty) => set({ isDirty: dirty }),
  reset: () => set(initialState),
}));
