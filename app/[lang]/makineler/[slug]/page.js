import { notFound } from "next/navigation";
import { getMachines, getSettings } from "../../../../lib/data";
import { makeR, LANGS } from "../../../../lib/render";
import { T } from "../../../../lib/content";
import { SITE_URL, json } from "../../../../lib/site";

export const revalidate = 60;
export const dynamicParams = true; // machines added in the admin get a page without a redeploy

export async function generateStaticParams() {
  const machines = await getMachines();
  return LANGS.flatMap((lang) => machines.map((m) => ({ lang, slug: m.slug })));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const m = (await getMachines()).find((x) => x.slug === slug);
  if (!m) return { title: lang === "tr" ? "Makine bulunamadı" : "Machine not found", robots: { index: false } };
  const name = m.name[lang] || m.name.tr;
  const t = T[lang];
  const description = (m.desc[lang] || `${name}${m.model ? ` (${m.model})` : ""}. ${t.typesDesc[m.type] || ""}. ${m.cond === "new" ? t.c_new : t.c_used}, ${m.year}.`).slice(0, 180);
  return {
    title: `${name}${m.model ? ` – ${m.model}` : ""}`,
    description,
    alternates: { canonical: `/${lang}/makineler/${slug}`, languages: { tr: `/tr/makineler/${slug}`, en: `/en/makineler/${slug}` } },
    openGraph: { title: name, description, images: m.photos[0] ? [{ url: m.photos[0] }] : [] },
  };
}

export default async function Product({ params }) {
  const { lang, slug } = await params;
  const [machines, settings] = await Promise.all([getMachines(), getSettings()]);
  const R = makeR({ lang, machines, settings });
  const m = machines.find((x) => x.slug === slug);
  if (!m) notFound();
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: m.name[lang] || m.name.tr, model: m.model,
    image: m.photos.map((p) => (p.startsWith("http") ? p : SITE_URL + p)), brand: { "@type": "Brand", name: "Koş Makine" },
    itemCondition: m.cond === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    url: `${SITE_URL}/${lang}/makineler/${slug}`,
  };
  return (
    <>
      <main id="app" dangerouslySetInnerHTML={{ __html: R.product(slug) }} />
      <div className="mbar" id="mbar" dangerouslySetInnerHTML={{ __html: R.mbar() }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(ld) }} />
    </>
  );
}
