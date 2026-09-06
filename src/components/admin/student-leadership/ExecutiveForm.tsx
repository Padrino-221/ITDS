import { upsertExecutive } from "@/app/staff-panel/student-leadership/actions";
import { AdminCard, Field, SaveButton, TextInput } from "../ui";
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
  onCancel,
}: {
  academicYearId: string;
  executive?: ExecutiveInput;
  onCancel?: () => void;
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
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-5 py-2.5 text-sm font-semibold text-forest-800 hover:border-forest-400"
            >
              Cancel
            </button>
          ) : (
            <a
              href={`/staff-panel/student-leadership/${academicYearId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-5 py-2.5 text-sm font-semibold text-forest-800 hover:border-forest-400"
            >
              Cancel
            </a>
          )}
        </div>
      </AdminCard>
    </form>
  );
}
