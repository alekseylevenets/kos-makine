import "server-only";
import { client } from "./sanity";
import { SEED, DEF_SET } from "./content";

export const REVALIDATE = 60; // seconds: admin changes appear on the site within a minute

const seedMachines = () =>
  SEED.map((m, i) => ({ published: true, featured: false, onRequest: false, price: "000 000", currency: "$", order: i,
    desc: { tr: "", en: "" }, ...m, photos: [`/img/${m.slug}.webp`] }));

const Q_MACHINES = `*[_type=="machine" && published != false && defined(slug.current)]
  | order(coalesce(order, 999) asc, name.tr asc){
  "slug": slug.current, type, cond, model, year, width, length, thick, speed, power,
  price, currency, onRequest, featured, order, name, desc,
  "photos": photos[defined(asset)].asset->url
}`;
const Q_SETTINGS = `*[_id=="siteSettings"][0]{phone, whatsapp, email, instagram, person, address, legal, mapUrl}`;

const norm = (m) => ({
  type: "tshirt", cond: "new", model: "", year: "", width: "", length: "", thick: "", speed: "", power: "",
  price: "", currency: "$", onRequest: false, featured: false,
  ...Object.fromEntries(Object.entries(m).filter(([, v]) => v !== null && v !== undefined)),
  name: { tr: "", en: "", ...(m.name || {}) },
  desc: { tr: "", en: "", ...(m.desc || {}) },
  photos: (m.photos || []).filter(Boolean).map((u) => (u.startsWith("http") ? `${u}?w=1400&fit=max&auto=format&q=82` : u)),
});

async function fetchQ(q) {
  return client.fetch(q, {}, { next: { revalidate: REVALIDATE, tags: ["sanity"] } });
}

export async function getMachines() {
  if (!client) return seedMachines();
  try {
    const list = await fetchQ(Q_MACHINES);
    if (!list || !list.length) return seedMachines(); // before the first import the site still looks complete
    return list.map(norm);
  } catch (e) {
    console.error("[sanity] machines:", e.message);
    return seedMachines();
  }
}

export async function getSettings() {
  const base = JSON.parse(JSON.stringify(DEF_SET));
  if (!client) return base;
  try {
    const v = (await fetchQ(Q_SETTINGS)) || {};
    const nn = (o) => Object.fromEntries(Object.entries(o || {}).filter(([, x]) => x !== null && x !== "" && typeof x !== "object"));
    return { ...base, ...nn(v), address: { ...base.address, ...nn(v.address) }, legal: { ...base.legal, ...nn(v.legal) } };
  } catch (e) {
    console.error("[sanity] settings:", e.message);
    return base;
  }
}
