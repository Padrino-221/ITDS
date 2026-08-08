# ITDS · UENR — Department Website

A modern rebuild of the Department of Information Technology and Decision Sciences (UENR) website, built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma**, featuring a **custom-built content management system** for department staff.

## ✨ What's included

### Public website
| Page | Description |
| --- | --- |
| `/` | Homepage — hero carousel, stats, HOD welcome, featured links, latest news, research areas, featured projects, gallery, CTA |
| `/about` | Department story, vision, mission, core values, SPMS highlights, ITDS acronym values |
| `/about/it-society` | Information Technology Society — story and objectives |
| `/news` & `/news/[slug]` | News & events listing (category filters) and article detail |
| `/research` | Research areas |
| `/projects` & `/projects/[slug]` | Student project repository with degree-level filters (Undergraduate, Diploma, MSc, MPhil, PhD) and project detail |
| `/lecturers` & `/lecturers/[slug]` | Faculty directory and profiles with supervised projects |
| `/contact` | Contact info cards, message form (saved to DB), map |
| `/attendance` | Digital sign-in / sign-out portal for department events |
| `/gallery` | Department photo gallery |

### Custom CMS (admin panel)
Reach it at **`/admin`** (login: `/admin/login`).

- **Dashboard** — content counts, recent messages & attendance, quick actions
- **News & Events** — create / edit / delete / publish posts
- **Project Works** — full CRUD with degree level and supervisor (linked to lecturers)
- **Lecturers** — faculty profiles with research interests
- **Research Areas** — CRUD with icons
- **Messages** — contact-form submissions, mark read/unread, delete
- **Attendance** — all sign-in/out records, filtered views
- **Users** — manage editor/admin accounts (admin role only)
- **Site Settings** — edit homepage hero slides, stats, HOD welcome, contact info, socials, about/ITS text, JSON content blocks

Roles: **Admin** (everything, incl. users) and **Editor** (all content, not users).

## 🚀 Getting started

Requires Node.js 20+.

```bash
npm install        # installs dependencies + generates Prisma client
npm run db:migrate # creates the SQLite database from the schema
npm run db:seed    # seeds sample content + default accounts
npm run dev        # start at http://localhost:3000
```

### Default accounts (change after first login!)
| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@itds.uenr.edu.gh` | `itds-admin123` |
| Editor | `editor@itds.uenr.edu.gh` | `editor123` |

## 🗄️ Data

- **Local development:** SQLite database at `prisma/dev.db` (zero setup).
- **Production:** serverless Postgres (e.g. [Neon](https://neon.tech)). Set `DATABASE_URL` in `.env`, switch `provider` to `"postgresql"` in `prisma/schema.prisma`, then run `npm run db:migrate` (or `db:push`).

## 🔐 Environment variables (`.env`)

- `DATABASE_URL` — database connection string
- `AUTH_SECRET` — secret used to sign admin session cookies (`openssl rand -base64 32`)

## 🧰 Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build & serve |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Browse the database with Prisma Studio |

## 📝 Notes

- Content pages render fresh data on every request; admin saves invalidate the cache automatically.
- Remote images are served unoptimized by default (`next.config.ts`) — re-enable optimization on a fast production host if desired.
- Images in seed data use Unsplash placeholders; replace them with real department photos via the admin panel.
