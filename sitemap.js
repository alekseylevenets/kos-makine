import { getMachines } from "../lib/data";
import { SITE_URL } from "../lib/site";

export const revalidate = 3600;

export default async function sitemap() {
  const machines = await getMachines();
  const now = new Date();
  const page = (p, priority) => ({
    url: `${SITE_URL}/tr${p}`, lastModified: now, priority,
    alternates: { languages: { tr: `${SITE_URL}/tr${p}`, en: `${SITE_URL}/en${p}` } },
  });
  return [page("", 1), page("/makineler", 0.9), ...machines.map((m) => page(`/makineler/${m.slug}`, 0.8))];
}
