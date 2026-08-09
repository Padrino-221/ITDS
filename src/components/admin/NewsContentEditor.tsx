"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { useToast } from "./Toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — matches /api/uploads

/**
 * Client-side news content editor. Lets authors insert images between
 * paragraphs: on upload the returned /uploads/... URL is written into the
 * content textarea as a `![caption](url)` marker (server actions cannot
 * render a controlled <textarea>, so the value lives here and submits via
 * the parent <form>).
 */
export function NewsContentEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const insertImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file (PNG, JPG or GIF).", "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast("The image is larger than 5MB. Please choose a smaller file.", "error");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        toast(data?.error ?? "Upload failed. Please try again.", "error");
        return;
      }
      const caption = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();
      const marker = `\n\n![${caption}](${data.url})\n\n`;
      const ta = textareaRef.current;
      const start = ta?.selectionStart ?? value.length;
      const end = ta?.selectionEnd ?? start;
      const next = value.slice(0, start) + marker + value.slice(end);
      setValue(next);
      requestAnimationFrame(() => {
        if (ta) {
          const pos = start + marker.length;
          ta.focus();
          ta.setSelectionRange(pos, pos);
        }
      });
    } catch {
      toast("Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">
          Content <span className="text-gold-600">*</span>
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          {uploading ? "Uploading…" : "Insert image"}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        rows={10}
        required
        minLength={10}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Start writing your post…\n\nUse the "Insert image" button (or type ![caption](url) on its own line) to add photos between paragraphs.`}
        className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
      />
      <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
        Separate paragraphs with a blank line. Use <strong>Insert image</strong> to
        add photos between paragraphs.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void insertImage(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}