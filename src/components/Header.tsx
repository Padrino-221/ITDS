import SiteHeader from "./SiteHeader";
import { getStringSetting } from "@/lib/settings";

export default async function Header() {
  const announcement = await getStringSetting("announcement", "");

  return <SiteHeader announcement={announcement} />;
}
