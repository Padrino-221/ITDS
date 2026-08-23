/**
 * Extract a YouTube video ID from a URL or return the string if it looks
 * like a bare ID already.
 *
 * Supported formats:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://youtube.com/embed/VIDEO_ID
 *   - https://youtube.com/shorts/VIDEO_ID
 *   - VIDEO_ID (bare 11-char string)
 */
function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare video ID (11 chars, alphanumeric + hyphens/underscores)
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace("www.", "");

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id || null;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return v;

      // /embed/VIDEO_ID or /shorts/VIDEO_ID
      const pathMatch = url.pathname.match(/\/(embed|shorts)\/([A-Za-z0-9_-]{11})/);
      if (pathMatch) return pathMatch[2];
    }
  } catch {
    // Not a valid URL — treat as bare ID
  }

  return null;
}

export default function YouTubeEmbed({ url }: { url: string }) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        Invalid YouTube URL: {url}
      </div>
    );
  }

  return (
    <div className="relative mt-4 w-full max-w-full overflow-hidden rounded-xl border border-forest-100">
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={`YouTube video ${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full max-w-full border-0"
        />
      </div>
    </div>
  );
}
