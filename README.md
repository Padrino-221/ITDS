# ITDS · UENR — Department Website & E-Learning Platform

The official website of the **Department of Information Technology and Decision Sciences** at the University of Energy and Natural Resources (UENR), Sunyani, Ghana — rebuilt with **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma + PostgreSQL**.

It bundles three experiences in one app:

1. **Public website** — department homepage, news, programmes, projects, lecturers, research, gallery and contact.
2. **Staff panel** (`/staff-panel`) — a custom-built CMS for department staff to manage all site content, users and settings.
3. **E-Learning Hub** (`/learn`) — a w3schools-style learning platform with subjects, structured lessons, quizzes, learner accounts, progress tracking, and a review-based publishing workflow.

---

## ✨ Features

### Public website
| Route | Description |
| --- | --- |
| `/` | Homepage — hero carousel, stats, HOD welcome, featured links, news, research, projects, newsletter |
| `/about` · `/about/it-society` | Department story, vision & mission, IT Society |
| `/news` · `/news/[slug]` | News & events with category filters and article pages |
| `/programs` · `/programs/[slug]` | Academic programmes (Undergraduate, Diploma, MSc, MPhil, PhD) |
| `/projects` · `/projects/[slug]` | Student project repository with degree-level filters |
| `/lecturers` · `/lecturers/[slug]` | Faculty directory with profiles and supervised projects |
| `/research` | Research areas |
| `/gallery` | Department photo gallery |
| `/contact` | Contact info and message form (saved to the database) |
| `/sitemap.xml` · `/robots.txt` | SEO — auto-generated from the database |

### Staff panel (`/staff-panel`)
- **Dashboard** — content counts and quick actions
- **News, Projects, Lecturers, Programmes, Research** — full CRUD with uploads and publishing toggles
- **Messages** — contact-form submissions (read/unread, delete)
- **Subscribers** — newsletter subscribers
- **Users** — manage staff accounts (admin only)
- **Settings** — homepage hero slides, stats, HOD welcome, contact info, socials, about/ITS copy

Roles: **Admin** (everything, incl. user management) · **Editor** (all content) · **Lecturer** (e-learning authoring) · **Student** (learner).

### E-Learning Hub (`/learn`)
- **Catalog** — all subjects with live cross-subject **search** that indexes lesson content, not just titles
- **Structured lessons** — learning objective, rich content blocks (headings, paragraphs, code with copy button, lists), practice exercises and self-graded **quizzes**
- **Learner accounts** — register/sign in, mark lessons complete, topic progress bars and checkmarks, quiz best scores, and a *continue where you left off* dashboard
- **Publishing workflow** — lecturers author lessons, admins review them; nothing goes live without approval, and revisions of live lessons are snapshot-safe
- **Performance** — public pages are statically generated with 1-hour ISR; sessions are served through small API routes so pages never render dynamically for the sake of the header

---

## 🧰 Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, lucide-react icons |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT sessions in httpOnly cookies (`jose`), `bcryptjs` hashing |
| Validation | Zod |
| Email | Resend (newsletter welcome emails) |
| Images | `sharp`-powered optimization; uploads stored under `/uploads` |
| CI | GitHub Actions (typecheck, lint, build on every push to `master`) |

---

## 🚀 Getting started

**Prerequisites:** Node.js 20+ (22 recommended) and a running **PostgreSQL** server.

```bash
# 1. Install dependencies (Prisma client is generated automatically)
npm install

# 2. Configure environment
cp .env.example .env        # then fill in DATABASE_URL and AUTH_SECRET

# 3. Create the schema and seed sample content
npm run db:migrate
npm run db:seed

# 4. Start the dev server
npm run dev                 # http://localhost:3000
```

### Default accounts (change after first login!)
| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@itds.uenr.edu.gh` | `itds-admin123` |
| Editor | `editor@itds.uenr.edu.gh` | `editor123` |
| Lecturer | `lecturer@itds.uenr.edu.gh` | `lecturer123` |
| Student | `student@itds.uenr.edu.gh` | `student123` |

---

## 🔐 Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/itds?schema=public` |
| `AUTH_SECRET` | ✅ (prod) | Secret used to sign session cookies. Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | — | Canonical origin used by the sitemap and structured data (defaults to `https://itdsuenr.com`) |
| `RESEND_API_KEY` | — | Enables newsletter welcome emails (subscription still works without it) |
| `RESEND_EMAIL_FROM` | — | Sender for newsletter emails (defaults to `ITDS Newsletter <onboarding@resend.dev>`) |

---

## 🧰 Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with Turbopack |
| `npm run build` / `npm start` | Production build & serve |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations (`prisma migrate dev`) |
| `npm run db:seed` | Seed the database (`tsx prisma/seed.ts`) |
| `npm run db:push` | Push the schema without a migration |
| `npm run db:studio` | Browse the database with Prisma Studio |

---

## 📁 Project structure

```
prisma/
  schema.prisma        # data model
  migrations/          # SQL migrations
  seed.ts              # site content seed
  seed-learn.ts        # e-learning content seed (subjects, topics, lessons)
src/
  app/
    (site)/            # public website pages
    staff-panel/       # admin CMS (login + protected area)
    learn/             # e-learning platform (+ author/review/account groups)
    api/learn/         # session + progress endpoints for static pages
  components/
    admin/             # CMS UI (forms, dropdowns, image upload, toasts…)
    learn/             # e-learning UI (catalog, quiz, editor, progress…)
  lib/                 # auth, prisma client, settings, learn data layer
```

---

## 🗄️ Database & migrations

- The schema is defined in `prisma/schema.prisma` (PostgreSQL).
- Migrations live in `prisma/migrations/` — apply them in production with:

```bash
npx prisma migrate deploy
npm run db:seed   # optional — only for sample content
```

- The e-learning content seed (`prisma/seed-learn.ts`) is idempotent — re-running it updates lessons in place.

---

## 🚢 Deployment

1. Set the environment variables above on your host (Vercel, a VPS, etc.).
2. `npm ci && npx prisma migrate deploy && npm run db:seed && npm run build && npm start`
3. The public site and e-learning pages are served as static HTML with periodic revalidation; the staff panel, authoring and account areas stay server-rendered.
4. Uploaded images live under `/uploads` (persisted storage) — make sure your host keeps them across deploys, or use an object store.

CI (`GitHub Actions`) runs `tsc`, ESLint and a production build on every push to `master` using a temporary PostgreSQL service.

---

## 📝 Notes

- Admin changes invalidate cached pages automatically (`revalidatePath`); no manual cache-busting needed.
- The e-learning seed ships with 6 subjects, 12 topics and 25 published lessons as a starter catalog.
- Seed images are placeholders — replace them with real department photos from the staff panel.
