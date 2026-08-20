import Link from "next/link";
import Image from "next/image";
import ForgotPasswordForm from "@/components/spms/ForgotPasswordForm";

export const metadata = { title: "Forgot Password" };

export default function SpmsForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-forest-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-white/10 bg-white p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/itds-logo.png"
              alt="ITDS Department Logo"
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg bg-white object-cover"
            />
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-forest-950">
              Forgot Password
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>
          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-forest-300">
          <Link href="/spms/login" className="transition-colors hover:text-gold-300">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
