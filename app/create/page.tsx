"use client";

import { useState, useEffect, useCallback } from "react";
import { StepIndicator } from "@/components/creation/StepIndicator";
import { ImageUploader } from "@/components/creation/ImageUploader";
import { StyleSelector } from "@/components/creation/StyleSelector";
import { PaymentStep } from "@/components/creation/PaymentStep";
import { ResultStep } from "@/components/creation/ResultStep";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreationStep, CreationState, PosterStyle } from "@/types";

const ORDER: CreationStep[] = ["upload", "style", "payment", "result"];

const STEP_TITLES: Record<CreationStep, { title: string; subtitle: string }> = {
  upload: {
    title: "Upload your car",
    subtitle: "Start with a clear photo — the better the shot, the better the poster.",
  },
  style: {
    title: "Choose a poster style",
    subtitle: "Pick the aesthetic that matches your car's personality.",
  },
  payment: {
    title: "Secure payment",
    subtitle: "One-time payment — your poster is generated immediately after.",
  },
  result: {
    title: "Your poster",
    subtitle: "Download and share your AI-generated car poster.",
  },
};

export default function CreatePage() {
  const [state, setState] = useState<CreationState>({
    step: "upload",
    uploadedImageUrl: null,
    uploadedImageFile: null,
    selectedStyle: null,
    orderId: null,
    generatedPosterUrl: null,
  });
  const [styles, setStyles] = useState<PosterStyle[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);

  const currentIndex = ORDER.indexOf(state.step);
  const { title, subtitle } = STEP_TITLES[state.step];

  useEffect(() => {
    if (state.step === "style" && styles.length === 0) {
      setStylesLoading(true);
      fetch("/api/poster-styles")
        .then((r) => r.json())
        .then(setStyles)
        .catch(console.error)
        .finally(() => setStylesLoading(false));
    }
  }, [state.step, styles.length]);

  const goNext = useCallback(() => {
    const next = ORDER[currentIndex + 1];
    if (next) setState((s) => ({ ...s, step: next }));
  }, [currentIndex]);

  const goBack = useCallback(() => {
    const prev = ORDER[currentIndex - 1];
    if (prev) setState((s) => ({ ...s, step: prev }));
  }, [currentIndex]);

  const canProceed = useCallback(() => {
    if (state.step === "upload") return !!state.uploadedImageUrl;
    if (state.step === "style") return !!state.selectedStyle;
    return false;
  }, [state]);

  const handleRestart = () => {
    setState({
      step: "upload",
      uploadedImageUrl: null,
      uploadedImageFile: null,
      selectedStyle: null,
      orderId: null,
      generatedPosterUrl: null,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Step indicator */}
        <div className="mb-10">
          <StepIndicator currentStep={state.step} />
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl dark:shadow-zinc-950/50 overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-6 pb-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-7 w-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100">{title}</h1>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-10">{subtitle}</p>
          </div>

          {/* Card body */}
          <div className="p-6">
            {state.step === "upload" && (
              <ImageUploader
                onUploadComplete={(url, file) =>
                  setState((s) => ({ ...s, uploadedImageUrl: url, uploadedImageFile: file }))
                }
              />
            )}

            {state.step === "style" && (
              <>
                {stylesLoading ? (
                  <div className="flex items-center justify-center py-16 gap-3 text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading styles…</span>
                  </div>
                ) : (
                  <StyleSelector
                    styles={styles}
                    selected={state.selectedStyle}
                    onSelect={(s) => setState((prev) => ({ ...prev, selectedStyle: s }))}
                  />
                )}
              </>
            )}

            {state.step === "payment" && state.selectedStyle && state.uploadedImageUrl && (
              <PaymentStep
                style={state.selectedStyle}
                uploadedImageUrl={state.uploadedImageUrl}
                onSuccess={(orderId) =>
                  setState((s) => ({ ...s, orderId, step: "result" }))
                }
              />
            )}

            {state.step === "result" && state.orderId && (
              <ResultStep orderId={state.orderId} onRestart={handleRestart} />
            )}
          </div>

          {/* Card footer navigation */}
          {state.step !== "payment" && state.step !== "result" && (
            <div
              className={cn(
                "flex items-center px-6 py-5 border-t border-zinc-100 dark:border-zinc-800",
                currentIndex === 0 ? "justify-end" : "justify-between"
              )}
            >
              {currentIndex > 0 && (
                <Button variant="ghost" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <Button onClick={goNext} disabled={!canProceed()}>
                {state.step === "style" ? "Continue to Payment" : "Next Step"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
