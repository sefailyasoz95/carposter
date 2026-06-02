"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import type { PosterStyle } from "@/types";

interface StyleSelectorProps {
  styles: PosterStyle[];
  selected: PosterStyle | null;
  onSelect: (style: PosterStyle) => void;
}

export function StyleSelector({ styles, selected, onSelect }: StyleSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (styles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <Sparkles className="h-10 w-10 text-zinc-400" />
        <p className="text-zinc-500 dark:text-zinc-400">No poster styles available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {styles.map((style) => {
        const isSelected = selected?.id === style.id;
        const isHovered = hovered === style.id;

        return (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            onMouseEnter={() => setHovered(style.id)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "group relative flex flex-col rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
              isSelected
                ? "border-orange-500 shadow-xl shadow-orange-500/20"
                : "border-zinc-200 dark:border-zinc-800 hover:border-orange-400/50 hover:shadow-lg dark:hover:border-orange-500/30"
            )}
          >
            {/* Example image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              {style.example_image_url ? (
                <Image
                  src={style.example_image_url}
                  alt={style.name}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-500",
                    isHovered && "scale-105"
                  )}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                </div>
              )}

              {/* Price badge */}
              <div className="absolute bottom-3 left-3">
                <Badge className="text-xs font-bold">
                  {formatPrice(style.price_cents)}
                </Badge>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 p-4 bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                  {style.name}
                </h3>
                <Star
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors",
                    isSelected ? "text-orange-500 fill-orange-500" : "text-zinc-300 dark:text-zinc-700"
                  )}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                {style.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
