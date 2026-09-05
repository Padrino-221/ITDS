import { createTenure } from "@/app/staff-panel/student-leadership/actions";
import { Field, PrimaryButton, TextInput } from "../ui";

export function TenureForm() {
  return (
    <form action={createTenure} className="flex flex-wrap items-end gap-3">
      <Field label="Academic Year" htmlFor="tenure-year" hint="e.g. 2025/2026" className="w-full max-w-xs">
        <TextInput id="tenure-year" name="year" required placeholder="2025/2026" />
      </Field>
      <PrimaryButton className="mb-0">Add Tenure</PrimaryButton>
    </form>
  );
}
