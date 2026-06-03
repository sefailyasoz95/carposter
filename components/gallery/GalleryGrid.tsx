"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { PosterStyle } from "@/types";

interface LightboxImage {
	src: string;
	alt: string;
}

interface GalleryGridProps {
	styles: PosterStyle[];
}

export function GalleryGrid({ styles }: GalleryGridProps) {
	const [lightbox, setLightbox] = useState<LightboxImage | null>(null);

	useEffect(() => {
		if (!lightbox) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setLightbox(null);
		};
		document.addEventListener("keydown", handleKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKey);
			document.body.style.overflow = "";
		};
	}, [lightbox]);

	return (
		<>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
				{styles.map((style) => (
					<div
						key={style.id}
						className='group rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-red-600/30 hover:shadow-xl dark:hover:shadow-red-600/5 transition-all duration-300'>
						{/* Main example image */}
						<div
							className='relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden cursor-pointer'
							onClick={() => style.example_image_url && setLightbox({ src: style.example_image_url, alt: style.name })}>
							{style.example_image_url ? (
								<>
									<Image
										src={style.example_image_url}
										alt={style.name}
										fill
										className='object-cover transition-transform duration-700 group-hover:scale-105'
									/>
									<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
									<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
										<div className='bg-black/50 rounded-full p-3'>
											<ZoomIn className='h-6 w-6 text-white' />
										</div>
									</div>
								</>
							) : (
								<div className='absolute inset-0 flex items-center justify-center'>
									<Sparkles className='h-12 w-12 text-zinc-300 dark:text-zinc-700' />
								</div>
							)}
							<div className='absolute bottom-3 left-3'>
								<Badge variant='outline'>{formatPrice(style.price_cents)}</Badge>
							</div>
						</div>

						{/* Extra examples row */}
						{style.example_posters && style.example_posters.length > 0 && (
							<div className='flex gap-1.5 px-4 pt-3'>
								{style.example_posters.slice(0, 3).map((ex) => (
									<div
										key={ex.id}
										className='relative h-12 w-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer'
										onClick={() => setLightbox({ src: ex.image_url, alt: ex.title ?? style.name })}>
										<Image
											src={ex.image_url}
											alt={ex.title ?? ""}
											fill
											className='object-cover hover:scale-110 transition-transform duration-300'
										/>
									</div>
								))}
							</div>
						)}

						{/* Info */}
						<div className='p-5'>
							<h2 className='font-black text-lg text-zinc-900 dark:text-zinc-100 mb-1'>{style.name}</h2>
							<p className='text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4'>{style.description}</p>
							<Link href='/create'>
								<Button size='sm' className='w-full group/btn'>
									<Sparkles className='h-3.5 w-3.5' />
									Use This Style
									<ArrowRight className='h-3.5 w-3.5 ml-auto group-hover/btn:translate-x-0.5 transition-transform' />
								</Button>
							</Link>
						</div>
					</div>
				))}
			</div>

			{/* Lightbox */}
			{lightbox && (
				<div
					className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4'
					onClick={() => setLightbox(null)}>
					<button
						className='absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors'
						onClick={() => setLightbox(null)}
						aria-label='Close'>
						<X className='h-6 w-6 text-white' />
					</button>
					<div className='relative w-full max-w-5xl max-h-[90vh] aspect-video' onClick={(e) => e.stopPropagation()}>
						<Image
							src={lightbox.src}
							alt={lightbox.alt}
							fill
							className='object-contain'
							sizes='(max-width: 1280px) 100vw, 1280px'
						/>
					</div>
				</div>
			)}
		</>
	);
}
