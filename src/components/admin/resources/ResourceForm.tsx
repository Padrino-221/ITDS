"use client";

import { useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { Field } from "@/components/admin/ui";
import { Select } from "@/components/admin/Dropdown";
import { TextInput, TextArea } from "@/components/admin/ui";
import { upsertResource } from "@/app/staff-panel/resources/actions";
import type { Resource } from "@prisma/client";

type YearOpt = { id: string; year: string };

export function ResourceForm({
  resource,
  academicYears,
}: {
  resource?: Resource | null;
  academicYears: YearOpt[];
}) {
  const [fileUrl, setFileUrl] = useState(resource?.fileUrl ?? "");
  const [fileName, setFileName] = useState(resource?.fileName ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/resources/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setFileUrl(data.url);
        setFileName(data.name || file.name);
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={upsertResource} className="grid max-w-3xl gap-6 rounded-xl border border-forest-100 bg-white p-6">
      {resource && <input type="hidden" name="id" value={resource.id} />}
      <input type="hidden" name="fileUrl" value={fileUrl} />
      <input type="hidden" name="fileName" value={fileName} />

      <Field label="Title" required>
        <TextInput name="title" required defaultValue={resource?.title} placeholder="e.g. Student Handbook 2024/2025" />
      </Field>
      <Field label="Description" hint="Short description (optional)">
        <TextArea name="description" rows={3} defaultValue={resource?.description ?? ""} placeholder="Short description" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" required>
          <Select
            name="category"
            defaultValue={resource?.category ?? "HANDBOOK"}
            options={[
              { value: "HANDBOOK", label: "Handbook" },
              { value: "STUDENT_LIST", label: "Student List (Final Year)" },
              { value: "OTHER", label: "Other" },
            ]}
          />
        </Field>
        <Field label="Academic Year" hint="For filtering student lists by year">
          <Select
            name="academicYearId"
            defaultValue={resource?.academicYearId ?? ""}
            options={[{ value: "", label: "No year" }, ...academicYears.map((y) => ({ value: y.id, label: y.year }))]}
          />
        </Field>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          File <span className="ml-0.5 text-gold-600">*</span>
        </label>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-forest-200 bg-forest-50/50 p-6 text-center hover:border-gold-300 hover:bg-gold-50/50">
          <UploadSimple size={20} weight="duotone" className="text-gold-600" />
          <span className="text-sm font-semibold text-ink">{uploading ? "Uploading…" : fileName || "Click to upload file"}</span>
          <span className="text-xs text-ink-soft">PDF, DOCX, XLS, PPT, TXT, ZIP — up to 10MB</span>
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {fileUrl && <p className="mt-2 truncate font-mono text-xs text-forest-700">{fileName} — {fileUrl}</p>}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        {!fileUrl && <p className="mt-1 text-xs text-amber-600">File is required — upload a document</p>}
      </div>

      <div>
        <button type="submit" className="btn-pill bg-forest-800 px-6 py-2.5 text-white hover:bg-forest-700">
          {resource ? "Update resource" : "Create resource"}
        </button>
      </div>
    </form>
  );
}
