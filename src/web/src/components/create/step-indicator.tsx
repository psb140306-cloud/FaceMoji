"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: { label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                i < currentStep && "bg-primary text-white",
                i === currentStep && "bg-primary text-white ring-4 ring-primary/20",
                i > currentStep && "bg-muted text-muted-foreground",
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                i === currentStep ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn("h-0.5 w-8 md:w-12", i < currentStep ? "bg-primary" : "bg-muted")}
            />
          )}
        </div>
      ))}
    </div>
  );
}
