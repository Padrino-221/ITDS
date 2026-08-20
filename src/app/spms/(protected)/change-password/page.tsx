import { requireSpmsAuth } from "@/lib/spms-auth";
import ChangePasswordForm from "@/components/spms/ChangePasswordForm";

export const metadata = { title: "Change Password" };

export default async function SpmsChangePasswordPage() {
  await requireSpmsAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-forest-950">
          Change Password
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Update your account password. Choose a strong password you haven&apos;t used elsewhere.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
