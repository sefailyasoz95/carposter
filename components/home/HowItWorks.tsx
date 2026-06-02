import { Upload, Palette, CreditCard, Download } from "lucide-react";

const STEPS = [
	{
		icon: Upload,
		number: "01",
		title: "Upload Your Car",
		description:
			"Drag and drop your car photo. We support JPG, PNG, and WebP up to 20MB. Any angle works — side, front, or 3/4.",
	},
	{
		icon: Palette,
		number: "02",
		title: "Pick a Style",
		description:
			"Browse our curated collection of AI poster styles. Cinematic, retro JDM, rally, studio — find your vibe.",
	},
	{
		icon: CreditCard,
		number: "03",
		title: "Secure Payment",
		description: "Pay securely in-app with your card or Apple/Google Pay via Stripe. No redirects, no hassle.",
	},
	{
		icon: Download,
		number: "04",
		title: "Download & Share",
		description:
			"Your AI-generated poster is ready in 60 seconds. Download in high resolution and share it everywhere.",
	},
];

export function HowItWorks() {
	return (
		<section className='py-24 bg-zinc-50 dark:bg-zinc-900/50'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6'>
				<div className='text-center mb-16'>
					<p className='text-red-600 font-semibold text-sm tracking-widest uppercase mb-3'>How It Works</p>
					<h2 className='text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight'>
						Four steps to your <span className='text-red-600'>masterpiece</span>
					</h2>
					<p className='mt-4 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto'>
						From photo to print-ready poster in under a minute. No design skills needed.
					</p>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
					{STEPS.map((step, i) => (
						<div key={step.number} className='relative flex flex-col gap-4'>
							{/* Connector */}
							{i < STEPS.length - 1 && (
								<div className='hidden lg:block absolute top-8 left-full w-full h-px z-0'>
									<div className='w-3/4 h-px bg-gradient-to-r from-red-600/40 to-blue-500/20 mx-auto' />
								</div>
							)}

							<div className='relative z-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-red-600/30 hover:shadow-lg dark:hover:shadow-red-600/5 transition-all duration-200 group'>
								{/* Number */}
								<div className='flex items-start justify-between mb-5'>
									<div className='h-12 w-12 rounded-xl bg-gradient-to-br from-red-600/10 to-blue-500/10 border border-red-600/20 flex items-center justify-center group-hover:from-red-600/20 group-hover:to-blue-500/20 transition-colors'>
										<step.icon className='h-5 w-5 text-red-600' />
									</div>
									<span className='text-4xl font-black text-zinc-100 dark:text-zinc-800 select-none'>
										{step.number}
									</span>
								</div>

								<h3 className='font-bold text-zinc-900 dark:text-zinc-100 mb-2'>{step.title}</h3>
								<p className='text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed'>{step.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
