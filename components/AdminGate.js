"use client";
// Shows a simple login form before the Studio. A correct demo login stores a Studio token
// in this browser (Sanity reads it from localStorage), so no Sanity account is needed.
import { useEffect, useState } from "react";

export default function AdminGate({ projectId, children }) {
  const key = `__studio_auth_token_${projectId}`;
  const [state, setState] = useState("check"); // check | form | studio
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let has = false;
    try { has = !!JSON.parse(localStorage.getItem(key) || "null")?.token; } catch {}
    const skip = new URLSearchParams(location.search).has("sanity");
    setState(has || skip ? "studio" : "form");
  }, [key]);

  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/demo-login", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ login: f.get("login"), password: f.get("password") }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.token) { setErr(r.status === 429 ? "Çok fazla deneme. 10 dakika sonra tekrar deneyin." : "Kullanıcı adı veya şifre yanlış."); return; }
      try { localStorage.setItem(key, JSON.stringify({ token: d.token, time: new Date().toISOString() })); } catch {}
      location.reload();
    } finally { setBusy(false); }
  }

  if (state === "studio") return children;
  if (state === "check") return null;

  const s = {
    page: { minHeight: "100dvh", display: "grid", placeItems: "center", background: "#0B0C10", fontFamily: "Onest, system-ui, sans-serif", padding: 16, position: "relative", overflow: "hidden" },
    glowA: { position: "absolute", width: 520, height: 520, left: -160, bottom: -200, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(44,69,216,.45), transparent)", filter: "blur(30px)" },
    glowB: { position: "absolute", width: 520, height: 520, right: -160, top: -200, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,90,31,.35), transparent)", filter: "blur(30px)" },
    card: { position: "relative", width: "100%", maxWidth: 380, background: "#fff", borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 30px 80px rgba(0,0,0,.35)" },
    h: { margin: "0 0 4px", fontSize: 22, fontWeight: 600, color: "#0D0F14", letterSpacing: "-.01em" },
    sub: { margin: "0 0 8px", fontSize: 14, color: "#6B6F78" },
    label: { display: "flex", flexDirection: "column", gap: 7, fontSize: 13, fontWeight: 500, color: "#6B6F78" },
    input: { font: "inherit", fontSize: 16, padding: "14px 16px", borderRadius: 12, border: "1px solid #E3E5E1", background: "#F3F4F1", color: "#0D0F14", outline: "none" },
    btn: { font: "inherit", fontSize: 16, fontWeight: 600, padding: "15px 18px", borderRadius: 12, border: 0, background: "#2C45D8", color: "#fff", cursor: "pointer", marginTop: 6 },
    err: { margin: 0, fontSize: 14, color: "#C2361B" },
    alt: { fontSize: 13, color: "#6B6F78", textAlign: "center", marginTop: 4 },
  };
  return (
    <div style={s.page}>
      <div style={s.glowA} /><div style={s.glowB} />
      <form style={s.card} onSubmit={submit}>
        <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true"><rect width="14" height="48" rx="2.5" fill="#0D0F14"/><circle cx="33" cy="13" r="13" fill="#0D0F14"/><circle cx="33" cy="13" r="4.4" fill="#FF5A1F"/><path d="M14 23.5h13.5L48 48H33.5L14 30z" fill="#0D0F14"/></svg>
        <div><h1 style={s.h}>Yönetim paneli</h1><p style={s.sub}>Koş Makine · makineler ve talepler</p></div>
        <label style={s.label}>Kullanıcı adı<input style={s.input} name="login" autoComplete="username" required /></label>
        <label style={s.label}>Şifre<input style={s.input} name="password" type="password" autoComplete="current-password" required /></label>
        {err ? <p style={s.err}>{err}</p> : null}
        <button style={s.btn} type="submit" disabled={busy}>{busy ? "Giriş…" : "Giriş yap"}</button>
        <a style={s.alt} href="/admin?sanity=1">Sanity hesabıyla giriş</a>
      </form>
    </div>
  );
}
