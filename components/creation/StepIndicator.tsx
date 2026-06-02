"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreationStep } from "@/types";

const STEPS: { id: CreationStep; label: string; number: number }[] = [
  { id: "upload", label: "Upload", number: 1 },
  { id: "style", label: "Style", number: 2 },
  { id: "payment", label: "Payment", number: 3 },
  { id: "result", label: "Result", number: 4 },
];

const ORDER: CreationStep[] = ["upload", "style", "payment", "result"];

interface StepIndicatorProps {
  currentStep: CreationStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center w-full">
      {STEPS.map((step, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                  isPast && "bg-red-600 border-red-600 text-white",
                  isCurrent &&
                    "bg-red-600/10 border-red-600 text-red-600 shadow-lg shadow-red-600/20",
                  !isPast && !isCurrent && "bg-transparent border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
                )}
              >
                {isPast ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isCurrent && "text-red-600",
                  isPast && "text-zinc-700 dark:text-zinc-300",
                  !isPast && !isCurrent && "text-zinc-400 dark:text-zinc-600"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="mx-2 mb-5 h-0.5 w-12 sm:w-20 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{ width: isPast ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
