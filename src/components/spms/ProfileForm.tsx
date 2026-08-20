"use client";

import { useState } from "react";
import Image from "next/image";
import { updateSpmsProfile } from "@/app/spms/(protected)/actions";
import { AdminCard, Field, TextArea, SaveButton } from "@/components/admin/ui";
import { Select } from "@/components/admin/Dropdown";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { User, Briefcase, Phone } from "lucide-react";

type Profile = {
  name: string | null;
  email: string | null;
  userTitle: string | null;
  gender: string | null;
  jobRank: string | null;
  phone: string | null;
  linkedin: string | null;
  facebook: string | null;
  twitter: string | null;
  publink: string | null;
  researchArea1: string | null;
  researchArea2: string | null;
  profilePhoto: string | null;
  about: string | null;
} | null;

export default function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-6">
      <PersonalSection profile={profile} />
      <AcademicSection profile={profile} />
      <ContactSection profile={profile} />
    </div>
  );
}

function PersonalSection({ profile }: { profile: Profile }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    await updateSpmsProfile({
      userTitle: form.get("userTitle") as string,
      gender: form.get("gender") as string,
      name: `${form.get("firstName")} ${form.get("lastName")}`,
      profilePhoto: form.get("profilePhoto") as string,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const nameParts = (profile?.name ?? "").split(" ");
  const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
  const lastName = nameParts.slice(-1)[0] || "";

  return (
    <AdminCard title={<>Personal Details</>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUpload
          name="profilePhoto"
          label="Profile Photo"
          hint="Upload a professional photo for your public profile"
          defaultValue={profile?.profilePhoto ?? ""}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Select
              name="userTitle"
              defaultValue={profile?.userTitle ?? ""}
              placeholder="Select…"
              options={[
                { value: "Mr.", label: "Mr." },
                { value: "Mrs.", label: "Mrs." },
                { value: "Ms.", label: "Ms." },
                { value: "Dr.", label: "Dr." },
                { value: "Prof.", label: "Prof." },
              ]}
            />
          </Field>
          <Field label="Gender">
            <Select
              name="gender"
              defaultValue={profile?.gender ?? ""}
              placeholder="Select…"
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name">
            <input
              name="firstName"
              defaultValue={firstName}
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
          <Field label="Last Name">
            <input
              name="lastName"
              defaultValue={lastName}
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
        </div>
        <div className="flex items-center gap-3 border-t border-forest-100 pt-4">
          <SaveButton pending={saving} />
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </AdminCard>
  );
}

function AcademicSection({ profile }: { profile: Profile }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    await updateSpmsProfile({
      jobRank: form.get("jobRank") as string,
      researchArea1: form.get("researchArea1") as string,
      researchArea2: form.get("researchArea2") as string,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AdminCard title={<>Academic Details</>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job Rank">
            <Select
              name="jobRank"
              defaultValue={profile?.jobRank ?? ""}
              placeholder="Select…"
              options={[
                { value: "Research Assistant", label: "Research Assistant" },
                { value: "Snr. Research Assistant", label: "Snr. Research Assistant" },
                { value: "Assistant Lecturer", label: "Assistant Lecturer" },
                { value: "Lecturer", label: "Lecturer" },
                { value: "Senior Lecturer", label: "Senior Lecturer" },
                { value: "Associate Professor", label: "Associate Professor" },
                { value: "Full Professor", label: "Full Professor" },
              ]}
            />
          </Field>
          <Field label="Department">
            <input
              value="Information Technology and Decision Sciences"
              disabled
              className="w-full rounded-lg border border-forest-200 bg-forest-50/50 px-3.5 py-2.5 text-sm text-ink-soft"
            />
          </Field>
        </div>
        <Field label="Research Area 1" hint="e.g. Machine Learning, Web Development">
          <TextArea
            name="researchArea1"
            rows={3}
            defaultValue={profile?.researchArea1 ?? ""}
          />
        </Field>
        <Field label="Research Area 2" hint="Optional second research area">
          <TextArea
            name="researchArea2"
            rows={3}
            defaultValue={profile?.researchArea2 ?? ""}
          />
        </Field>
        <div className="flex items-center gap-3 border-t border-forest-100 pt-4">
          <SaveButton pending={saving} />
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </AdminCard>
  );
}

function ContactSection({ profile }: { profile: Profile }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    await updateSpmsProfile({
      phone: form.get("phone") as string,
      linkedin: form.get("linkedin") as string,
      facebook: form.get("facebook") as string,
      twitter: form.get("twitter") as string,
      publink: form.get("publink") as string,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AdminCard title={<>Contact & Social</>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone Number">
            <input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              placeholder="+233..."
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
          <Field label="Email">
            <input
              value={profile?.email ?? ""}
              disabled
              className="w-full rounded-lg border border-forest-200 bg-forest-50/50 px-3.5 py-2.5 text-sm text-ink-soft"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="LinkedIn URL">
            <input
              name="linkedin"
              defaultValue={profile?.linkedin ?? ""}
              placeholder="https://linkedin.com/in/..."
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
          <Field label="Facebook URL">
            <input
              name="facebook"
              defaultValue={profile?.facebook ?? ""}
              placeholder="https://facebook.com/..."
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Publication Link 1">
            <input
              name="twitter"
              defaultValue={profile?.twitter ?? ""}
              placeholder="Google Scholar, ResearchGate, etc."
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
          <Field label="Publication Link 2">
            <input
              name="publink"
              defaultValue={profile?.publink ?? ""}
              placeholder="Additional publication link"
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
        </div>
        <div className="flex items-center gap-3 border-t border-forest-100 pt-4">
          <SaveButton pending={saving} />
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </AdminCard>
  );
}
