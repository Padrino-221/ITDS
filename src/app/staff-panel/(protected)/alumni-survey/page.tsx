import { Mail, MailOpen, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import {
  AdminCard,
  AdminPageHeader,
  Pagination,
  PAGE_SIZE,
  SecondaryButton,
} from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  deleteAlumniSurveyResponse,
  toggleAlumniSurveyRead,
} from "@/app/staff-panel/actions";

function Rating({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-forest-100 bg-forest-50/40 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-forest-900">
        <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
        {value}/5
      </p>
    </div>
  );
}

export default async function AdminAlumniSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [responses, total, aggregates] = await Promise.all([
    prisma.alumniSurveyResponse.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.alumniSurveyResponse.count(),
    prisma.alumniSurveyResponse.aggregate({
      _avg: {
        preparationRating: true,
        curriculumRating: true,
        recommendRating: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const unread = responses.filter((r) => !r.read).length;
  const avg = (n: number | null | undefined) => (n ? n.toFixed(1) : "—");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Alumni Survey"
        description={
          total > 0
            ? `${total} response${total === 1 ? "" : "s"} received${unread > 0 ? ` · ${unread} unread on this page` : ""}.`
            : "Responses submitted through the alumni survey form."
        }
      />

      {total > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminCard>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Avg. career preparation
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-forest-950">
              {avg(aggregates._avg.preparationRating)}
            </p>
          </AdminCard>
          <AdminCard>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Avg. curriculum rating
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-forest-950">
              {avg(aggregates._avg.curriculumRating)}
            </p>
          </AdminCard>
          <AdminCard>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Avg. recommend score
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-forest-950">
              {avg(aggregates._avg.recommendRating)}
            </p>
          </AdminCard>
        </div>
      )}

      {responses.length === 0 ? (
        <AdminCard className="text-sm text-ink-soft">
          No responses yet. Submissions from the alumni survey page will appear here.
        </AdminCard>
      ) : (
        <div className="space-y-4">
          {responses.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border bg-white p-6 ${
                r.read ? "border-forest-100" : "border-gold-300 ring-1 ring-gold-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-forest-900">
                    {r.fullName}
                  </h2>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {r.programme} · Graduated {r.graduationYear} ·{" "}
                    <a href={`mailto:${r.email}`} className="text-forest-700 hover:underline">
                      {r.email}
                    </a>
                    {r.phone ? ` · ${r.phone}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {r.employmentStatus}
                    {r.jobTitle ? ` · ${r.jobTitle}` : ""}
                    {r.employer ? ` at ${r.employer}` : ""}
                    {r.industry ? ` · ${r.industry}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.willingToMentor && (
                    <span className="inline-flex items-center rounded-lg bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-gold-700">
                      Willing to mentor
                    </span>
                  )}
                  <form action={toggleAlumniSurveyRead.bind(null, r.id)}>
                    <SecondaryButton tone={r.read ? "default" : "gold"}>
                      {r.read ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : (
                        <MailOpen className="h-3.5 w-3.5" />
                      )}
                      {r.read ? "Mark unread" : "Mark read"}
                    </SecondaryButton>
                  </form>
                  <DeleteButton
                    action={deleteAlumniSurveyResponse.bind(null, r.id)}
                    label="Delete"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Rating label="Career preparation" value={r.preparationRating} />
                <Rating label="Curriculum" value={r.curriculumRating} />
                <Rating label="Would recommend" value={r.recommendRating} />
              </div>

              {r.skillsFeedback && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Skills to emphasise
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {r.skillsFeedback}
                  </p>
                </div>
              )}
              {r.feedback && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Additional feedback
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {r.feedback}
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs text-ink-soft/80">
                Submitted {formatDateTime(r.createdAt)}
              </p>
            </div>
          ))}
          <Pagination
            page={safePage}
            totalPages={totalPages}
            basePath="/staff-panel/alumni-survey"
          />
        </div>
      )}
    </div>
  );
}
