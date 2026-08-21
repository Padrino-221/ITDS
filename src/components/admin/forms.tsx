import type { NewsPost, ResearchArea, Program, GalleryImage } from "@prisma/client";
import {
  createNews,
  createResearchArea,
  createGalleryImage,
  updateNews,
  updateResearchArea,
  updateGalleryImage,
  updateProgram,
} from "@/app/staff-panel/actions";
import { AdminCard, Checkbox, Field, SaveButton, SecondaryLink, TextArea, TextInput } from "./ui";
import { Select } from "./Dropdown";
import { ImageUpload } from "./ImageUpload";
import { NewsContentEditor } from "./NewsContentEditor";

function FormActions({ cancelHref }: { cancelHref: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-forest-100 pt-6">
      <SaveButton />
      <SecondaryLink href={cancelHref}>Cancel</SecondaryLink>
    </div>
  );
}

// ------------------------------------------------------------------
// News
// ------------------------------------------------------------------

export function NewsForm({ post }: { post?: NewsPost }) {
  return (
    <form action={post ? updateNews.bind(null, post.id) : createNews}>
      <AdminCard>
        <div className="grid gap-5">
          <Field label="Title" required>
            <TextInput name="title" required minLength={3} defaultValue={post?.title} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" required hint="e.g. Events, Announcements, General">
              <TextInput name="category" required defaultValue={post?.category ?? "General"} />
            </Field>
            <ImageUpload
              name="image"
              label="Featured Image"
              hint="Upload an image for this post."
              defaultValue={post?.image ?? ""}
            />
          </div>
          <Field label="Excerpt" hint="Short summary shown on cards (optional).">
            <TextArea name="excerpt" rows={3} defaultValue={post?.excerpt ?? ""} />
          </Field>
          <NewsContentEditor name="content" defaultValue={post?.content ?? ""} />
          <Checkbox label="Published (visible on the public site)" name="published" defaultChecked={post?.published ?? true} />
        </div>
        <div className="mt-6">
          <FormActions cancelHref="/staff-panel/news" />
        </div>
      </AdminCard>
    </form>
  );
}

// ------------------------------------------------------------------
// Research areas
// ------------------------------------------------------------------

export function ResearchForm({ area }: { area?: ResearchArea }) {
  return (
    <form action={area ? updateResearchArea.bind(null, area.id) : createResearchArea}>
      <AdminCard>
        <div className="grid gap-5">
          <Field label="Title" required>
            <TextInput name="title" required minLength={3} defaultValue={area?.title} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Icon" hint="brain, globe, smartphone, shield or chart">
              <Select
                name="icon"
                defaultValue={area?.icon ?? "globe"}
                options={[
                  { value: "brain", label: "Brain (AI)" },
                  { value: "globe", label: "Globe (Web)" },
                  { value: "smartphone", label: "Smartphone (Mobile)" },
                  { value: "shield", label: "Shield (Security)" },
                  { value: "chart", label: "Chart (Data)" },
                ]}
              />
            </Field>
            <Field label="Display order">
              <TextInput name="order" type="number" min={0} defaultValue={area?.order ?? 0} />
            </Field>
          </div>
          <ImageUpload
            name="image"
            label="Research Area Image"
            hint="Upload an image for this research area."
            defaultValue={area?.image ?? ""}
          />
          <Field label="Description" required>
            <TextArea name="description" rows={7} required minLength={10} defaultValue={area?.description ?? ""} />
          </Field>
        </div>
        <div className="mt-6">
          <FormActions cancelHref="/staff-panel/research" />
        </div>
      </AdminCard>
    </form>
  );
}

// ------------------------------------------------------------------
// Programs
// ------------------------------------------------------------------

export function ProgramForm({ program }: { program: Program }) {
  return (
    <form action={updateProgram.bind(null, program.id)}>
      <AdminCard>
        <div className="grid gap-5">
          <Field label="Programme Overview" required hint="Introduction to the programme.">
            <TextArea
              name="overview"
              rows={6}
              required
              minLength={10}
              defaultValue={program.overview}
            />
          </Field>
          <Field label="Learning Objectives" required hint="Use bullet points (- item) for each objective.">
            <TextArea
              name="learningObjectives"
              rows={8}
              required
              minLength={10}
              defaultValue={program.learningObjectives}
            />
          </Field>
          <Field label="Curriculum Structure" required hint="Use **Title** for section headers.">
            <TextArea
              name="curriculumStructure"
              rows={10}
              required
              minLength={10}
              defaultValue={program.curriculumStructure}
            />
          </Field>
          <Field label="Programme Contact" required hint="Contact details for the programme.">
            <TextArea
              name="programmeContact"
              rows={4}
              required
              defaultValue={program.programmeContact}
            />
          </Field>
        </div>
        <div className="mt-6">
          <FormActions cancelHref="/staff-panel/programs" />
        </div>
      </AdminCard>
    </form>
  );
}
// ------------------------------------------------------------------
// Gallery
// ------------------------------------------------------------------

export function GalleryImageForm({ image }: { image?: GalleryImage }) {
  return (
    <form action={image ? updateGalleryImage.bind(null, image.id) : createGalleryImage}>
      <AdminCard>
        <div className="grid gap-5">
          <ImageUpload
            name="src"
            label="Image"
            required
            hint="Upload the photo to show in the gallery."
            defaultValue={image?.src ?? ""}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Caption" hint="Short label shown over the image (optional).">
              <TextInput name="caption" defaultValue={image?.caption ?? ""} />
            </Field>
            <Field label="Display order" hint="Lower numbers appear first.">
              <TextInput name="order" type="number" min={0} defaultValue={image?.order ?? 0} />
            </Field>
          </div>
        </div>
        <div className="mt-6">
          <FormActions cancelHref="/staff-panel/gallery" />
        </div>
      </AdminCard>
    </form>
  );
}
