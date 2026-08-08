import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Staff Login" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/staff-panel");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-forest-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-white/10 bg-white p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/logo-512.jpg"
              alt="ITDS Department Logo"
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg bg-white object-cover"
            />
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-forest-950">
              ITDS Content Management
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Sign in to manage the department website.
            </p>
          </div>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-forest-300">
          <Link href="/" className="transition-colors hover:text-gold-300">
            ← Back to public website
          </Link>
        </p>
      </div>
    </div>
  );
}
