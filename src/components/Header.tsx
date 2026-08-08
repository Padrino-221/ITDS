import SiteHeader from "./SiteHeader";
import { getContact, getStringSetting } from "@/lib/settings";

export default async function Header() {
  const [announcement, contact] = await Promise.all([
    getStringSetting("announcement", ""),
    getContact(),
  ]);

  return <SiteHeader announcement={announcement} email={contact.email} />;
}
