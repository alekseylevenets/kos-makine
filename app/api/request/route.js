// Request form → document "Talep" in the admin panel.
import { NextResponse } from "next/server";
import { writeClient } from "../../../lib/sanity";

const hits = new Map(); // simple per-instance rate limit
const clip = (v, n) => String(v ?? "").trim().slice(0, n);

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (b.company_site) return NextResponse.json({ ok: true }); // bot trap: pretend success
  const name = clip(b.name, 120), phone = clip(b.phone, 40);
  if (!name || !/\d{6,}/.test(phone.replace(/\D/g, ""))) return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "?";
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60e3);
  if (list.length >= 5) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  hits.set(ip, [...list, now]);

  const client = writeClient();
  if (!client) return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
  try {
    await client.create({
      _type: "request", status: "new", name, phone,
      machine: clip(b.machine, 100), machineName: clip(b.machineName, 200), msg: clip(b.msg, 3000),
      lang: b.lang === "en" ? "en" : "tr", page: clip(b.page, 200), createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[request]", e.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
