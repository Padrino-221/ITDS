import type { ContentBlock } from "@/lib/learn";
import CodeBlock from "@/components/learn/CodeBlock";
import YouTubeEmbed from "@/components/learn/YouTubeEmbed";

export default function LessonContent({ blocks }: { blocks: ContentBlock[] }) {
  const items = Array.isArray(blocks) ? (blocks as ContentBlock[]) : [];
  if (!items.length) {
    return <p className="text-ink-soft">No content yet.</p>;
  }
  return (
    <div className="min-w-0">
      {items.map((block, i) => {
        switch (block.type) {
          case "heading":
            return block.level === 3 ? (
              <h3
                key={i}
                className="mt-8 font-display text-lg font-extrabold text-forest-950 first:mt-0"
              >
                {block.text}
              </h3>
            ) : (
              <h2
                key={i}
                className="mt-8 font-display text-xl font-extrabold text-forest-950 first:mt-0"
              >
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i} className="mt-3 break-words leading-relaxed text-ink first:mt-0">
                {block.text}
              </p>
            );
          case "code":
            return (
              <CodeBlock key={i} code={block.code} language={block.language} />
            );
          case "list":
            return (
              <ul key={i} className="mt-3 list-disc space-y-1.5 break-words pl-5 text-ink">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "video":
            return <YouTubeEmbed key={i} url={block.url} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
