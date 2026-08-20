"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, ExternalLink } from "lucide-react";
import { DEGREE_LABELS } from "@/lib/data";
import {
  AdminCard,
  Field,
  TextArea,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/ui";
import { Select } from "@/components/admin/Dropdown";
import { createSpmsProject, updateSpmsProject } from "@/app/spms/(protected)/actions";

type Lecturer = { id: string; name: string };
type ResearchArea = { id: string; title: string };
type Program = { id: string; title: string; degreeLevel: string };

export default function SpmsProjectForm({
  project,
  lecturers,
  researchAreas,
  programs,
  academicYears,
  userRole,
  userEmail,
}: {
  project?: any;
  lecturers: Lecturer[];
  researchAreas: ResearchArea[];
  programs: Program[];
  academicYears: string[];
  userRole: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
  } | null>(
    project?.documentUrl
      ? { url: project.documentUrl, name: project.documentName ?? "document.pdf" }
      : null
  );
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("File size must be under 20MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/spms/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setUploadedFile({ url: data.url, name: file.name });
      } else {
        alert(data.error || "Upload failed.");
      }
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeFile() {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (uploadedFile) {
      formData.set("documentUrl", uploadedFile.url);
      formData.set("documentName", uploadedFile.name);
    }

    if (project) {
      await updateSpmsProject(project.id, formData);
    } else {
      await createSpmsProject(formData);
    }
  }

  // Auto-assign supervisor if lecturer (not admin)
  const defaultSupervisor =
    userRole === "LECTURER"
      ? lecturers.find((l) => l.name.toLowerCase().includes(userEmail.split("@")[0]))?.id ?? ""
      : project?.supervisorId ?? "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Project Details */}
      <AdminCard title="Project Details">
        <div className="space-y-4">
          <Field label="Topic" required>
            <input
              name="title"
              required
              minLength={3}
              defaultValue={project?.title ?? ""}
              placeholder="Enter project topic"
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Research Area" required>
              <Select
                name="researchAreaId"
                required
                defaultValue={project?.researchAreaId ?? ""}
                placeholder="Select research area…"
                options={researchAreas.map((area) => ({
                  value: area.id,
                  label: area.title,
                }))}
              />
            </Field>

            <Field label="Programme" required>
              <Select
                name="program"
                required
                defaultValue={project?.program ?? ""}
                placeholder="Select programme…"
                options={programs.map((prog) => ({
                  value: prog.title,
                  label: prog.title,
                }))}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Academic Year" required>
              <Select
                name="academicYear"
                required
                defaultValue={project?.academicYear ?? ""}
                placeholder="Select academic year…"
                options={academicYears.map((year) => ({
                  value: year,
                  label: year,
                }))}
              />
            </Field>

            <Field label="Degree Level" required>
              <Select
                name="degreeLevel"
                required
                defaultValue={project?.degreeLevel ?? "UNDERGRADUATE"}
                options={Object.entries(DEGREE_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Supervisor" required>
              <Select
                name="supervisorId"
                required
                defaultValue={defaultSupervisor}
                placeholder="Select supervisor…"
                options={lecturers.map((l) => ({
                  value: l.id,
                  label: l.name,
                }))}
              />
            </Field>

            <Field label="Project Main Objective" required>
              <input
                name="objective"
                required
                defaultValue={project?.objective ?? ""}
                placeholder="e.g. Design a mobile app for…"
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
          </div>

          <Field label="Group Members" required hint="List all team members">
            <TextArea
              name="groupMembers"
              rows={4}
              required
              defaultValue={project?.groupMembers ?? ""}
              placeholder="Enter group member names, one per line"
            />
          </Field>

          <Field label="GitHub Link" required>
            <div className="relative">
              <ExternalLink className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                name="githubLink"
                required
                defaultValue={project?.githubLink ?? ""}
                placeholder="https://github.com/..."
                className="w-full rounded-lg border border-forest-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </Field>
        </div>
      </AdminCard>

      {/* Section 2: Document Upload */}
      <AdminCard title="Project Document" action={<span className="text-xs text-ink-soft">PDF only, max 20MB</span>}>
        {uploadedFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-forest-200 bg-forest-50 p-4">
            <FileText className="h-8 w-8 text-forest-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-forest-800">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-forest-600">Uploaded successfully</p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="rounded-lg p-1 text-forest-600 hover:bg-forest-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-forest-200 p-8 transition-colors hover:border-forest-400 hover:bg-forest-50"
          >
            <Upload className="h-10 w-10 text-ink-soft" />
            <p className="mt-2 text-sm font-medium text-forest-900">
              {uploading ? "Uploading…" : "Click to upload or drag and drop"}
            </p>
            <p className="mt-1 text-xs text-ink-soft">PDF only, max 20MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </AdminCard>

      {/* Section 3: Abstract */}
      <AdminCard title="Abstract">
        <TextArea
          name="abstract"
          rows={8}
          required
          defaultValue={project?.abstract ?? ""}
          placeholder="Enter the project abstract / summary"
        />
      </AdminCard>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-forest-100 pt-6">
        <PrimaryButton type="submit" disabled={submitting || uploading}>
          {submitting
            ? "Submitting…"
            : project
              ? "Update Project"
              : "Submit Project"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={() => router.back()}>
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}
