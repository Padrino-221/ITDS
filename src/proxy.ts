import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const LEARN_URL = process.env.NEXT_PUBLIC_LEARN_URL ?? "https://learn.itdsuenr.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://itdsuenr.com";

/**
 * Host routing for the E-Learning Hub.
 *
 * The learning platform lives in this same app under the /learn route tree.
 * On the learning subdomain (learn.itdsuenr.com) we serve that tree from the
 * root URL, and on the main site we 301 /learn traffic to the subdomain so
 * there is a single canonical home for it.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.nextUrl.hostname.replace(/^www\./i, "");

  if (host === new URL(LEARN_URL).hostname) {
    // API routes and framework/static assets already resolve at their real
    // paths on the subdomain.
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next/")
    ) {
      return NextResponse.next();
    }

    // Canonicalize any stale prefixed URLs: learn.x/learn/foo -> learn.x/foo
    if (pathname === "/learn" || pathname.startsWith("/learn/")) {
      const dest = request.nextUrl.clone();
      dest.pathname = pathname === "/learn" ? "/" : pathname.slice("/learn".length);
      dest.search = search;
      return NextResponse.redirect(dest);
    }

    // Serve the learning app from the root of the subdomain.
    const dest = request.nextUrl.clone();
    dest.pathname = `/learn${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(dest);
  }

  // Main site: redirect /learn to the subdomain. Host-gated (plus production
  // only) so local development and Vercel preview environments keep working
  // on their own transient hosts.
  if (
    process.env.NODE_ENV === "production" &&
    host === new URL(SITE_URL).hostname
  ) {
    const isLearn = pathname === "/learn" || pathname.startsWith("/learn/");
    if (isLearn) {
      const dest = new URL(LEARN_URL);
      dest.pathname = pathname.replace(/^\/learn/, "") || "/";
      dest.search = search;
      return NextResponse.redirect(dest, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except API routes, uploaded files, static assets,
    // image optimization and metadata files. (_next/data routes still run
    // through proxy so RSC payloads stay routable on the subdomain.)
    "/((?!api|uploads|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};