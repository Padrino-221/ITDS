import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/ui";
import ContactForm from "@/components/ContactForm";
import { getContact } from "@/lib/settings";

export const metadata = {
  title: "Contact Us",
  description:
    "Contact the Department of Information Technology and Decision Sciences, UENR — email, phone, location and office hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: "Contact Us — ITDS UENR",
    description: "Get in touch with the Department of Information Technology and Decision Sciences, UENR.",
  },
};

// Re-generate when the contact settings change (on-demand ISR); 1h fallback.
export const revalidate = 3600;

export default async function ContactPage() {
  const contact = await getContact();

  const cards = [
    {
      icon: Mail,
      title: "Email",
      lines: [contact.email],
      href: `mailto:${contact.email}`,
    },
    {
      icon: Phone,
      title: "Phone",
      lines: [contact.phone],
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
    {
      icon: MapPin,
      title: "Address",
      lines: [contact.address],
    },
    {
      icon: Clock,
      title: "Office Hours",
      lines: [contact.hours],
    },
  ];

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="We would love to hear from you. Reach out to the department or send us a message below."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-forest-100 bg-white p-6 transition-all hover:-translate-y-1"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <card.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-forest-900">
                {card.title}
              </h3>
              {card.lines.map((line) =>
                card.href ? (
                  <a
                    key={line}
                    href={card.href}
                    className="mt-1 block text-sm break-words text-ink-soft transition-colors hover:text-forest-700"
                  >
                    {line}
                  </a>
                ) : (
                  <p key={line} className="mt-1 text-sm leading-relaxed break-words text-ink-soft">
                    {line}
                  </p>
                )
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Send a Message"
              title="Leave us a message"
              description="Fill in the form and the department will get back to you as soon as possible."
            />
            <div className="mt-8 rounded-xl border border-forest-100 bg-white p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Find Us"
              title="Our Location"
              description="We are located at the University of Energy and Natural Resources main campus, Sunyani."
            />
            <div className="mt-8 overflow-hidden rounded-xl border border-forest-100">
              <iframe
                title="Map showing UENR Sunyani campus"
                src="https://maps.google.com/maps?q=University%20of%20Energy%20and%20Natural%20Resources%2C%20Sunyani%2C%20Ghana&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
