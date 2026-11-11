// One-time import of the 12 demo machines + site settings into Sanity.
// Open: https://<site>/api/seed?secret=<SEED_SECRET>   (add &force=1 to overwrite existing demo docs)
import { NextResponse } from "next/server";
import { writeClient } from "../../../lib/sanity";
import { SEED, DEF_SET } from "../../../lib/content";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req) {
  const url = new URL(req.url);
  const secret = process.env.SEED_SECRET;
  if (!secret || url.searchParams.get("secret") !== secret) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const client = writeClient();
  if (!client) return NextResponse.json({ ok: false, error: "SANITY_WRITE_TOKEN or project id missing" }, { status: 503 });
  const force = url.searchParams.get("force") === "1";
  const done = [];

  for (const [i, m] of SEED.entries()) {
    const _id = `machine-${m.slug}`;
    if (!force && (await client.getDocument(_id))) { done.push(`${m.slug}: skip`); continue; }
    let photos = [];
    try {
      const r = await fetch(`${url.origin}/img/${m.slug}.webp`);
      if (r.ok) {
        const asset = await client.assets.upload("image", Buffer.from(await r.arrayBuffer()), { filename: `${m.slug}.webp`, contentType: "image/webp" });
        photos = [{ _type: "image", _key: `p${i}`, asset: { _type: "reference", _ref: asset._id } }];
      }
    } catch (e) { done.push(`${m.slug}: photo error ${e.message}`); }
    const { slug, name, ...rest } = m;
    await client.createOrReplace({
      _id, _type: "machine", ...rest, name, slug: { _type: "slug", current: slug },
      price: "000 000", currency: "$", onRequest: false, published: true,
      featured: slug === "cift-hat-atlet" || slug === "film-ekstruder-55", order: i + 1,
      desc: { tr: "", en: "" }, photos,
    });
    done.push(`${m.slug}: ok`);
  }
  if (force || !(await client.getDocument("siteSettings"))) {
    await client.createOrReplace({ _id: "siteSettings", _type: "siteSettings", ...DEF_SET, mapUrl: "https://www.google.com/maps/search/?api=1&query=Emintas+Yuksel+Sanayi+Sitesi+Bayrampasa+Istanbul" });
    done.push("siteSettings: ok");
  }
  return NextResponse.json({ ok: true, done });
}
