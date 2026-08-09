import { prisma } from "@/lib/prisma";
import { AdminCard, AdminPageHeader, Field, PrimaryButton, TextArea, TextInput } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { HeroSlidesEditor } from "@/components/admin/HeroSlidesEditor";
import { updateSettings } from "@/app/staff-panel/actions";
import { parseSetting } from "@/lib/settings";
import type { HeroSlide } from "@/lib/settings";

function JSONTextArea({
  name,
  value,
  hint,
}: {
  name: string;
  value: string;
  hint?: string;
}) {
  return (
    <Field label={name} hint={hint}>
      <TextArea
        name={name}
        rows={5}
        defaultValue={value}
        spellCheck={false}
        className="font-mono text-xs"
      />
    </Field>
  );
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const rows = await prisma.setting.findMany();
  const settings = new Map(rows.map((r) => [r.key, r.value]));

  const welcome = parseSetting<Record<string, string>>(settings.get("welcome"), {});
  const contact = parseSetting<Record<string, string>>(settings.get("contact"), {});
  const socials = parseSetting<Record<string, string>>(settings.get("socials"), {});
  const heroSlides = parseSetting<HeroSlide[]>(settings.get("hero_slides"), []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Settings"
        description="Global content for the homepage, header, footer and info pages."
      />
      <SavedToast saved={saved} />

      <form action={updateSettings} className="space-y-6">
        {/* General */}
        <AdminCard title="General">
          <div className="mt-5 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Site name">
                <TextInput name="site_name" defaultValue={settings.get("site_name") ?? ""} />
              </Field>
              <Field label="Announcement bar" hint="Shown at the very top of the site.">
                <TextInput name="announcement" defaultValue={settings.get("announcement") ?? ""} />
              </Field>
            </div>
          </div>
        </AdminCard>

        {/* Homepage */}
        <AdminCard title="Homepage Hero Slides">
          <div className="mt-5">
            <Field
              label="Hero slides"
              hint="Upload a background photo and customise the headline, subtitle and button for each carousel slide."
            >
              <HeroSlidesEditor name="hero_slides" defaultValue={heroSlides} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Homepage Stats & Links">
          <div className="mt-5 grid gap-5">
            <JSONTextArea
              name="stats"
              value={settings.get("stats") ?? "[]"}
              hint='JSON array: [{"value":"4000+","label":"Registered Students"}]'
            />
            <JSONTextArea
              name="featured_links"
              value={settings.get("featured_links") ?? "[]"}
              hint='JSON array: [{"title","description","href","icon"}] — icons: folder, newspaper, clipboard, image'
            />
          </div>
        </AdminCard>

        {/* HOD welcome */}
        <AdminCard title="HOD Welcome Message">
          <div className="mt-5 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Heading">
                <TextInput name="welcome_heading" defaultValue={welcome.heading ?? ""} />
              </Field>
              <Field label="Name">
                <TextInput name="welcome_name" defaultValue={welcome.name ?? ""} />
              </Field>
              <Field label="Title">
                <TextInput name="welcome_title" defaultValue={welcome.title ?? ""} />
              </Field>
            </div>
            <ImageUpload
              name="welcome_image"
              label="HOD Photo"
              hint="Upload a photo of the Head of Department. Shown in the welcome message on the homepage."
              defaultValue={welcome.image ?? ""}
            />
            <Field label="Message">
              <TextArea name="welcome_message" rows={5} defaultValue={welcome.message ?? ""} />
            </Field>
          </div>
        </AdminCard>

        {/* About & ITS */}
        <AdminCard title="About & IT Society">
          <div className="mt-5 grid gap-5">
            <Field label="About — story paragraph">
              <TextArea name="about_story" rows={4} defaultValue={settings.get("about_story") ?? ""} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageUpload
                name="about_image_story"
                label="About — story image"
                hint="Photo beside the story paragraph on the About page."
                defaultValue={settings.get("about_image_story") ?? "/images/about/campus.jpg"}
              />
              <ImageUpload
                name="about_image_spms"
                label="About — SPMS image"
                hint="Photo in the SPMS section on the About page."
                defaultValue={settings.get("about_image_spms") ?? "/images/about/students.jpg"}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Vision">
                <TextArea name="about_vision" rows={3} defaultValue={settings.get("about_vision") ?? ""} />
              </Field>
              <Field label="Mission">
                <TextArea name="about_mission" rows={3} defaultValue={settings.get("about_mission") ?? ""} />
              </Field>
            </div>
            <JSONTextArea
              name="core_values"
              value={settings.get("core_values") ?? "[]"}
              hint='JSON array: [{"title","description"}]'
            />
            <JSONTextArea
              name="acronym_values"
              value={settings.get("acronym_values") ?? "[]"}
              hint='JSON array: [{"letter":"I","word":"Innovation","description":"…"}]'
            />
            <JSONTextArea
              name="spms_highlights"
              value={settings.get("spms_highlights") ?? "[]"}
              hint='JSON array: [{"title","description"}]'
            />
            <Field label="IT Society — story">
              <TextArea name="its_story" rows={4} defaultValue={settings.get("its_story") ?? ""} />
            </Field>
            <JSONTextArea
              name="its_objectives"
              value={settings.get("its_objectives") ?? "[]"}
              hint='JSON array of strings: ["objective one", "objective two"]'
            />
          </div>
        </AdminCard>

        {/* Contact */}
        <AdminCard title="Contact Information">
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Email">
              <TextInput name="contact_email" type="email" defaultValue={contact.email ?? ""} />
            </Field>
            <Field label="Phone">
              <TextInput name="contact_phone" defaultValue={contact.phone ?? ""} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <TextInput name="contact_address" defaultValue={contact.address ?? ""} />
            </Field>
            <Field label="Office hours">
              <TextInput name="contact_hours" defaultValue={contact.hours ?? ""} />
            </Field>
          </div>
        </AdminCard>

        {/* Socials */}
        <AdminCard title="Social Media">
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Facebook">
              <TextInput name="social_facebook" type="url" defaultValue={socials.facebook ?? ""} />
            </Field>
            <Field label="Twitter / X">
              <TextInput name="social_twitter" type="url" defaultValue={socials.twitter ?? ""} />
            </Field>
            <Field label="Instagram">
              <TextInput name="social_instagram" type="url" defaultValue={socials.instagram ?? ""} />
            </Field>
            <Field label="LinkedIn">
              <TextInput name="social_linkedin" type="url" defaultValue={socials.linkedin ?? ""} />
            </Field>
            <Field label="YouTube">
              <TextInput name="social_youtube" type="url" defaultValue={socials.youtube ?? ""} />
            </Field>
          </div>
        </AdminCard>

        <div className="flex items-center gap-3">
          <PrimaryButton type="submit">Save All Settings</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
