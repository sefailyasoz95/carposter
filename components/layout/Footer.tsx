import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/carposter_logo.png"
              alt="CarPoster"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="font-bold text-sm">
              Car<span className="text-red-600">Poster</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/gallery" className="hover:text-red-600 transition-colors">Gallery</Link>
            <Link href="/create" className="hover:text-red-600 transition-colors">Create</Link>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} CarPoster. Turn your ride into art.
          </p>
        </div>
      </div>
    </footer>
  );
}
