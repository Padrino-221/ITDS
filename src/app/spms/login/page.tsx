import Link from "next/link";
import Image from "next/image";
import { getSpmsSession } from "@/lib/spms-auth";
import { redirect } from "next/navigation";
import SpmsLoginForm from "@/components/spms/LoginForm";

export const metadata = { title: "SPMS Login" };

export default async function SpmsLoginPage() {
  const session = await getSpmsSession();
  if (session) {
    redirect("/spms/dashboard");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/slide.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-forest-950/80" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/itds-logo.png"
              alt="ITDS Department Logo"
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg bg-white object-cover"
            />
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-forest-950">
              Student Project Management
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Sign in to manage student projects.
            </p>
          </div>
          <div className="mt-8">
            <SpmsLoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-white/70">
          <Link href="/" className="transition-colors hover:text-gold-300">
            ← Back to public website
          </Link>
        </p>
      </div>
    </div>
  );
}
