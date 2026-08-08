# Department E-Learning Platform — Technical Specification

**Status:** v1 Draft
**Owner:** Padrino
**Integration target:** Existing department Next.js website (`/learn` module)

---

## 1. Overview

A public, multi-subject learning platform integrated into the department's existing Next.js website. Content is authored by lecturers against a fixed lesson template, reviewed and published by an admin/coordinator, and freely browsable by anyone. Students may optionally create an account to track lesson progress. Programming subjects support an embedded, sandboxed code playground.

**Not this:** a course-enrollment LMS, a gradebook, or a replacement for GoQuali's assessment features. No semester/level gating. No assignments or grading in v1.

### 1.1 Core principles

- **Public-first.** Browsing content requires no account. Accounts are opt-in, for progress tracking only.
- **Template-driven authoring.** Lecturers fill a structured template, not freeform uploads — keeps quality and structure consistent across subjects without an editorial rewrite pass.
- **Draft → Review → Publish.** No lecturer-authored content goes live without a review step.
- **Reuse, don't rebuild.** Code execution uses an existing sandboxing engine (Piston) rather than a custom sandbox.
- **One deployment.** Lives inside the existing department Next.js codebase — shared nav, shared auth session, one deploy pipeline.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Extends existing department site |
| Language | TypeScript | |
| Database | PostgreSQL | Shared instance with existing site, separate schema/tables |
| ORM | Prisma | |
| Auth | Auth.js (NextAuth) | Credentials or Google sign-in; optional for students, required for lecturer/admin roles |
| Rich text editing | Tiptap (or similar) | Lecturer authoring UI, stores structured JSON |
| Code playground (client) | Monaco Editor or CodeMirror | In-browser editor UI |
| Code execution (server) | Piston (self-hosted or public API initially) | Sandboxed multi-language execution, called via a Next.js route handler |
| Styling | Match existing department site's design system | |
| Hosting | Same platform as current department site | |

---

## 3. Data Model (Prisma schema outline)

```prisma
model Subject {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  topics      Topic[]
  createdAt   DateTime @default(now())
}

model Topic {
  id          String   @id @default(cuid())
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id])
  title       String
  slug        String
  order       Int
  lessons     Lesson[]
}

model Lesson {
  id              String       @id @default(cuid())
  topicId         String
  topic           Topic        @relation(fields: [topicId], references: [id])
  title           String
  slug            String
  objective       String       // "what you'll be able to do after this lesson"
  contentBody     Json         // rich text / structured content
  hasPlayground   Boolean      @default(false)
  playgroundLang  String?      // e.g. "python", "javascript"
  starterCode     String?
  exercisePrompt  String?
  quiz            Json?        // optional check-for-understanding, structured
  status          LessonStatus @default(DRAFT)
  authorId        String
  author          User         @relation("AuthoredLessons", fields: [authorId], references: [id])
  reviewerId      String?
  reviewNote      String?
  order           Int
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum LessonStatus {
  DRAFT
  IN_REVIEW
  CHANGES_REQUESTED
  PUBLISHED
}

model User {
  id              String   @id @default(cuid())
  name            String?
  email           String   @unique
  role            Role     @default(STUDENT)
  authoredLessons Lesson[] @relation("AuthoredLessons")
  progress        UserProgress[]
  createdAt       DateTime @default(now())
}

enum Role {
  STUDENT
  LECTURER
  ADMIN
}

model UserProgress {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  lessonId   String
  completed  Boolean  @default(false)
  completedAt DateTime?

  @@unique([userId, lessonId])
}
```

---

## 4. Route Structure

```
/learn                          Subject catalog (public)
/learn/[subject]                Topic list within a subject (public)
/learn/[subject]/[topic]/[lesson]   Lesson view — content + playground if applicable (public)
/learn/account/progress         Student's completed lessons (auth required)
/learn/author                   Lecturer authoring dashboard (role: LECTURER, ADMIN)
/learn/author/[lessonId]/edit   Lesson editor form (role: LECTURER, ADMIN — own lessons only unless ADMIN)
/learn/review                   Review queue (role: ADMIN)
/learn/review/[lessonId]        Review a specific submission (role: ADMIN)

/api/learn/execute              POST — proxies code to Piston, returns output
/api/learn/progress             POST/GET — mark lesson complete / fetch progress
/api/learn/lessons/[id]/submit  POST — lecturer submits draft for review
/api/learn/lessons/[id]/review  POST — admin approves/requests changes
```

---

## 5. Authoring & Review Workflow

1. **Lecturer** creates a lesson via `/learn/author`, filling the fixed template (see §6). Saved as `DRAFT`.
2. Lecturer submits for review → status becomes `IN_REVIEW`.
3. **Admin/coordinator** reviews via `/learn/review/[lessonId]`:
   - Approve → status `PUBLISHED`, becomes publicly visible.
   - Request changes → status `CHANGES_REQUESTED` with a `reviewNote`, returns to lecturer.
4. Lecturer can edit and resubmit at any point while in `DRAFT` or `CHANGES_REQUESTED`.
5. Published lessons can be revised by their author; edits create a new `DRAFT` revision rather than mutating the live version directly (avoids live content flashing mid-edit — implementation detail: either a `publishedContentBody` snapshot field, or a simple revisions table if you want full history later).

---

## 6. Lesson Template (fixed structure for authoring)

Every lesson, regardless of subject, is authored against this structure:

1. **Title**
2. **Learning objective** — one sentence: what the student will be able to do
3. **Content body** — rich text, may include images/diagrams
4. **Worked example** — explanation with optional embedded code block
5. **Practice exercise** (optional) — if `hasPlayground` is true, student gets an interactive editor; otherwise a self-check prompt
6. **Quiz / check for understanding** (optional) — short, 1–3 questions, self-graded

This structure is enforced in the authoring UI (`/learn/author/[lessonId]/edit`) as distinct form sections, not a single freeform text box — this is what keeps quality consistent across lecturers who've never done instructional design before.

---

## 7. Code Playground

- **Client:** Monaco or CodeMirror editor embedded in the lesson view when `hasPlayground` is true, pre-filled with `starterCode`.
- **Execution:** Student clicks "Run" → POST to `/api/learn/execute` with `{ language, code, stdin? }` → route handler forwards to Piston → returns `{ stdout, stderr, exitCode }`.
- **Piston hosting:** Start against Piston's public API for early testing; move to a self-hosted Piston instance (Docker) once usage grows, to avoid rate limits and keep execution latency predictable.
- **Security note:** Piston already handles sandboxing (isolated containers per execution) — do not attempt to execute arbitrary code directly on your own server outside of Piston.

---

## 8. Roles Summary

| Role | Can do |
|---|---|
| **Student** (or anonymous) | Browse all published content. Optionally sign in to track progress. |
| **Lecturer** | Author/edit lessons for their subject(s). Submit for review. Cannot publish directly. |
| **Admin/Coordinator** | Review, approve, or request changes on submissions. Manage subject/topic structure. Full visibility across all subjects. |

---

## 9. Phased Roadmap

**Phase 1 — Core content delivery**
- Subject/Topic/Lesson browsing (public)
- Lecturer authoring UI + draft/review/publish workflow
- Optional student accounts + progress tracking (mark lesson complete)
- No playground yet — text/example content only

**Phase 2 — Interactivity**
- Code playground integration (Piston)
- Practice exercises with instant feedback for programming subjects
- Quiz / check-for-understanding blocks

**Phase 3 — Polish & retention**
- Search across subjects/topics
- "Continue where you left off" on the account dashboard
- Optional light gamification (completion streaks, badges) — only if adoption data suggests it's worth the effort

---

## 10. Open Items to Confirm Before Build

- Final design system reference (reuse existing department site's tokens/components)
- Whether existing department site already has auth — if yes, extend; if no, introduce Auth.js fresh
- Piston self-hosting timeline (public API is fine to start, but confirm before real usage scales)
- Initial subject list and first lecturers committed to authoring, to seed Phase 1 content
