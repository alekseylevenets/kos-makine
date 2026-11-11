import { getMachines, getSettings } from "../../../lib/data";
import { makeR } from "../../../lib/render";
import { T } from "../../../lib/content";
import { json } from "../../../lib/site";

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const { tip } = await searchParams;
  const t = T[lang];
  const title = (tip && t.types[tip]) || t.c_h;
  return {
    title,
    description: lang === "tr" ? "Yeni ve ikinci el plastik poşet makineleri kataloğu: atlet, dipten kaynak, yandan kaynak, çöp torbası, film ekstrüderi." : "Catalog of new and used plastic bag machines: t-shirt, bottom seal, side seal, garbage bag machines and film extruders.",
    alternates: { canonical: `/${lang}/makineler`, languages: { tr: "/tr/makineler", en: "/en/makineler" } },
  };
}

export default async function Catalog({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const [machines, settings] = await Promise.all([getMachines(), getSettings()]);
  const R = makeR({ lang, machines, settings });
  const one = (v) => (typeof v === "string" && v ? [v] : []);
  const F = { types: new Set(one(sp.tip)), conds: new Set(one(sp.durum)), q: "", sort: "new" };
  return (
    <>
      <main id="app" dangerouslySetInnerHTML={{ __html: R.catalog(F) }} />
      <script id="kdata" type="application/json" dangerouslySetInnerHTML={{ __html: json({ lang, machines, settings }) }} />
    </>
  );
}
