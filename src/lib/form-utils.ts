/**
 * Shared FormData extraction helpers. Used by the Staff Panel, SPMS, and
 * E-Learning server actions so every handler reads form values the same way.
 */

/** Trim a string value from FormData, returning empty string for non-strings. */
export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Like `str` but returns null when the value is empty. */
export function opt(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value ? value : null;
}

/** Read a checkbox-style field ("on" → true). */
export function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}
