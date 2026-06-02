import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ExampleGallery } from "@/components/home/ExampleGallery";
import { supabase } from "@/lib/supabase/server";
import type { PosterStyle } from "@/types";

async function getPosterStyles(): Promise<PosterStyle[]> {
	try {
		const { data } = await supabase
			.from("poster_styles")
			.select("*")
			.eq("is_active", true)
			.order("created_at", { ascending: false })
			.limit(6);
		return data ?? [];
	} catch {
		return [];
	}
}

export default async function HomePage() {
	const styles = await getPosterStyles();

	return (
		<>
			<HeroSection />
			<HowItWorks />
			<ExampleGallery styles={styles} />
		</>
	);
}
