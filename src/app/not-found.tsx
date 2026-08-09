import Link from "next/link";
import Image from "next/image";
import { Mail, Home } from "lucide-react";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-forest-950 px-4 text-center text-white">
      <Image
        src="/itds-logo.png"
        alt="ITDS Department Logo"
        width={64}
        height={64}
        className="h-16 w-16 rounded-lg bg-white object-cover"
      />
      <p className="mt-8 font-display text-7xl font-bold text-gold-400 sm:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-balance sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-forest-200/80">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
        >
          <Mail className="h-4 w-4" />
          Contact Us
        </Link>
      </div>
    </div>
  );
}
