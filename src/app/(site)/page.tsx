import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  Images,
  Newspaper,
  Quote,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import Marquee from "@/components/Marquee";
import FAQSection from "@/components/FAQSection";
import TeamSection from "@/components/TeamSection";
import NewsletterSection from "@/components/NewsletterSection";
import { SectionHeading } from "@/components/ui";
import { NewsCard, ProjectCard, ResearchAreaCard } from "@/components/cards";
import {
  getContact,
  getFeaturedLinks,
  getHeroSlides,
  getStats,
  getWelcome,
} from "@/lib/settings";
import { getGallery, getNewsPosts, getProjects, getResearchAreas } from "@/lib/data";
import { cn } from "@/lib/utils";

const linkIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: FolderOpen,
  newspaper: Newspaper,
  clipboard: ClipboardList,
  image: Images,
};

const serviceMarquee = [
  { label: "Artificial Intelligence", href: "/research#ai" },
  { label: "Web Development", href: "/research#web" },
  { label: "Mobile Computing", href: "/research#mobile" },
  { label: "Cybersecurity", href: "/research#security" },
  { label: "Data Science", href: "/research#data" },
  { label: "Networking", href: "/research#networking" },
  { label: "IoT", href: "/research#iot" },
];

export default async function HomePage() {
  const [
    heroSlides,
    stats,
    welcome,
    featuredLinks,
    news,
    researchAreas,
    projects,
    gallery,
    contact,
  ] = await Promise.all([
    getHeroSlides(),
    getStats(),
    getWelcome(),
    getFeaturedLinks(),
    getNewsPosts(3),
    getResearchAreas(),
    getProjects("ALL", 4),
    getGallery(),
    getContact(),
  ]);

  return (
    <>
      {/* Hero */}
      <HeroCarousel slides={heroSlides} phone={contact.phone} />

      {/* Scrolling marquee */}
      <Marquee items={serviceMarquee} />

      {/* Stats band */}
      <section className="border-b border-forest-100 bg-white py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat, i) => {
            const match = stat.value.match(/^(\d+)(.*)$/);
            const num = match ? Number(match[1]) : 0;
            const suffix = match ? match[2] : stat.value;
            const icons = [Users, GraduationCap, BookOpen, Trophy];
            const Icon = icons[i % icons.length];
            return (
              <Reveal
                key={stat.label}
                delay={i * 100}
                className="flex items-center gap-4 rounded-xl border border-forest-100 bg-white p-5"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold-50">
                  <Icon className="h-7 w-7 text-gold-600" />
                </div>
                <div>
                  <p className="display-heading text-3xl font-extrabold text-forest-950 sm:text-4xl">
                    <CountUp value={num} suffix={suffix} />
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* About section — split layout */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Images — HOD photo only */}
            <Reveal>
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={welcome.image || "/images/about/hod.jpg"}
                  alt={welcome.name}
                  width={400}
                  height={520}
                  className="h-[440px] w-full object-cover object-top transition-transform duration-700 hover:scale-105 sm:h-[560px]"
                />
              </div>
              {/* Quote card — below the photo, not overlapping it */}
              <div className="mt-6 rounded-xl border border-forest-100 bg-white p-5 shadow-xl shadow-forest-950/10">
                <div className="flex items-start gap-3">
                  <Quote className="h-8 w-8 shrink-0 text-gold-500" />
                  <p className="text-sm font-medium italic leading-relaxed text-ink-soft">
                    &ldquo;We produce graduates who build systems that transform lives.&rdquo;
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Content */}
            <Reveal delay={150}>
              <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-600">
                Who We Are
              </span>
              <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-4xl">
                {welcome.heading}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-soft">
                {welcome.message}
              </p>

              {/* Author */}
              <div className="mt-8">
                <p className="font-display text-base font-extrabold text-forest-950">
                  {welcome.name}
                </p>
                <p className="text-sm text-ink-soft">{welcome.title}</p>
              </div>

              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25"
              >
                More About Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features grid */}
      {featuredLinks.length > 0 && (
        <section className="border-y border-forest-100 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-600">
                Our Approach
              </span>
              <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-4xl">
                Essential features for modern academic success
              </h2>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredLinks.map((link, i) => {
                const Icon = linkIcons[link.icon] ?? FolderOpen;
                const accent = i === 1;
                const dark = i === 2;
                return (
                  <Reveal key={link.title} delay={i * 80}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl",
                        dark
                          ? "border-forest-950 bg-forest-950 text-white hover:shadow-forest-950/20"
                          : accent
                            ? "border-gold-500 bg-gold-500 text-white hover:shadow-gold-500/20"
                            : "border-forest-100 bg-white text-ink hover:border-gold-300 hover:shadow-forest-950/5"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
                          dark
                            ? "bg-white/10 text-gold-400"
                            : accent
                              ? "bg-white/20 text-white"
                              : "bg-forest-50 text-forest-700 group-hover:bg-gold-500 group-hover:text-white"
                        )}
                      >
                        <Icon className="h-7 w-7" />
                      </span>
                      <h3 className="mt-5 font-display text-lg font-extrabold leading-snug">
                        {link.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-2 text-sm leading-relaxed",
                          dark ? "text-white/70" : accent ? "text-white/85" : "text-ink-soft"
                        )}
                      >
                        {link.description}
                      </p>
                      <span
                        className={cn(
                          "mt-auto flex items-center gap-1.5 pt-5 text-sm font-bold transition-colors",
                          dark
                            ? "text-gold-400"
                            : accent
                              ? "text-white"
                              : "text-forest-800 group-hover:text-gold-600"
                        )}
                      >
                        Explore More
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Latest news */}
      <section className="bg-forest-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-400">
                <Newspaper className="h-4 w-4" />
                News &amp; Blogs
              </span>
              <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
                Our Latest News &amp; Blogs
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                View All Blogs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((post, i) => (
              <Reveal key={post.id} delay={i * 90}>
                <NewsCard post={post} variant="dark" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Research areas */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-600">
              <BookOpen className="h-4 w-4" />
              Research
            </span>
            <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-4xl">
              Our Research Areas
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
              The core research domains shaping student projects and postgraduate study.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {researchAreas.slice(0, 4).map((area, i) => (
              <Reveal key={area.id} delay={i * 80}>
                <ResearchAreaCard area={area} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-lg border border-forest-200 bg-white px-6 py-3 text-sm font-bold text-forest-800 transition-all hover:-translate-y-0.5 hover:border-forest-400 hover:shadow-lg"
            >
              All Research Areas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-lg bg-forest-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-forest-700">
                <ClipboardList className="h-4 w-4" />
                Student Work
              </span>
              <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-4xl">
                Featured Project Works
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-forest-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
              >
                Browse All Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={i * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery — horizontal carousel */}
      {gallery.length > 0 && (
        <section className="bg-forest-950 py-20 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-400">
                <Images className="h-4 w-4" />
                Moments
              </span>
              <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
                Department Gallery
              </h2>
            </div>
          </div>
          <div className="mt-12 flex gap-4 animate-[marquee_40s_linear_infinite] w-max">
            {[...gallery, ...gallery, ...gallery].map((item, i) => (
              <figure
                key={`${item.id}-${i}`}
                className="group relative h-56 w-72 shrink-0 overflow-hidden rounded-xl md:h-64 md:w-80"
              >
                <Image
                  src={item.src}
                  alt={item.caption ?? "Gallery image"}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-forest-950/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-sm font-semibold text-white">{item.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          {/* Reverse row */}
          <div className="mt-4 flex gap-4 animate-[marquee_40s_linear_infinite_reverse] w-max">
            {[...gallery, ...gallery, ...gallery].map((item, i) => (
              <figure
                key={`${item.id}-rev-${i}`}
                className="group relative h-56 w-72 shrink-0 overflow-hidden rounded-xl md:h-64 md:w-80"
              >
                <Image
                  src={item.src}
                  alt={item.caption ?? "Gallery image"}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-forest-950/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-sm font-semibold text-white">{item.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Team */}
      <TeamSection />

      {/* FAQ */}
      <FAQSection />

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}
