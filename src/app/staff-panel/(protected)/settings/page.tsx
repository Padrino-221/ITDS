import { prisma } from "@/lib/prisma";
import { AdminCard, AdminPageHeader, Field, PrimaryButton, TextArea, TextInput } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { HeroSlidesEditor } from "@/components/admin/HeroSlidesEditor";
import { SettingsListEditor } from "@/components/admin/SettingsListEditor";
import { updateSettings } from "@/app/staff-panel/actions";
import { parseSetting } from "@/lib/settings";
import type { HeroSlide } from "@/lib/settings";

const featuredLinkIconOptions = [
  { value: "folder", label: "Folder" },
  { value: "newspaper", label: "Newspaper" },
  { value: "clipboard", label: "Clipboard" },
  { value: "image", label: "Image" },
];

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
  const stats = parseSetting<Array<{ value: string; label: string }>>(settings.get("stats"), []);
  const featuredLinks = parseSetting<Array<{ title: string; description: string; href: string; icon: string }>>(settings.get("featured_links"), []);
  const coreValues = parseSetting<Array<{ title: string; description: string }>>(settings.get("core_values"), []);
  const acronymValues = parseSetting<Array<{ letter: string; word: string; description: string }>>(settings.get("acronym_values"), []);
  const highlights = parseSetting<Array<{ title: string; description: string }>>(settings.get("spms_highlights"), []);
  const objectives = parseSetting<string[]>(settings.get("its_objectives"), []);

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
            <Field
              label="Homepage stats"
              hint="The numbers shown across the stats band on the homepage. Use plain text values (e.g. 4000+)."
            >
              <SettingsListEditor
                name="stats"
                itemLabel="Stat"
                defaultValue={stats}
                addLabel="Add stat"
                columns={1}
                fields={[
                  { key: "value", label: "Value", placeholder: "e.g. 4000+" },
                  { key: "label", label: "Label", placeholder: "e.g. Registered Students" },
                ]}
              />
            </Field>
            <Field
              label="Featured links"
              hint="The cards on the homepage under “Our Approach”."
            >
              <SettingsListEditor
                name="featured_links"
                itemLabel="Link"
                defaultValue={featuredLinks}
                addLabel="Add link"
                cardColumns={1}
                columns={3}
                fields={[
                  { key: "icon", label: "Icon", type: "select", options: featuredLinkIconOptions },
                  { key: "title", label: "Title", placeholder: "e.g. Student Projects" },
                  { key: "href", label: "Link", type: "text", placeholder: "/projects" },
                  { key: "description", label: "Description", type: "textarea", rows: 2 },
                ]}
              />
            </Field>
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
            <Field label="Core values" hint="Cards shown in the “ITDS Core Values” section on the About page.">
              <SettingsListEditor
                name="core_values"
                itemLabel="Value"
                defaultValue={coreValues}
                addLabel="Add core value"
                fields={[
                  { key: "title", label: "Title", placeholder: "e.g. Innovation" },
                  { key: "description", label: "Description", type: "textarea", rows: 2 },
                ]}
              />
            </Field>
            <Field label="ITDS acronym" hint="Letters that spell out ITDS, shown in the “What ITDS Stands For” section.">
              <SettingsListEditor
                name="acronym_values"
                itemLabel="Letter"
                defaultValue={acronymValues}
                addLabel="Add letter"
                fields={[
                  { key: "letter", label: "Letter", placeholder: "I" },
                  { key: "word", label: "Word", placeholder: "Innovation" },
                  { key: "description", label: "Description", type: "textarea", rows: 2 },
                ]}
              />
            </Field>
            <Field label="SPMS highlights" hint="Numbered highlights in the Student Project Management System section.">
              <SettingsListEditor
                name="spms_highlights"
                itemLabel="Highlight"
                defaultValue={highlights}
                addLabel="Add highlight"
                fields={[
                  { key: "title", label: "Title", placeholder: "e.g. Searchable repository" },
                  { key: "description", label: "Description", type: "textarea", rows: 2 },
                ]}
              />
            </Field>
            <Field label="IT Society — story">
              <TextArea name="its_story" rows={4} defaultValue={settings.get("its_story") ?? ""} />
            </Field>
            <Field label="IT Society objectives" hint="The objectives listed on the IT Society page.">
              <SettingsListEditor
                name="its_objectives"
                itemLabel="Objective"
                defaultValue={objectives.map((o) => ({ text: o }))}
                stringItems
                addLabel="Add objective"
                fields={[{ key: "text", label: "Objective", placeholder: "e.g. Organise the annual UENR Tech Fair" }]}
              />
            </Field>
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
