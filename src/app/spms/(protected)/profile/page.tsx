import { prisma } from "@/lib/prisma";
import { requireSpmsAuth } from "@/lib/spms-auth";
import ProfileForm from "@/components/spms/ProfileForm";

export const metadata = { title: "My Profile" };

export default async function SpmsProfilePage() {
  const user = await requireSpmsAuth();

  const profile = await prisma.supervisor.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      userTitle: true,
      gender: true,
      jobRank: true,
      phone: true,
      linkedin: true,
      facebook: true,
      twitter: true,
      publink: true,
      researchArea1: true,
      researchArea2: true,
      profilePhoto: true,
      about: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-forest-950">My Profile</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Manage your personal, academic, and contact details.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
