"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Select } from "./Dropdown";

type FieldDef =
  | { key: string; label: string; type?: "text"; placeholder?: string }
  | {
      key: string;
      label: string;
      type: "textarea";
      rows?: number;
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      type: "select";
      options: Array<{ value: string; label: string }>;
      placeholder?: string;
    };

type ItemShape = Record<string, string>;

const inputClass =
  "w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20";

function FieldInput({
  field,
  value,
  onPatch,
}: {
  field: FieldDef;
  value: string;
  onPatch: (value: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        rows={field.rows ?? 2}
        onChange={(e) => onPatch(e.target.value)}
        placeholder={field.placeholder}
        className={inputClass}
      />
    );
  }
  if (field.type === "select") {
    return (
      <Select
        size="sm"
        value={value}
        onChange={onPatch}
        placeholder={field.placeholder ?? "Select an option"}
        options={field.options}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onPatch(e.target.value)}
      placeholder={field.placeholder}
      className={inputClass}
    />
  );
}

/**
 * Editor for list-shaped JSON settings (stats, featured links, core values,
 * acronym values, SPMS highlights, IT Society objectives). Each list entry is
 * rendered as a card with the same kind of text fields the hero-slides editor
 * uses — add/remove/reorder buttons plus a "+ Add" button. The whole list is
 * serialized into a hidden input, so the surrounding form submits it as JSON.
 *
 * Default behaviour serializes each item as an object of all its field keys.
 * Set `stringItems` (e.g. its_objectives) to serialize as a flat array of
 * strings instead.
 */
export function SettingsListEditor<T extends ItemShape = ItemShape>({
  name,
  itemLabel,
  defaultValue,
  fields,
  addLabel,
  stringItems,
  hint,
  columns = 2,
  cardColumns = 2,
}: {
  name: string;
  itemLabel: string;
  defaultValue?: T[];
  fields: FieldDef[];
  addLabel: string;
  stringItems?: boolean;
  hint?: string;
  columns?: 1 | 2 | 3;
  cardColumns?: 1 | 2 | 3;
}) {
  const emptyItem = () =>
    Object.fromEntries(fields.map((f) => [f.key, ""])) as T;

  const [items, setItems] = useState<T[]>(
    Array.isArray(defaultValue) && defaultValue.length > 0
      ? defaultValue
      : [emptyItem()]
  );

  const patch = (index: number, key: string, value: string) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );

  const remove = (index: number) =>
    setItems((prev) =>
      prev.length === 1 ? [emptyItem()] : prev.filter((_, i) => i !== index)
    );

  const move = (index: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const serialize = (): string => {
    const nonEmpty = items.filter((item) =>
      Object.values(item).some((v) => v.trim() !== "")
    );
    return JSON.stringify(
      stringItems ? nonEmpty.map((item) => item[fields[0]?.key ?? ""]) : nonEmpty
    );
  };

  const cardGridClass =
    cardColumns === 3
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      : cardColumns === 1
        ? "grid gap-4"
        : "grid gap-4 sm:grid-cols-2";

  return (
    <div className="space-y-4">
      <div className={cardGridClass}>
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-forest-200 bg-forest-50/40 p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                {itemLabel} {i + 1}
              </span>
              <div className="flex items-center gap-1.5">
                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-forest-200 bg-white text-forest-700 transition-colors hover:border-forest-400 disabled:opacity-40"
                      aria-label={`Move ${itemLabel.toLowerCase()} ${i + 1} up`}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-forest-200 bg-white text-forest-700 transition-colors hover:border-forest-400 disabled:opacity-40"
                      aria-label={`Move ${itemLabel.toLowerCase()} ${i + 1} down`}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition-colors hover:border-red-400"
                  aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div
              className={
                columns === 3
                  ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  : columns === 1
                    ? "grid gap-3"
                    : "grid gap-3 sm:grid-cols-2"
              }
            >
              {fields.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? (columns === 3 ? "lg:col-span-3 sm:col-span-2" : "sm:col-span-2") : undefined}>
                  <label className="mb-1.5 block text-xs font-medium text-ink">
                    {field.label}
                  </label>
                  <FieldInput
                    field={field}
                    value={item[field.key] ?? ""}
                    onPatch={(value) => patch(i, field.key, value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, emptyItem()])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-forest-300 px-4 py-2 text-sm font-semibold text-forest-700 transition-colors hover:border-forest-500 hover:bg-forest-50"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>

      <input type="hidden" name={name} value={serialize()} />
      {hint && <p className="text-xs leading-relaxed text-ink-soft">{hint}</p>}
    </div>
  );
}
