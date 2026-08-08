"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * File uploader for admin forms.
 *
 * On selection the file is uploaded to POST /api/uploads (a plain route
 * handler, so there is no server-action body size limit) and the returned
 * /uploads/... URL is submitted through a hidden input. Only the URL is
 * stored in the database — never the raw file or a base64 blob.
 */
export function ImageUpload({
  name,
  label,
  hint,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [preview, setPreview] = useState(defaultValue || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error ?? "Upload failed. Please try again.", "error");
        return;
      }
      if (!data?.url) {
        toast("Upload failed. Please try again.", "error");
        return;
      }
      setPreview(data.url);
    } catch {
      toast("Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    // Reset the input value so the same file can be picked again and so the
    // raw File is never included in the form payload (the URL from the
    // upload endpoint is what gets submitted via the hidden input).
    if (inputRef.current) inputRef.current.value = "";
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file (PNG, JPG or GIF).", "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast("The image is larger than 5MB. Please choose a smaller file.", "error");
      return;
    }
    void uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-gold-600">*</span>}
      </label>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          isDragging
            ? "border-forest-500 bg-forest-50"
            : preview
              ? "border-forest-200"
              : "border-forest-200 hover:border-forest-400",
          isUploading && "pointer-events-none opacity-60"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-forest-500" />
            <p className="text-sm font-medium text-ink-soft">Uploading…</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <div className="relative h-48 w-full">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setPreview("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-ink-soft shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center py-12"
            onClick={() => inputRef.current?.click()}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50">
              <ImageIcon className="h-6 w-6 text-forest-400" />
            </div>
            <p className="text-sm font-medium text-ink">
              Drop an image here or{" "}
              <span className="text-forest-600">browse</span>
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
        {/* No `name` on the raw file input — the URL from the upload endpoint
            (hidden input below) is the only value submitted for this field. */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
      </div>
      {/* Submit the uploaded file URL as the field value. */}
      <input type="hidden" name={name} value={preview} />
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{hint}</p>}
    </div>
  );
}
