import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ResetPasswordForm from "@/components/spms/ResetPasswordForm";

export const metadata = { title: "Reset Password" };

export default async function SpmsResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Validate the token
  const resetRecord = await prisma.supervisorPasswordReset.findUnique({
    where: { token },
  });

  const isValid =
    resetRecord &&
    !resetRecord.used &&
    new Date() <= resetRecord.expiresAt;

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
              Reset Password
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              {isValid
                ? "Enter your new password below."
                : "This reset link is invalid or has expired."}
            </p>
          </div>

          <div className="mt-8">
            {isValid ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-sm font-semibold text-red-800">
                  Invalid or expired link
                </p>
                <p className="mt-1 text-sm text-red-700">
                  Please request a new password reset link.
                </p>
              </div>
            )}
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
