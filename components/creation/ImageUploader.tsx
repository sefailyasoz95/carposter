"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrCreateSessionId } from "@/lib/utils";

interface ImageUploaderProps {
  onUploadComplete: (imageUrl: string, file: File) => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);

      const sessionId = getOrCreateSessionId();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionId);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        onUploadComplete(data.url, file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      setPreview(url);
      setSelectedFile(file);
      handleUpload(file);
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: uploading,
  });

  const reset = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer",
            isDragActive
              ? "border-orange-500 bg-orange-500/5 scale-[1.01]"
              : "border-zinc-300 dark:border-zinc-700 hover:border-orange-400 hover:bg-orange-500/5 dark:hover:border-orange-500/50"
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl transition-all",
                isDragActive
                  ? "bg-orange-500 text-white scale-110"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              )}
            >
              {isDragActive ? (
                <ImageIcon className="h-7 w-7" />
              ) : (
                <Upload className="h-7 w-7" />
              )}
            </div>

            <div>
              <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                {isDragActive ? "Drop your car photo here" : "Upload your car photo"}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Drag & drop or{" "}
                <span className="text-orange-500 font-medium">browse files</span>
              </p>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                JPG, PNG, WebP · Max 20MB · Best at 1:1 or 16:9
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 aspect-video">
          <Image
            src={preview}
            alt="Car preview"
            fill
            className="object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-semibold">Uploading…</span>
            </div>
          )}
          {!uploading && (
            <button
              onClick={reset}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
        <ImageIcon className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <span className="font-semibold">Pro tip:</span> Use a clear, well-lit photo with your car as the main subject.
          Side or 3/4 angle shots produce the best posters.
        </p>
      </div>
    </div>
  );
}
