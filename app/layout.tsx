import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CarPoster — AI Car Posters",
	description:
		"Turn your car photo into a stunning AI-generated poster. Upload, pick a style, pay, and download in 60 seconds.",
	keywords: ["car poster", "AI art", "car photography", "automotive art", "JDM poster"],
	openGraph: {
		title: "CarPoster — AI Car Posters",
		description: "Turn your car photo into a stunning AI-generated poster.",
		type: "website",
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang='en'
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning>
			<body className='min-h-full flex flex-col bg-white dark:bg-zinc-950'>
				<ThemeProvider>
					<Header />
					<main className='flex-1'>{children}</main>
					<Footer />
					<Toaster
						position='bottom-right'
						toastOptions={{
							style: {
								background: "var(--surface-1)",
								border: "1px solid var(--border)",
								color: "var(--foreground)",
							},
						}}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
