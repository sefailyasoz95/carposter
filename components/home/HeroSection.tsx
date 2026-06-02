"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-red-600/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/8 blur-3xl animate-pulse [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-red-700/5 blur-3xl" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(220,38,38,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center mb-6">
          <Badge className="gap-1.5 px-4 py-1.5 text-sm">
            <Zap className="h-3.5 w-3.5 fill-red-600" />
            AI-Powered Car Posters
          </Badge>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
          Turn Your{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-blue-500 bg-clip-text text-transparent">
              Ride
            </span>
          </span>
          <br />
          Into{" "}
          <span className="text-white">
            Art
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Upload your car photo, choose a poster style, and let AI transform it into a stunning
          print-quality artwork. From cinematic to retro, we have every vibe.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/create">
            <Button size="xl" className="group shadow-2xl shadow-red-600/30">
              <Sparkles className="h-5 w-5" />
              Create Your Poster
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/gallery">
            <Button size="xl" variant="outline" className="border-zinc-600 text-zinc-200 hover:text-white hover:border-zinc-400 hover:bg-white/5 bg-transparent">
              See Examples
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-zinc-400 text-sm">
          {[
            { value: "10K+", label: "Posters Created" },
            { value: "50+", label: "Unique Styles" },
            { value: "4.9★", label: "Average Rating" },
            { value: "< 60s", label: "Generation Time" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-zinc-100">{value}</p>
              <p className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
