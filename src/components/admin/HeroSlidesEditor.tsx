"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";
import type { HeroSlide } from "@/lib/settings";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — matches /api/uploads

function emptySlide(): HeroSlide {
  return { title: "", subtitle: "", image: "", cta: { label: "", href: "" } };
}

/**
 * Editor for the homepage hero carousel. Each slide gets its own image that
 * is uploaded to POST /api/uploads on selection (same flow as ImageUpload —
 * only the returned /uploads/... URL is stored), plus title/subtitle/CTA
 * fields. The whole list is submitted as a JSON blob through a hidden input.
 */
export function HeroSlidesEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: HeroSlide[];
}) {
  const [slides, setSlides] = useState<HeroSlide[]>(
    Array.isArray(defaultValue) && defaultValue.length > 0 ? defaultValue : [emptySlide()]
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingIndex = useRef<number>(0);

  const patch = (index: number, field: keyof HeroSlide, value: string) =>
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );

  const patchCta = (index: number, field: "label" | "href", value: string) =>
    setSlides((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              cta: {
                label: s.cta?.label ?? "",
                href: s.cta?.href ?? "",
                [field]: value,
              },
            }
          : s
      )
    );

  const uploadImage = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file (PNG, JPG or GIF).", "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast("The image is larger than 5MB. Please choose a smaller file.", "error");
      return;
    }
    setUploadingIndex(index);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        toast(data?.error ?? "Upload failed. Please try again.", "error");
        return;
      }
      patch(index, "image", data.url);
    } catch {
      toast("Upload failed. Please try again.", "error");
    } finally {
      setUploadingIndex(null);
    }
  };

  const pickImage = (index: number) => {
    pendingIndex.current = index;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadImage(pendingIndex.current, file);
          e.target.value = "";
        }}
      />

      {slides.map((slide, i) => (
        <div
          key={i}
          className="rounded-xl border border-forest-200 bg-forest-50/40 p-4"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Slide {i + 1}
            </span>
            <div className="flex items-center gap-1.5">
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSlides((prev) => {
                        const next = [...prev];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        return next;
                      })
                    }
                    disabled={i === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-forest-200 bg-white text-forest-700 transition-colors hover:border-forest-400 disabled:opacity-40"
                    aria-label="Move slide up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSlides((prev) => {
                        const next = [...prev];
                        [next[i + 1], next[i]] = [next[i], next[i + 1]];
                        return next;
                      })
                    }
                    disabled={i === slides.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-forest-200 bg-white text-forest-700 transition-colors hover:border-forest-400 disabled:opacity-40"
                    aria-label="Move slide down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() =>
                  setSlides((prev) =>
                    prev.length === 1 ? [emptySlide()] : prev.filter((_, idx) => idx !== i)
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition-colors hover:border-red-400"
                aria-label="Remove slide"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink">
                Title
              </label>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => patch(i, "title", e.target.value)}
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                placeholder="Headline shown on the slide"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink">
                Subtitle
              </label>
              <input
                type="text"
                value={slide.subtitle}
                onChange={(e) => patch(i, "subtitle", e.target.value)}
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                placeholder="Supporting text"
              />
            </div>
          </div>

          {/* Image upload */}
          <div
            className={cn(
              "relative mt-3 overflow-hidden rounded-xl border-2 border-dashed transition-colors",
              uploadingIndex === i
                ? "border-forest-500 bg-white opacity-60"
                : slide.image
                  ? "border-forest-200 bg-white"
                  : "border-forest-200 bg-white hover:border-forest-400"
            )}
          >
            {uploadingIndex === i ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="mb-3 h-6 w-6 animate-spin text-forest-500" />
                <p className="text-sm font-medium text-ink-soft">Uploading…</p>
              </div>
            ) : slide.image ? (
              <div className="flex items-center gap-4 p-3">
                <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={slide.image}
                    alt="Slide preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink-soft">{slide.image}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => pickImage(i)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50"
                    >
                      Replace image
                    </button>
                    <button
                      type="button"
                      onClick={() => patch(i, "image", "")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:border-red-400"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => pickImage(i)}
                className="flex w-full cursor-pointer flex-col items-center justify-center px-4 py-8"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50">
                  <ImageIcon className="h-5 w-5 text-forest-400" />
                </div>
                <p className="text-sm font-medium text-ink">
                  Upload slide image{" "}
                  <span className="text-forest-600">(or browse)</span>
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  PNG, JPG, GIF up to 5MB — shown full-bleed behind the slide
                  text
                </p>
              </button>
            )}
          </div>

          {/* CTA */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink">
                Button label
              </label>
              <input
                type="text"
                value={slide.cta?.label ?? ""}
                onChange={(e) => patchCta(i, "label", e.target.value)}
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                placeholder="e.g. Explore Project Works"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink">
                Button link
              </label>
              <input
                type="text"
                value={slide.cta?.href ?? ""}
                onChange={(e) => patchCta(i, "href", e.target.value)}
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                placeholder="/projects"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setSlides((prev) => [...prev, emptySlide()])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-forest-300 px-4 py-2 text-sm font-semibold text-forest-700 transition-colors hover:border-forest-500 hover:bg-forest-50"
      >
        <Plus className="h-4 w-4" />
        Add slide
      </button>

      {/* Serialize the list into the form payload. */}
      <input type="hidden" name={name} value={JSON.stringify(slides)} />
      <p className="text-xs leading-relaxed text-ink-soft">
        Images upload to the server immediately; click{" "}
        <strong>Save All Settings</strong> to publish the changes.
      </p>
    </div>
  );
}