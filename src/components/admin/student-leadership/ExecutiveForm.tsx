import { upsertExecutive } from "@/app/staff-panel/student-leadership/actions";
import { AdminCard, Field, SaveButton, SecondaryLink, TextInput } from "../ui";
import { ImageUpload } from "../ImageUpload";

type ExecutiveInput = {
  id?: string;
  name: string;
  position: string;
  photoUrl?: string | null;
  ordering?: number;
};

export function ExecutiveForm({
  academicYearId,
  executive,
}: {
  academicYearId: string;
  executive?: ExecutiveInput;
}) {
  return (
    <form action={upsertExecutive}>
      <input type="hidden" name="academicYearId" value={academicYearId} />
      {executive?.id && <input type="hidden" name="id" value={executive.id} />}
      <AdminCard>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" required>
            <TextInput name="name" required defaultValue={executive?.name} />
          </Field>
          <Field label="Position" required hint="e.g. President, Secretary">
            <TextInput name="position" required defaultValue={executive?.position} />
          </Field>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <ImageUpload
            name="photoUrl"
            label="Photo"
            hint="Portrait of the executive (optional)."
            defaultValue={executive?.photoUrl ?? ""}
          />
          <Field label="Display order" hint="Lower numbers appear first.">
            <TextInput
              name="ordering"
              type="number"
              min={0}
              defaultValue={executive?.ordering ?? 0}
            />
          </Field>
        </div>
        <div className="mt-6 flex items-center gap-3 border-t border-forest-100 pt-6">
          <SaveButton />
          <SecondaryLink href={`/staff-panel/student-leadership/${academicYearId}`}>
            Cancel
          </SecondaryLink>
        </div>
      </AdminCard>
    </form>
  );
}
