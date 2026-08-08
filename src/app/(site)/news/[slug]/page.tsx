import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui";
import { getNewsBySlug, getNewsPosts } from "@/lib/data";
import { NewsCard } from "@/components/cards";
import { formatDate, paragraphs } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getNewsPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const others = (await getNewsPosts(3)).filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <>
      {/* Hero image */}
      <section className="relative h-[340px] overflow-hidden bg-forest-950 sm:h-[420px]">
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
            <Link
              href="/news"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold-300 hover:text-gold-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News &amp; Events
            </Link>
            <div className="mb-4">
              <Badge className="bg-gold-500 text-white">{post.category}</Badge>
            </div>
            <h1 className="display-heading mt-3 text-3xl font-extrabold uppercase tracking-tight text-white text-balance sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-forest-100/80">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="prose-content">
          {paragraphs(post.content).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-2 border-t border-forest-100 pt-6 text-sm text-ink-soft">
          <Tag className="h-4 w-4 text-gold-600" />
          Category: <span className="font-medium text-forest-800">{post.category}</span>
        </div>
      </article>

      {/* Related */}
      {others.length > 0 && (
        <section className="border-t border-forest-100 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-forest-900">
              More from the department
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {others.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
