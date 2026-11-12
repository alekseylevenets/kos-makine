// Simple demo login for the admin panel (shows the Studio without a Sanity account).
// Credentials live only in Vercel env vars (never in this public repo): DEMO_LOGIN + DEMO_PASSWORD.
// Remove them (or set DEMO_LOGIN=off) to switch the demo login off.
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

const sha = (s) => createHash("sha256").update(s).digest();
const hits = new Map();

export async function POST(req) {
  const envLogin = process.env.DEMO_LOGIN, envPass = process.env.DEMO_PASSWORD;
  if (!envLogin || !envPass || envLogin === "off") return NextResponse.json({ ok: false }, { status: 404 });
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "?";
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60e3);
  if (list.length >= 10) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  hits.set(ip, [...list, now]);

  let b = {};
  try { b = await req.json(); } catch {}
  const given = `${String(b.login || "").trim().toLowerCase()}:${String(b.password || "")}`;
  const expected = `${envLogin.trim().toLowerCase()}:${envPass}`;
  if (!timingSafeEqual(sha(given), sha(expected))) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, token });
}
