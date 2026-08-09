import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { getContact, getSocials, getStringSetting } from "@/lib/settings";
import { LEARN_URL } from "@/lib/utils";

const brandPaths = {
  Facebook:
    "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z",
  Twitter:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  Instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 1.802c-3.155 0-3.531.012-4.777.069-2.761.126-4.083 1.476-4.209 4.209-.057 1.246-.07 1.622-.07 4.777 0 3.155.013 3.531.07 4.777.126 2.73 1.446 4.083 4.209 4.209 1.246.057 1.622.07 4.777.07 3.155 0 3.531-.013 4.777-.07 2.761-.126 4.083-1.477 4.209-4.209.057-1.246.07-1.622.07-4.777 0-3.155-.013-3.531-.07-4.777-.126-2.73-1.446-4.083-4.209-4.209-1.246-.058-1.622-.07-4.777-.07zm0 3.064a5.971 5.971 0 1 0 0 11.942 5.971 5.971 0 0 0 0-11.942zm0 9.85a3.879 3.879 0 1 1 0-7.758 3.879 3.879 0 0 1 0 7.758zm6.007-10.087a1.395 1.395 0 1 1-2.79 0 1.395 1.395 0 0 1 2.79 0z",
  Linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  Youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
} as const;

function BrandIcon({ name, className }: { name: keyof typeof brandPaths; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={brandPaths[name]} />
    </svg>
  );
}

const footerLinks = {
  department: [
    { label: "About Us", href: "/about" },
    { label: "News & Events", href: "/news" },
    { label: "Research Areas", href: "/research" },
    { label: "Lecturers", href: "/lecturers" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
  programs: [
    { label: "Undergraduate", href: "/programs/undergraduate" },
    { label: "Diploma", href: "/programs/diploma" },
    { label: "MSc", href: "/programs/msc" },
    { label: "MPhil", href: "/programs/mphil" },
    { label: "PhD", href: "/programs/phd" },
  ],
  resources: [
    { label: "Student Projects", href: "/projects" },
    { label: "IT Society", href: "/about/it-society" },
    { label: "E-Learning Hub", href: LEARN_URL },
  ],
};

export default async function Footer() {
  const [contact, socials, siteName] = await Promise.all([
    getContact(),
    getSocials(),
    getStringSetting("site_name", "ITDS | UENR"),
  ]);

  const socialIcons = [
    { href: socials.facebook, name: "Facebook", label: "Facebook" },
    { href: socials.twitter, name: "Twitter", label: "Twitter / X" },
    { href: socials.instagram, name: "Instagram", label: "Instagram" },
    { href: socials.linkedin, name: "Linkedin", label: "LinkedIn" },
    { href: socials.youtube, name: "Youtube", label: "YouTube" },
  ].filter((s) => s.href && s.href !== "#") as Array<{
    href: string;
    name: keyof typeof brandPaths;
    label: string;
  }>;

  return (
    <footer className="bg-forest-950 text-white">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/itds-logo.png"
                alt="ITDS Department Logo"
                width={48}
                height={48}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div className="leading-tight">
                <p className="font-display text-xl font-extrabold uppercase tracking-tight">
                  {siteName}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                  Department of IT &amp; Decision Sciences
                </p>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              A department of School of Sciences, University of Energy and Natural Resources, Sunyani, Ghana.
            </p>
            {socialIcons.length > 0 && (
              <div className="mt-6 flex gap-2">
                {socialIcons.map(({ href, name, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/60 transition-all hover:-translate-y-0.5 hover:bg-gold-500 hover:text-white"
                  >
                    <BrandIcon name={name} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Department
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.department.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold-400"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Programs
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.programs.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold-400"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold-400"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-4 text-sm text-white/60">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>{contact.address}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <a href={`mailto:${contact.email}`} className="hover:text-gold-400">
                  {contact.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-gold-400">
                  {contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-white/40 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteName}. University of Energy and Natural Resources. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
