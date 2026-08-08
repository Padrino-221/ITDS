import { prisma } from "./prisma";

export type HeroSlide = {
  title: string;
  subtitle: string;
  image: string;
  cta?: { label: string; href: string };
};

export type Stat = { value: string; label: string };

export type Welcome = {
  heading: string;
  name: string;
  title: string;
  image: string;
  message: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  address: string;
  hours: string;
};

export type Socials = {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
};

export type FeaturedLink = {
  title: string;
  description: string;
  href: string;
  icon: string;
};

export type CoreValue = { title: string; description: string };
export type AcronymValue = { letter: string; word: string; description: string };
export type Highlight = { title: string; description: string };

export function parseSetting<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function rawSetting(key: string): Promise<string | undefined> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value;
}

export async function getStringSetting(key: string, fallback = ""): Promise<string> {
  return (await rawSetting(key)) ?? fallback;
}

export async function getJSONSetting<T>(key: string, fallback: T): Promise<T> {
  return parseSetting(await rawSetting(key), fallback);
}

export async function getContact(): Promise<ContactInfo> {
  return getJSONSetting<ContactInfo>("contact", {
    email: "itds@uenr.edu.gh",
    phone: "+233 3520 90004",
    address: "Department of ITDS, SPMS, UENR, P.O. Box 214, Sunyani, Ghana",
    hours: "Monday – Friday, 8:00am – 5:00pm",
  });
}

export async function getSocials(): Promise<Socials> {
  return getJSONSetting<Socials>("socials", {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
  });
}

export async function getWelcome(): Promise<Welcome> {
  return getJSONSetting<Welcome>("welcome", {
    heading: "Welcome Message From HOD",
    name: "Prof. Peter Appiahene",
    title: "Associate Professor & Head of Department",
    image: "",
    message: "",
  });
}

export async function getStats(): Promise<Stat[]> {
  return getJSONSetting<Stat[]>("stats", [
    { value: "4000+", label: "Registered Students" },
    { value: "8", label: "Professional Lecturers" },
    { value: "5", label: "Academic Programmes" },
    { value: "56", label: "New Courses Every Year" },
  ]);
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return getJSONSetting<HeroSlide[]>("hero_slides", []);
}

export async function getFeaturedLinks(): Promise<FeaturedLink[]> {
  return getJSONSetting<FeaturedLink[]>("featured_links", []);
}
