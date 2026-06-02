import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PosterStyle } from "@/types";

interface ExampleGalleryProps {
	styles: PosterStyle[];
}

export function ExampleGallery({ styles }: ExampleGalleryProps) {
	const showcaseStyles = styles.slice(0, 6);

	return (
		<section className='py-24'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6'>
				<div className='flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12'>
					<div>
						<p className='text-red-600 font-semibold text-sm tracking-widest uppercase mb-3'>Poster Styles</p>
						<h2 className='text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight'>
							Choose your <span className='text-red-600'>aesthetic</span>
						</h2>
					</div>
					<Link href='/gallery'>
						<Button variant='outline' className='shrink-0'>
							View All Styles
							<ArrowRight className='h-4 w-4' />
						</Button>
					</Link>
				</div>

				{showcaseStyles.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-20 gap-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700'>
						<Sparkles className='h-10 w-10 text-zinc-400' />
						<p className='text-zinc-500 dark:text-zinc-400 text-sm'>Poster styles coming soon — check back shortly.</p>
					</div>
				) : (
					<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
						{showcaseStyles.map((style, i) => (
							<Link
								key={style.id}
								href='/create'
								className={`group relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 cursor-pointer ${
									i === 0 ? "md:col-span-2 md:row-span-2" : ""
								}`}
								style={{ aspectRatio: i === 0 ? "auto" : "4/3" }}>
								<div className={i === 0 ? "aspect-[4/3]" : "aspect-[4/3]"}>
									{style.example_image_url ? (
										<Image
											src={style.example_image_url}
											alt={style.name}
											fill
											className='object-cover transition-transform duration-700 group-hover:scale-105'
										/>
									) : (
										<div className='absolute inset-0 flex items-center justify-center'>
											<Sparkles className='h-10 w-10 text-zinc-400' />
										</div>
									)}
								</div>

								{/* Overlay */}
								<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity' />

								{/* Info */}
								<div className='absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-200'>
									<Badge className='mb-2 text-xs'>
										<Sparkles className='h-2.5 w-2.5' />
										{style.name}
									</Badge>
									<p className='text-white text-sm font-semibold leading-snug line-clamp-2'>{style.description}</p>
								</div>
							</Link>
						))}
					</div>
				)}

				{/* CTA */}
				<div className='mt-12 text-center'>
					<Link href='/create'>
						<Button size='xl' className='shadow-xl shadow-red-600/20'>
							<Sparkles className='h-5 w-5' />
							Create Your Poster Now
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
