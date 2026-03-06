import { create } from "zustand";
import type { StyleType } from "@/types/database";

type Step = "upload" | "style" | "progress" | "result";

interface CreateStore {
  step: Step;
  uploadedImage: File | null;
  uploadedImageUrl: string | null;
  selectedStyle: StyleType | null;
  generationId: string | null;
  pipaConsented: boolean;

  setStep: (step: Step) => void;
  setUploadedImage: (file: File, url: string) => void;
  setSelectedStyle: (style: StyleType) => void;
  setGenerationId: (id: string) => void;
  setPipaConsented: (consented: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: "upload" as Step,
  uploadedImage: null,
  uploadedImageUrl: null,
  selectedStyle: null,
  generationId: null,
  pipaConsented: false,
};

export const useCreateStore = create<CreateStore>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setUploadedImage: (file, url) => set({ uploadedImage: file, uploadedImageUrl: url }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setGenerationId: (id) => set({ generationId: id }),
  setPipaConsented: (consented) => set({ pipaConsented: consented }),
  reset: () => set(initialState),
}));
