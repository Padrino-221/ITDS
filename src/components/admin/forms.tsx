import type { NewsPost, Project, Lecturer, ResearchArea, Program, GalleryImage } from "@prisma/client";
import {
  createNews,
  createProject,
  createLecturer,
  createResearchArea,
  createGalleryImage,
  updateNews,
  updateProject,
  updateLecturer,
  updateResearchArea,
  updateGalleryImage,
  updateProgram,
} from "@/app/staff-panel/actions";
import { DEGREE_LABELS } from "@/lib/data";
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
// Projects
// ------------------------------------------------------------------

export function ProjectForm({
  project,
  lecturers,
}: {
  project?: Project;
  lecturers: Lecturer[];
}) {
  return (
    <form action={project ? updateProject.bind(null, project.id) : createProject}>
      <AdminCard>
        <div className="grid gap-5">
          <Field label="Project title" required>
            <TextInput name="title" required minLength={3} defaultValue={project?.title} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Student name">
              <TextInput name="studentName" defaultValue={project?.studentName ?? ""} />
            </Field>
            <Field label="Programme">
              <TextInput
                name="program"
                placeholder="e.g. BSc. Information Technology"
                defaultValue={project?.program ?? ""}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Degree level" required>
              <Select
                name="degreeLevel"
                required
                defaultValue={project?.degreeLevel ?? "UNDERGRADUATE"}
                options={Object.entries(DEGREE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </Field>
            <Field label="Academic year">
              <TextInput
                name="academicYear"
                placeholder="e.g. 2025/2026"
                defaultValue={project?.academicYear ?? ""}
              />
            </Field>
          </div>
          <Field label="Supervisor">
            <Select
              name="supervisorId"
              defaultValue={project?.supervisorId ?? ""}
              placeholder="— No supervisor —"
              options={[
                { value: "", label: "— No supervisor —" },
                ...lecturers.map((lecturer) => ({ value: lecturer.id, label: lecturer.name })),
              ]}
            />
          </Field>
          <ImageUpload
            name="image"
            label="Project Image"
            hint="Optional cover image for the project card."
            defaultValue={project?.image ?? ""}
          />
          <Field label="Abstract" hint="Project summary / abstract (optional).">
            <TextArea name="abstract" rows={8} defaultValue={project?.abstract ?? ""} />
          </Field>
          <Checkbox label="Published (visible on the public site)" name="published" defaultChecked={project?.published ?? true} />
        </div>
        <div className="mt-6">
          <FormActions cancelHref="/staff-panel/projects" />
        </div>
      </AdminCard>
    </form>
  );
}

// ------------------------------------------------------------------
// Lecturers
// ------------------------------------------------------------------

export function LecturerForm({ lecturer }: { lecturer?: Lecturer }) {
  return (
    <form action={lecturer ? updateLecturer.bind(null, lecturer.id) : createLecturer}>
      <AdminCard>
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required>
              <TextInput name="name" required minLength={2} defaultValue={lecturer?.name} />
            </Field>
            <Field label="Title / position" required hint="e.g. Associate Professor, Lecturer">
              <TextInput name="title" required defaultValue={lecturer?.title} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email">
              <TextInput name="email" type="email" defaultValue={lecturer?.email ?? ""} />
            </Field>
            <Field label="Display order" hint="Lower numbers appear first.">
              <TextInput name="order" type="number" min={0} defaultValue={lecturer?.order ?? 0} />
            </Field>
          </div>
          <ImageUpload
            name="photo"
            label="Photo"
            hint="Upload a photo for this lecturer."
            defaultValue={lecturer?.photo ?? ""}
          />
          <Field label="Research interests" hint="Comma separated, e.g. Machine Learning, Data Science">
            <TextArea name="researchInterests" rows={2} defaultValue={lecturer?.researchInterests ?? ""} />
          </Field>
          <Field label="Biography">
            <TextArea name="bio" rows={6} defaultValue={lecturer?.bio ?? ""} />
          </Field>
        </div>
        <div className="mt-6">
          <FormActions cancelHref="/staff-panel/lecturers" />
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
