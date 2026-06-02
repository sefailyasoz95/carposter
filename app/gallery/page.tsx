import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import type { PosterStyle } from "@/types";

async function getStylesWithExamples(): Promise<PosterStyle[]> {
	try {
		const { data } = await supabase
			.from("poster_styles")
			.select(`*, example_posters(id, image_url, title)`)
			.eq("is_active", true)
			.order("created_at", { ascending: false });
		return data ?? [];
	} catch {
		return [];
	}
}

export const metadata = {
	title: "Gallery — CarPoster",
	description: "Browse all AI poster styles for your car.",
};

export default async function GalleryPage() {
	const styles = await getStylesWithExamples();

	return (
		<div className='min-h-screen py-16 px-4 sm:px-6'>
			<div className='mx-auto max-w-7xl'>
				{/* Header */}
				<div className='text-center mb-14'>
					<p className='text-red-600 font-semibold text-sm tracking-widest uppercase mb-3'>Poster Gallery</p>
					<h1 className='text-5xl sm:text-6xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-4'>
						Every style, <span className='text-red-600'>every vibe</span>
					</h1>
					<p className='text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto'>
						Pick a style that speaks to your car. Each one is a unique AI prompt crafted for maximum impact.
					</p>
				</div>

				{styles.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-24 gap-5 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800'>
						<div className='h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center'>
							<Sparkles className='h-8 w-8 text-zinc-400' />
						</div>
						<div className='text-center'>
							<p className='font-semibold text-zinc-700 dark:text-zinc-300'>No styles yet</p>
							<p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1'>
								Add some poster styles in your Supabase dashboard.
							</p>
						</div>
					</div>
				) : (
					<GalleryGrid styles={styles} />
				)}

				{/* Bottom CTA */}
				{styles.length > 0 && (
					<div className='mt-16 text-center'>
						<Link href='/create'>
							<Button size='xl' className='shadow-xl shadow-red-600/20'>
								<Sparkles className='h-5 w-5' />
								Create Your Poster Now
							</Button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
