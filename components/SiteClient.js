"use client";
// Browser behaviour of the site (menus, animations, catalog filters, request form).
// Ported from the approved prototype; pages are rendered on the server as HTML.
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { makeR } from "../lib/render";
import { T } from "../lib/content";

const reduce = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function goTo(id, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return false;
  const y = el.getBoundingClientRect().top + window.scrollY - 84;
  window.scrollTo({ top: y, behavior: smooth ? "smooth" : "instant" });
  return true;
}
function closeMenus() {
  $$(".mi.open").forEach((x) => { x.classList.remove("open"); x.querySelector("button")?.setAttribute("aria-expanded", "false"); });
  $("#mob")?.classList.remove("on");
  $("#mobdim")?.classList.remove("on");
  $("#burger")?.setAttribute("aria-expanded", "false");
}

// ---------- page effects (return cleanup) ----------
function initStrip(off) {
  const sec = $("#hs"), track = $("#track");
  if (!sec || !track) return;
  const mob = () => window.innerWidth <= 800 || reduce();
  const size = () => {
    if (mob()) { sec.style.height = ""; track.style.transform = ""; return; }
    const extra = Math.max(0, track.scrollWidth - window.innerWidth);
    sec.style.height = window.innerHeight + extra + "px";
    sec.dataset.extra = extra;
  };
  let cur = 0, raf = 0;
  const tick = () => {
    raf = 0;
    if (mob()) return;
    const r = sec.getBoundingClientRect();
    const extra = +sec.dataset.extra || 0;
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
    const target = p * extra;
    cur += (target - cur) * 0.14;
    track.style.transform = `translate3d(${-cur.toFixed(1)}px,0,0)`;
    if (Math.abs(target - cur) > 0.5) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const onTrack = () => {
    const cards = $$(".mc", track); if (!cards.length) return;
    const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
    const i = Math.round(track.scrollLeft / step);
    $$("#dots i").forEach((d, k) => d.classList.toggle("on", k === i));
  };
  const onResize = () => { size(); kick(); };
  size(); kick();
  // images change scrollWidth once loaded
  $$("img", track).forEach((im) => im.complete || im.addEventListener("load", onResize, { once: true }));
  track.addEventListener("scroll", onTrack, { passive: true });
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", onResize);
  off.push(() => { cancelAnimationFrame(raf); track.removeEventListener("scroll", onTrack); window.removeEventListener("scroll", kick); window.removeEventListener("resize", onResize); });
}
function initWhy(off) {
  const ol = $("#whylist"); if (!ol) return;
  const swap = (li) => {
    $$("li", ol).forEach((x) => x.classList.toggle("on", x === li));
    const im = $("#whyimg img"); const src = li.dataset.src;
    if (!im || !src || im.getAttribute("src") === src) return;
    im.style.opacity = 0;
    setTimeout(() => { im.onload = () => { im.style.opacity = 1; }; im.src = src; }, 180);
  };
  const over = (e) => { const li = e.target.closest("li"); if (li) swap(li); };
  const click = (e) => { const li = e.target.closest("li"); if (li) $$("li", ol).forEach((x) => x.classList.toggle("on", x === li)); };
  ol.addEventListener("mouseover", over); ol.addEventListener("click", click);
  off.push(() => { ol.removeEventListener("mouseover", over); ol.removeEventListener("click", click); });
}
function initScrollFx(off) {
  if (reduce()) {
    $$("#stmt .sw").forEach((w) => w.classList.add("lit"));
    $$(".mask").forEach((m) => m.classList.add("in"));
    return;
  }
  const hero = $("#hdark"), grid = hero && $(".gridbg", hero), photo = $(".hphoto img");
  const bands = $$(".feat,.sell");
  const stmt = $("#stmt"), t1 = $(".statement .t1"), t2 = $(".statement .t2");
  const ws = stmt ? $$(".sw", stmt) : [];
  const masks = $$(".mask");
  const mo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); mo.unobserve(e.target); } }), { threshold: 0.2 });
  masks.forEach((m) => { if (m.getBoundingClientRect().top < innerHeight) m.classList.add("in"); else mo.observe(m); });
  const f = () => {
    const y = window.scrollY;
    if (grid && y < 1200) {
      grid.style.transform = `translate3d(0,${y * 0.35}px,0)`;
      if (photo) photo.style.translate = `0 ${y * -0.05}px`;
    }
    bands.forEach((b) => { const r = b.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) b.style.setProperty("--gy", `${(-r.top * 0.3).toFixed(1)}px`); });
    if (stmt) {
      const r = stmt.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55)));
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle("lit", i < n));
      const k = (r.top + r.height / 2 - vh / 2) / vh;
      if (t1) t1.style.transform = `translateY(${k * -60}px) rotate(${-10 + k * -12}deg)`;
      if (t2) t2.style.transform = `translateY(${k * -40}px) rotate(${9 + k * 12}deg)`;
    }
  };
  f();
  window.addEventListener("scroll", f, { passive: true });
  off.push(() => { window.removeEventListener("scroll", f); mo.disconnect(); });
}
function setupReveal(off) {
  if (reduce() || !("IntersectionObserver" in window)) return;
  const sel = ".sec-head, .why > *, .bento .cell, .step, .sell > *, .faq > *, .contact > *, .statement p, .statement .btn, .pbody .desc > *, .card-p";
  const vh = window.innerHeight;
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(sel).forEach((el) => {
    if (el.closest(".hs")) return;
    if (el.getBoundingClientRect().top < vh) return; // already on screen: stays visible
    const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.transitionDelay = Math.min(sib, 4) * 80 + "ms";
    el.classList.add("rv"); io.observe(el);
  });
  off.push(() => io.disconnect());
}

// ---------- catalog ----------
const F = { types: new Set(), conds: new Set(), q: "", sort: "new" };
let CAT = null; // { R, lang }
function catData() {
  const el = $("#kdata"); if (!el) return null;
  try { return JSON.parse(el.textContent); } catch { return null; }
}
function initCatalog() {
  const d = catData();
  if (!d) { CAT = null; return; }
  CAT = { R: makeR(d), lang: d.lang };
  const sp = new URLSearchParams(location.search);
  F.types = new Set(sp.get("tip") ? [sp.get("tip")] : []);
  F.conds = new Set(sp.get("durum") ? [sp.get("durum")] : []);
  F.q = ""; F.sort = "new";
}
function renderGrid(head) {
  if (!CAT) return;
  const g = CAT.R.grid(F);
  const grid = $("#mgrid"); if (grid) grid.innerHTML = g.html;
  const res = $("#res"); if (res) res.textContent = g.count;
  if (head) {
    const h = CAT.R.catHead(F);
    $("#crumbs").innerHTML = h.crumbs; $("#cath1").textContent = h.h1;
    $$("[data-ft]").forEach((i) => { i.checked = F.types.has(i.dataset.ft); });
    $$("[data-fc]").forEach((i) => { i.checked = F.conds.has(i.dataset.fc); });
    const q = $("#q"); if (q) q.value = F.q;
    const s = $("#sort"); if (s) s.value = F.sort;
  }
  const one = F.types.size === 1 ? [...F.types][0] : "";
  const url = location.pathname + (one ? `?tip=${one}` : "");
  if (url !== location.pathname + location.search) history.replaceState(history.state, "", url);
}

// ---------- form ----------
async function submitForm(f, lang, wa) {
  const t = T[lang] || T.tr;
  const ok = $(".ok", f), btn = $("button[type=submit]", f);
  const v = (n) => (f.elements[n] ? String(f.elements[n].value || "").trim() : "");
  const sel = f.elements.machine;
  const body = { name: v("name"), phone: v("phone"), machine: v("machine"), machineName: sel && sel.value ? sel.options[sel.selectedIndex].text : "",
    msg: v("msg"), lang, page: location.pathname, company_site: v("company_site") };
  ok.hidden = false; ok.classList.remove("err");
  if (!body.name || !body.phone) { ok.textContent = t.fm_req; return; }
  btn.disabled = true; const label = btn.textContent; btn.textContent = t.fm_sending;
  try {
    const r = await fetch("/api/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(String(r.status));
    f.reset(); ok.textContent = t.fm_ok;
  } catch {
    ok.innerHTML = `${t.fm_err} <a href="${wa}" target="_blank" rel="noopener">WhatsApp ↗</a>`;
  } finally { btn.disabled = false; btn.textContent = label; }
}

export default function SiteClient({ lang, wa }) {
  const pathname = usePathname();
  const router = useRouter();

  // global listeners: once per layout (language)
  useEffect(() => {
    const hdr = $("header.top"), top = $("#totop"), menu = $("#menu");
    const onScroll = () => {
      const y = window.scrollY;
      hdr?.classList.toggle("sc", y > 8); top?.classList.toggle("on", y > 900);
      const mob = $("#mob"); if (mob?.classList.contains("on")) mob.style.setProperty("--mtop", Math.max(0, hdr.getBoundingClientRect().bottom) + "px");
    };
    const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const mOver = (e) => {
      const mi = e.target.closest("[data-dd]"); if (!mi || !matchMedia("(hover:hover)").matches) return;
      $$(".mi.open").forEach((x) => { if (x !== mi) x.classList.remove("open"); });
      mi.classList.add("open"); mi.querySelector("button").setAttribute("aria-expanded", "true");
    };
    const mLeave = () => { if (matchMedia("(hover:hover)").matches) closeMenus(); };

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const ddb = e.target.closest("[data-dd] > button");
      if (ddb) { const mi = ddb.parentElement; const was = mi.classList.contains("open"); closeMenus(); if (!was) { mi.classList.add("open"); ddb.setAttribute("aria-expanded", "true"); } return; }
      const bg = e.target.closest("#burger");
      if (bg) {
        const mob = $("#mob"); const on = !mob.classList.contains("on");
        mob.style.setProperty("--mtop", Math.max(0, hdr.getBoundingClientRect().bottom) + "px");
        mob.classList.toggle("on", on); $("#mobdim").classList.toggle("on", on); bg.setAttribute("aria-expanded", on); return;
      }
      if (e.target.closest("#mobdim")) { closeMenus(); return; }

      // catalog filters in place
      const ty = e.target.closest("[data-type]");
      if (ty && CAT && $("#mgrid")) {
        e.preventDefault(); closeMenus();
        F.types = new Set(ty.dataset.type ? [ty.dataset.type] : []); F.conds.clear(); F.q = "";
        renderGrid(true); window.scrollTo({ top: 0, behavior: "smooth" }); return;
      }
      // in-page anchors
      const g = e.target.closest("[data-go]");
      if (g && goTo(g.dataset.go)) { e.preventDefault(); closeMenus(); return; }

      const gp = e.target.closest("[data-gp]");
      if (gp) {
        $$("[data-gp]").forEach((b) => b.setAttribute("aria-pressed", b === gp));
        const im = $("#gmain img"); im.style.opacity = 0; setTimeout(() => { im.src = gp.dataset.gp; im.style.opacity = 1; }, 150); return;
      }
      const th = e.target.closest("[data-g]");
      if (th) {
        const Z = [{ s: 1, o: "50% 50%" }, { s: 1.9, o: "28% 35%" }, { s: 1.9, o: "55% 55%" }, { s: 1.9, o: "78% 70%" }];
        $$("[data-g]").forEach((b) => b.setAttribute("aria-pressed", b === th));
        const z = Z[+th.dataset.g]; const im = $("#gmain img"); im.style.transformOrigin = z.o; im.style.transform = `scale(${z.s})`; return;
      }
      const qa = e.target.closest(".qa > button");
      if (qa) { const box = qa.parentElement; const on = !box.classList.contains("on"); box.classList.toggle("on", on); qa.setAttribute("aria-expanded", on); return; }
      if (e.target.closest("#reset")) { F.types.clear(); F.conds.clear(); F.q = ""; renderGrid(true); return; }
      if (e.target.closest("#fbtn")) { $("#side").classList.toggle("on"); return; }

      // internal links → client-side navigation (no full reload)
      const a = e.target.closest("a[href]");
      if (a && !a.target && !a.hasAttribute("data-ext") && !a.hasAttribute("download")) {
        const href = a.getAttribute("href");
        if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/admin") && !href.startsWith("/api")) {
          e.preventDefault(); closeMenus();
          router.push(href, { scroll: !href.includes("#") });
          return;
        }
      }
      if (!e.target.closest(".mi")) $$(".mi.open").forEach((x) => x.classList.remove("open"));
    };
    const onChange = (e) => {
      const d = e.target.dataset || {};
      if (d.ft) { e.target.checked ? F.types.add(d.ft) : F.types.delete(d.ft); renderGrid(true); }
      if (d.fc) { e.target.checked ? F.conds.add(d.fc) : F.conds.delete(d.fc); renderGrid(); }
      if (e.target.id === "sort") { F.sort = e.target.value; renderGrid(); }
    };
    const onInput = (e) => { if (e.target.id === "q") { F.q = e.target.value; renderGrid(); } };
    const onSubmit = (e) => { if (e.target.classList?.contains("req")) { e.preventDefault(); submitForm(e.target, lang, wa); } };
    const onKey = (e) => { if (e.key === "Escape") closeMenus(); };

    window.addEventListener("scroll", onScroll, { passive: true });
    top?.addEventListener("click", toTop);
    menu?.addEventListener("mouseover", mOver); menu?.addEventListener("mouseleave", mLeave);
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("input", onInput);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("keydown", onKey);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      top?.removeEventListener("click", toTop);
      menu?.removeEventListener("mouseover", mOver); menu?.removeEventListener("mouseleave", mLeave);
      document.removeEventListener("click", onClick);
      document.removeEventListener("change", onChange);
      document.removeEventListener("input", onInput);
      document.removeEventListener("submit", onSubmit);
      document.removeEventListener("keydown", onKey);
    };
  }, [lang, wa, router]);

  // per-page setup
  useEffect(() => {
    const off = [];
    closeMenus();
    // language switch keeps the current page
    const rest = pathname.replace(/^\/(tr|en)/, "");
    $$(".lang a[data-lang]").forEach((a) => { a.setAttribute("href", `/${a.dataset.lang}${rest}${location.search}`); });
    // mobile action bar on product pages
    document.body.classList.toggle("has-bar", !!$("#mbar"));
    const app = $("#app");
    if (app) { app.classList.remove("enter"); void app.offsetWidth; app.classList.add("enter"); }
    initCatalog();
    initStrip(off); initWhy(off); initScrollFx(off); setupReveal(off);
    if (location.hash) { const id = location.hash.slice(1); setTimeout(() => goTo(id), 60); }
    return () => off.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
