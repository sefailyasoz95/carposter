"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Download, Share2, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { GenerationStatus } from "@/types";

interface ResultStepProps {
	orderId: string;
	onRestart: () => void;
}

const GENERATION_STEPS = ["Analyzing photo", "Applying style", "Rendering poster"];

// Each step auto-advances after this many ms from mount
const STEP_TIMINGS = [8_000, 25_000];

export function ResultStep({ orderId, onRestart }: ResultStepProps) {
	const [status, setStatus] = useState<GenerationStatus>("pending");
	const [posterUrl, setPosterUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [activeStep, setActiveStep] = useState(0);
	const [progress, setProgress] = useState(8);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Auto-advance generation steps on a timer for visual feedback
	useEffect(() => {
		const timers = STEP_TIMINGS.map((delay, i) => setTimeout(() => setActiveStep(i + 1), delay));
		return () => timers.forEach(clearTimeout);
	}, []);

	// Smoothly creep progress bar toward ceiling; completed value derived at render
	useEffect(() => {
		if (status === "completed" || status === "failed") return;

		const ceiling = status === "pending" ? 25 : 88;
		const tick = setInterval(() => {
			setProgress((p) => {
				if (p >= ceiling) return p;
				return p + Math.max(0.4, (ceiling - p) * 0.08);
			});
		}, 600);
		return () => clearInterval(tick);
	}, [status]);

	const displayProgress = status === "completed" ? 100 : progress;

	// Poll order status
	useEffect(() => {
		const poll = async () => {
			try {
				const res = await fetch(`/api/orders/${orderId}`);
				const data = await res.json();
				if (!res.ok) throw new Error(data.error ?? "Failed to check status");

				setStatus(data.generation_status);

				if (data.generation_status === "completed") {
					setPosterUrl(data.generated_poster_url);
					setActiveStep(GENERATION_STEPS.length - 1);
					if (intervalRef.current) clearInterval(intervalRef.current);
				} else if (data.generation_status === "failed") {
					setError(data.error_message ?? "Generation failed. Please try again.");
					if (intervalRef.current) clearInterval(intervalRef.current);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Something went wrong");
				if (intervalRef.current) clearInterval(intervalRef.current);
			}
		};

		poll();
		intervalRef.current = setInterval(poll, 3000);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [orderId]);

	const handleDownload = async () => {
		if (!posterUrl) return;
		const res = await fetch(posterUrl);
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `carposter-${orderId.slice(0, 8)}.png`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleShare = async () => {
		if (!posterUrl) return;
		if (navigator.share) {
			await navigator.share({ title: "My Car Poster", url: posterUrl });
		} else {
			await navigator.clipboard.writeText(posterUrl);
		}
	};

	if (status === "failed") {
		return (
			<div className='flex flex-col items-center gap-6 py-8 text-center'>
				<div className='h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center'>
					<AlertCircle className='h-8 w-8 text-red-500' />
				</div>
				<div>
					<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100'>Generation Failed</h3>
					<p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>{error}</p>
				</div>
				<Button onClick={onRestart} variant='outline'>
					<RefreshCw className='h-4 w-4' />
					Try Again
				</Button>
			</div>
		);
	}

	if (status === "completed" && posterUrl) {
		return (
			<div className='flex flex-col gap-6'>
				<div className='flex items-center justify-center gap-2 text-emerald-500'>
					<CheckCircle2 className='h-5 w-5 fill-emerald-500/20' />
					<span className='font-semibold text-sm'>Poster generated successfully!</span>
				</div>

				<div className='relative rounded-2xl overflow-hidden shadow-2xl shadow-red-600/10 border border-zinc-200 dark:border-zinc-800 aspect-square group'>
					<Image src={posterUrl} alt='Generated car poster' fill className='object-cover' />
					<div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
				</div>

				<div className='flex flex-col sm:flex-row gap-3'>
					<Button size='lg' className='flex-1' onClick={handleDownload}>
						<Download className='h-4 w-4' />
						Download Poster
					</Button>
					<Button size='lg' variant='outline' className='flex-1' onClick={handleShare}>
						<Share2 className='h-4 w-4' />
						Share
					</Button>
				</div>

				<Button variant='ghost' size='sm' onClick={onRestart} className='w-full'>
					<Sparkles className='h-4 w-4' />
					Create Another Poster
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col items-center gap-8 py-8'>
			{/* Animated icon */}
			<div className='relative'>
				<div className='h-24 w-24 rounded-full bg-red-600/10 flex items-center justify-center'>
					<div className='h-16 w-16 rounded-full bg-red-600/20 flex items-center justify-center animate-pulse'>
						<Sparkles className='h-8 w-8 text-red-600' />
					</div>
				</div>
				<div className='absolute inset-0 rounded-full border-2 border-red-600/30 animate-ping' />
			</div>

			<div className='w-full max-w-sm space-y-3 text-center'>
				<p className='font-semibold text-zinc-900 dark:text-zinc-100'>
					{status === "pending" ? "Queued for generation…" : "AI is painting your poster…"}
				</p>
				<Progress value={displayProgress} className='h-2' />
				<p className='text-xs text-zinc-400'>
					{status === "pending" ? "Your order is in the queue" : "AI is working its magic — this takes ~60-100 seconds"}
				</p>
			</div>

			{/* Step indicators */}
			<div className='grid grid-cols-3 gap-3 w-full max-w-xs'>
				{GENERATION_STEPS.map((label, i) => {
					const isDone = status === "completed" || i < activeStep;
					const isActive = i === activeStep && status !== "completed";
					const isWaiting = i > activeStep && status !== "completed";

					return (
						<div
							key={label}
							className={cn(
								"rounded-xl p-3 text-center text-xs font-medium border transition-all duration-500",
								isDone && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
								isActive && "border-red-600/40 bg-red-600/10 text-red-600 shadow-sm shadow-red-600/10",
								isWaiting && "border-zinc-200 dark:border-zinc-800 text-zinc-400",
							)}>
							{isDone ? (
								<span className='flex items-center justify-center gap-1'>
									<Check className='h-3 w-3' strokeWidth={3} />
									{label}
								</span>
							) : (
								label
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
