import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/admin/Toast";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ITDS | UENR",
    template: "%s | ITDS UENR",
  },
  description:
    "Department of Information Technology and Decision Sciences, University of Energy and Natural Resources, Sunyani, Ghana.",
  keywords: [
    "ITDS",
    "UENR",
    "Information Technology",
    "Decision Sciences",
    "University of Energy and Natural Resources",
    "Sunyani",
    "Ghana",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "ITDS Department — UENR",
    locale: "en_GH",
    url: SITE_URL,
    title: { default: "ITDS | UENR", template: "%s | ITDS UENR" },
    description:
      "Department of Information Technology and Decision Sciences, University of Energy and Natural Resources, Sunyani, Ghana.",
    images: [{ url: "/itds-logo.png", width: 512, height: 512, alt: "ITDS Department — UENR" }],
  },
  twitter: {
    card: "summary",
    title: { default: "ITDS | UENR", template: "%s | ITDS UENR" },
    description:
      "Department of Information Technology and Decision Sciences, University of Energy and Natural Resources, Sunyani, Ghana.",
    images: ["/itds-logo.png"],
  },
  icons: {
    icon: [{ url: "/icon.png", sizes: "96x96", type: "image/png" }],
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
