import type { ContentBlock } from "@/lib/learn";

export default function LessonContent({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks.length) {
    return <p className="text-ink-soft">No content yet.</p>;
  }
  return (
    <div>
      {blocks.map((block, i) => {
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
              <pre
                key={i}
                className="mt-4 overflow-x-auto rounded-xl bg-forest-950 p-4 text-[13px] leading-relaxed text-emerald-100"
              >
                <code>{block.code}</code>
              </pre>
            );
          case "list":
            return (
              <ul key={i} className="mt-3 list-disc space-y-1.5 break-words pl-5 text-ink">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
