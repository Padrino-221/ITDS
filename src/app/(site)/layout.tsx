import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Public pages are statically generated at build time and re-generated
// whenever a CMS save triggers revalidatePath("/", "layout") in the admin
// actions. Only pages that genuinely need request-time data (e.g. the
// searchParams-filtered /news and /projects pages) stay dynamic.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
