// HTML templates for the public site. Pure functions: used on the server (SSR, SEO)
// and in the browser (catalog filtering). Ported 1:1 from the approved prototype.
import { T, ICONS, LOGO, SI, chev, arrow } from "./content";

export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const LANGS = ["tr", "en"];
export const ZOOM = [{ s: 1, o: "50% 50%" }, { s: 1.9, o: "28% 35%" }, { s: 1.9, o: "55% 55%" }, { s: 1.9, o: "78% 70%" }];
export const WHY_IMG = ["yandan-kaynak-servo", "atlet-yuksek-hiz", "cift-hat-atlet", "dipten-kaynak-ikinci-el", "film-ekstruder-55"];

export function makeR({ lang, machines, settings }) {
  const M = machines;
  const S = settings;
  const t = (k) => T[lang][k];
  const L = {
    home: `/${lang}`,
    cat: (type) => `/${lang}/makineler${type ? `?tip=${type}` : ""}`,
    m: (slug) => `/${lang}/makineler/${slug}`,
    go: (id) => `/${lang}#${id}`,
  };
  const WA = "https://wa.me/" + String(S.whatsapp || "").replace(/\D/g, "");
  const IG = "https://instagram.com/" + String(S.instagram || "").replace(/^@/, "");
  const TEL = "tel:" + String(S.phone || "").replace(/[^\d+]/g, "");
  const LEGAL = S.legal;

  const EMPTY = { slug: "", type: "tshirt", cond: "new", model: "", year: "", width: "", length: "", thick: "", speed: "", power: "", name: { tr: "—", en: "—" }, desc: { tr: "", en: "" }, photos: [] };
  const bySlug = (s) => M.find((m) => m.slug === s) || M[0] || EMPTY;
  const FEAT = () => M.find((m) => m.featured) || bySlug("cift-hat-atlet");
  const MINI = () => M.filter((m) => m.featured && m.slug !== FEAT().slug)[0] || bySlug("film-ekstruder-55");
  // Fixed decorative photos fall back to "any other machine" when the seed machine was deleted.
  const pick = (slug, i) => M.find((m) => m.slug === slug) || M[i % Math.max(1, M.length)] || EMPTY;

  const SRC = (m, i = 0) => (m && m.photos && m.photos.length ? m.photos[Math.min(i, m.photos.length - 1)] : "");
  const nm = (m) => (m.name && (m.name[lang] || m.name.tr)) || "";
  const priceTxt = (m) => (m.onRequest || !String(m.price || "").trim() ? t("price_v") : `${esc(m.price)} ${esc(m.currency || "$")}`);
  const photo = (m, cls = "", alt) => {
    const src = SRC(m);
    return `<div class="ph photo ${cls}">${src ? `<img src="${esc(src)}" alt="${esc(alt || nm(m))}" loading="lazy" decoding="async">` : ""}</div>`;
  };
  const condTxt = (c) => (c === "new" ? t("c_new") : t("c_used"));
  const spd = (m) => (/kg/.test(m.speed) ? m.speed : `${m.speed} ${t("u_speed")}`);
  const tShort = (k) => t("typesShort")[k] || k;
  let chi = 0;
  const words = (s, off) => {
    if (!off) chi = 0;
    return s.split(" ").map((w) => `<span class="w" style="overflow:visible">${[...w].map((c) => `<span class="ch" style="animation-delay:${chi++ * 22}ms">${c}</span>`).join("")}</span>`).join(" ");
  };
  const shop = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 9l2-5h12l2 5M4 9v11h16V9M4 9c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s2-1 2-3"/></svg>`;

  // ---------- chrome ----------
  function topbar() {
    const Lb = lang === "tr" ? ["Vergi Dairesi", "Vergi No", "MERSİS No", "Ticaret Sicil No"] : ["Tax Office", "Tax No", "MERSIS No", "Trade Reg. No"];
    return `<div class="l"><span>${Lb[0]}: <b>${esc(LEGAL.vd)}</b></span><span>${Lb[1]}: <b>${esc(LEGAL.vn)}</b></span><span>${Lb[2]}: <b>${esc(LEGAL.mersis)}</b></span><span>${Lb[3]}: <b>${esc(LEGAL.sicil)}</b></span></div>
  <div class="r"><span>${esc(S.phone)}</span><span>${esc(S.email)}</span></div>`;
  }
  function menu() {
    const types = Object.keys(t("types"));
    return `
    <div class="mi"><a href="${L.home}">${t("m_home")}</a></div>
    <div class="mi" data-dd><button type="button" aria-expanded="false">${t("m_mach")} ${chev}</button>
      <div class="dd">${types.map((k) => `<a href="${L.cat(k)}" data-type="${k}"><span class="ic">${ICONS[k]}</span><span><b>${t("types")[k]}</b><span>${t("typesDesc")[k]}</span></span></a>`).join("")}
      <a class="all" href="${L.cat()}" data-type="">${t("m_all")}</a></div></div>
    <div class="mi" data-dd><button type="button" aria-expanded="false">${t("m_svc")} ${chev}</button>
      <div class="dd">${t("svc").map((s) => `<a href="${L.go(s.k === "swap" ? "sell" : "why")}" data-go="${s.k === "swap" ? "sell" : "why"}"><span class="ic">${ICONS[s.k]}</span><span><b>${s.h}</b><span>${s.d}</span></span></a>`).join("")}</div></div>
    <div class="mi"><a href="${L.go("why")}" data-go="why">${t("m_about")}</a></div>
    <div class="mi"><a href="${L.go("contact")}" data-go="contact">${t("m_contact")}</a></div>`;
  }
  function mob() {
    const types = Object.keys(t("types"));
    return `
    <a class="mrow" href="${L.home}">${t("m_home")}</a>
    <a class="mrow" href="${L.cat()}" data-type="">${t("m_mach")} <span class="mcount">${M.length}</span></a>
    <div class="mtypes">${types.map((k) => `<a href="${L.cat(k)}" data-type="${k}"><span class="mi2">${ICONS[k]}</span>${tShort(k)}</a>`).join("")}</div>
    <a class="mrow" href="${L.go("why")}" data-go="why">${t("m_svc")}</a>
    <a class="mrow" href="${L.go("sell")}" data-go="sell">${t("svc")[1].h}</a>
    <a class="mrow" href="${L.go("contact")}" data-go="contact">${t("m_contact")}</a>
    <div class="mact"><a class="btn pri" href="${L.go("contact")}" data-go="contact">${t("cta_top")}</a><a class="btn mwa" href="${WA}" target="_blank" rel="noopener">${SI.wa} WhatsApp</a></div>
    <p class="mmeta">${esc(S.phone)} · ${esc(S.email)}</p>`;
  }
  function header(path) {
    const other = lang === "tr" ? "en" : "tr";
    const swap = (l) => "/" + l + (path || "").replace(/^\/(tr|en)/, "");
    return `<div class="wrap">
    <a class="logo" href="${L.home}" aria-label="Koş Makine">${LOGO}</a>
    <nav class="menu" aria-label="Main" id="menu">${menu()}</nav>
    <div class="right">
      <div class="lang" role="group" aria-label="Language">
        <a href="${swap("tr")}" data-lang="tr" aria-pressed="${lang === "tr"}" hreflang="tr">TR</a><a href="${swap("en")}" data-lang="en" aria-pressed="${lang === "en"}" hreflang="en">EN</a>
      </div>
      <a class="btn pri" href="${L.go("contact")}" data-go="contact">${t("cta_top")}</a>
      <button class="burger" type="button" aria-label="Menu" aria-expanded="false" id="burger">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 5h14M2 9h14M2 13h14"/></svg>
      </button>
    </div>
  </div>`;
  }
  function footer() {
    return `
  <div class="fgrid">
    <div class="fl fbrand"><a class="logo" href="${L.home}" aria-label="Koş Makine">${LOGO}</a><p>${t("f_about")}</p>
      <div class="fsoc">
        <a class="fbtn wa" href="${WA}" target="_blank" rel="noopener">${SI.wa}WhatsApp</a>
        ${S.instagram ? `<a class="fbtn" href="${IG}" target="_blank" rel="noopener" aria-label="Instagram">${SI.ig}</a>` : ""}
        <a class="fbtn" href="${TEL}" aria-label="${lang === "tr" ? "Ara" : "Call"}">${SI.ph}</a>
      </div></div>
    <div class="fl"><h4>${t("f_links")}</h4><a href="${L.home}">${t("m_home")}</a><a href="${L.cat()}" data-type="">${t("m_mach")}</a><a href="${L.go("why")}" data-go="why">${t("m_svc")}</a><a href="${L.go("contact")}" data-go="contact">${t("m_contact")}</a></div>
    <div class="fl"><h4>${t("f_cat")}</h4>${Object.keys(t("typesShort")).map((k) => `<a href="${L.cat(k)}" data-type="${k}">${tShort(k)}</a>`).join("")}</div>
    <div class="fl fct"><h4>${t("f_ct")}</h4>
      <span class="ci">${SI.ph}<span>${esc(S.phone)}<small>${esc(S.person)}</small></span></span>
      <span class="ci">${SI.mail}<span>${esc(S.email)}</span></span>
      ${S.instagram ? `<span class="ci">${SI.ig}<span>@${esc(String(S.instagram).replace(/^@/, ""))}</span></span>` : ""}
      <span class="ci">${SI.pin}<span>${esc(S.address[lang] || S.address.tr)}</span></span></div>
  </div>
  <div class="legal">${lang === "tr"
      ? `Vergi Dairesi: ${esc(LEGAL.vd)} · Vergi No: ${esc(LEGAL.vn)} · MERSİS No: ${esc(LEGAL.mersis)} · Ticaret Sicil No: ${esc(LEGAL.sicil)}`
      : `Tax Office: ${esc(LEGAL.vd)} · Tax No: ${esc(LEGAL.vn)} · MERSIS No: ${esc(LEGAL.mersis)} · Trade Reg. No: ${esc(LEGAL.sicil)}`}</div>
  <div class="bot"><span>© ${new Date().getFullYear()} Koş Makine. ${t("f_rights")}</span>
    <span class="pol"><a href="${L.go("contact")}" data-go="contact">${lang === "tr" ? "KVKK Aydınlatma Metni" : "Privacy Notice (KVKK)"}</a><a href="${L.go("contact")}" data-go="contact">${lang === "tr" ? "Çerez Politikası" : "Cookie Policy"}</a><span>kosmakine.com</span><a href="/admin" data-ext>${lang === "tr" ? "Yönetim" : "Admin"}</a></span></div>`;
  }

  // ---------- shared ----------
  function formHTML(sel) {
    const opts = `<option value="">${t("fm_any")}</option>` + M.map((m) => `<option value="${esc(m.slug)}" ${m.slug === sel ? "selected" : ""}>${esc(nm(m))} · ${esc(m.model)}</option>`).join("");
    return `<form class="req" novalidate>
    <div class="two"><label>${t("fm_name")}<input name="name" autocomplete="name" required></label><label>${t("fm_phone")}<input name="phone" type="tel" autocomplete="tel" required></label></div>
    <label>${t("fm_machine")}<select name="machine">${opts}</select></label>
    <label>${t("fm_msg")}<textarea name="msg" placeholder="${esc(t("fm_ph"))}"></textarea></label>
    <input name="company_site" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
    <button class="btn pri" type="submit">${t("fm_send")}</button>
    <p class="ok" hidden></p></form>`;
  }
  function contactHTML() {
    const tr = lang === "tr";
    const MAP = S.mapUrl || "https://www.google.com/maps/search/?api=1&query=Emintas+Yuksel+Sanayi+Sitesi+Bayrampasa+Istanbul";
    const ini = String(S.person || "KM").split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toLocaleUpperCase("tr");
    const go = `<span class="cgo" aria-hidden="true">${arrow}</span>`;
    const row = (cls, href, ico, k, v, ext) => `<a class="crow ${cls}" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ""}><span class="cic">${ico}</span><span class="ctx"><small>${k}</small><b>${v}</b></span>${go}</a>`;
    return `<section class="blk" id="contact"><div class="wrap">
    <div class="sec-head"><h2>${t("ct_h")} <span class="dim">${t("ct_hd")}</span><span class="hl">.</span></h2></div>
    <div class="contact">
      <div class="cinfo">
        <div class="cperson"><span class="cav">${esc(ini)}</span><span><b>${esc(S.person)}</b><small>${t("k_person")} · Koş Makine</small></span></div>
        <div class="crows">
          ${row("wa", WA, SI.wa, "WhatsApp", tr ? "Hemen yazın" : "Message us now", true)}
          ${row("", TEL, SI.ph, t("k_gsm"), esc(S.phone), false)}
          ${row("", "mailto:" + S.email, SI.mail, t("k_mail"), esc(S.email), false)}
          ${row("addr", MAP, SI.pin, t("k_addr"), esc(S.address[lang] || S.address.tr), true)}
        </div>
      </div>
      <div class="cform">
        <div class="cfh"><b>${tr ? "Talep formu" : "Request form"}</b><small>${tr ? "Formu doldurun, sizi arayalım." : "Fill in the form and we will call you back."}</small></div>
        ${formHTML("")}
      </div>
    </div></div></section>`;
  }
  function pcard(m) {
    return `<a class="pc" href="${L.m(m.slug)}">
    <div style="position:relative">${photo(m)}<span class="st ${m.cond}">${condTxt(m.cond)}</span></div>
    <div class="row"><div><h3>${esc(nm(m))}</h3><div class="by"><i></i>${esc(m.model)} · ${tShort(m.type)}</div></div>
    <span class="price">${priceTxt(m)}</span></div></a>`;
  }

  // ---------- home ----------
  function home() {
    const strip = [...M.filter((m) => m.featured), ...M.filter((m) => !m.featured)].slice(0, 8);
    const F = FEAT(), Mi = MINI();
    return `
  <section class="hero" id="hdark">
    <div class="gridbg" aria-hidden="true"></div><div class="glow g1" aria-hidden="true"></div><div class="glow g2" aria-hidden="true"></div>
    <div class="wrap hb">
    <div class="hcard dark">
      <div class="hin">
        <h1>${words(t("h1a"), 0)} <span class="dim">${words(t("h1b"), t("h1a").split(" ").length)}</span></h1>
        <p class="lead">${t("lead")}</p>
        <div class="acts"><a class="btn pill lt" href="${L.cat()}" data-type="">${t("hero_btn")} ${arrow}</a><a class="btn pill gh" href="${L.go("contact")}" data-go="contact">${t("hero_btn2")}</a></div>
        <div class="htypes">${Object.keys(t("typesShort")).map((k) => `<a href="${L.cat(k)}" data-type="${k}">${tShort(k)}</a>`).join("")}</div>
      </div>
    </div>
    <a class="hcard hphoto" href="${L.m(F.slug)}">
      ${SRC(F) ? `<img src="${esc(SRC(F))}" alt="${esc(nm(F))}" fetchpriority="high">` : ""}
      <span class="hlabel"><b>${esc(nm(F))}</b><span>${priceTxt(F)}</span></span>
    </a>
    <a class="hcard hhot" href="${L.cat()}" data-type="">
      <span class="big">${M.length}</span><span>${lang === "tr" ? "makine katalogda" : "machines in catalog"}</span><span class="go">${arrow}</span>
    </a>
    <a class="hcard hmini" href="${L.m(Mi.slug)}">${SRC(Mi) ? `<img src="${esc(SRC(Mi))}" alt="${esc(nm(Mi))}">` : ""}</a>
    </div>
  </section>

  <section class="statement"><div class="wrap">
    ${photo(pick("atlet-poset-kesim-500", 0), "tilt t1")}${photo(pick("rulo-cop-torbasi", 1), "tilt t2")}
    <p id="stmt">${(t("stmt_a") + " " + t("stmt_b")).split(" ").map((w) => `<span class="sw${/makine|servis|machines|service/i.test(w) ? " k" : ""}">${w}</span>`).join(" ")}</p>
    <a class="btn pill" href="${L.go("why")}" data-go="why">${t("stmt_btn")} ${arrow}</a>
  </div></section>

  <section class="hs" id="hs">
    <div class="stick">
      <div class="wrap" style="width:100%"><div class="sec-head" style="margin-bottom:28px"><h2>${t("hs_h")} <span class="dim">${t("hs_hd")}</span><span class="hl">.</span></h2><a class="btn line" style="border-radius:999px" href="${L.cat()}" data-type="">${t("hs_all")}</a></div></div>
      <div class="track" id="track">
        ${strip.map((m) => `<a class="mc" href="${L.m(m.slug)}">${photo(m)}<div class="cap"><h3>${esc(nm(m))}</h3><span class="pr">${m.onRequest || !String(m.price || "").trim() ? `<b>${t("price_v")}</b>` : `• ${t("from")} <b>${priceTxt(m)}</b>`}</span></div></a>`).join("")}
        <div class="end"><a class="btn pill" href="${L.cat()}" data-type="">${t("hs_all")}</a></div>
      </div>
      <div class="dots" id="dots">${strip.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>
    </div>
  </section>

  <section class="feat"><div class="wrap fgr">
    <a class="fimg" href="${L.m(F.slug)}">${photo(F)}</a>
    <div class="ftx">
      <span class="ftag">${lang === "tr" ? "Öne çıkan makine" : "Featured machine"}</span>
      <h2>${esc(nm(F))}<span class="hl">.</span></h2>
      <p>${esc((F.desc && F.desc[lang]) || (lang === "tr" ? "İki ayrı hatta aynı anda atlet poşet üretimi. Market ve mağaza poşeti üreticileri için." : "T-shirt bag production on two lines at once. Built for grocery and retail bag producers."))}</p>
      <dl class="fspec">
        <div><dt>${t("ds_w")}</dt><dd>${esc(F.width)}<small>mm</small></dd></div>
        <div><dt>${t("ds_v")}</dt><dd>${esc(F.speed)}<small>${/kg/.test(F.speed) ? "" : t("u_speed")}</small></dd></div>
        <div><dt>${t("ds_p")}</dt><dd>${esc(F.power)}<small>kW</small></dd></div>
      </dl>
      <div class="facts"><a class="btn pill" href="${L.m(F.slug)}">${lang === "tr" ? "Makineyi incele" : "View machine"} ${arrow}</a><a class="btn fwa2" href="${WA}" target="_blank" rel="noopener">${SI.wa} WhatsApp</a></div>
    </div>
  </div></section>

  <section class="blk" id="why"><div class="wrap why">
    <div><h2>${t("why_h")} <span class="dim">${t("why_hd")}</span><span class="hl">.</span></h2>
      <ol id="whylist">${t("why").map((w, i) => `<li class="${i === 0 ? "on" : ""}" data-i="${i}" data-src="${esc(SRC(pick(WHY_IMG[i], i)))}"><div><b>${w[0]}</b><p>${w[1]}</p></div></li>`).join("")}</ol></div>
    <div id="whyimg" class="mask">${photo(pick(WHY_IMG[0], 0))}</div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-head"><h2>${t("bento_h")} <span class="dim">${t("bento_hd")}</span><span class="hl">?</span></h2></div>
    <div class="bento">${["tshirt", "bottom", "side", "garbage"].map((k) => `<a class="cell" href="${L.cat(k)}" data-type="${k}"><div class="tx"><h3>${tShort(k)}</h3><p>${t("typesLong")[k]}</p><span class="k lab">${t("bento_go")}</span></div><span class="ico">${ICONS[k]}</span></a>`).join("")}</div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-head"><h2>${t("steps_h")} <span class="dim">${t("steps_hd")}</span><span class="hl">.</span></h2></div>
    <div class="steps">${t("steps").map((s, i) => `<div class="step"><span class="c">0${i + 1}</span><b>${s[0]}</b><p>${s[1]}</p></div>`).join("")}</div>
  </div></section>

  <section class="blk" id="sell" style="padding-top:0"><div class="wrap sell">
    <div class="mask">${photo(pick("cop-torbasi-ikinci-el", 2))}</div>
    <div class="t"><h2>${t("sell_h")} <span class="dim">${t("sell_hd")}</span><span class="hl">.</span></h2><p class="lead">${t("sell_p")}</p>
      <a class="btn pill" href="${WA}" target="_blank" rel="noopener">${t("sell_b")} ${arrow}</a></div>
  </div></section>

  <section class="blk" style="padding-top:0"><div class="wrap faq">
    <div><h2>${t("faq_h")} <span class="dim">${t("faq_hd")}</span><span class="hl">.</span></h2><p class="lead" style="margin-top:14px">${t("faq_p")}</p></div>
    <div>${t("faq").map((q, i) => `<div class="qa ${i === 0 ? "on" : ""}"><button type="button" aria-expanded="${i === 0}"><span>${q[0]}</span><span class="pl">+</span></button><div class="a"><div><p>${q[1]}</p></div></div></div>`).join("")}</div>
  </div></section>

  ${contactHTML()}`;
  }

  // ---------- catalog ----------
  function filterList(F) {
    const q = (F.q || "").trim().toLocaleLowerCase(lang);
    let list = M.filter((m) => (!F.types.size || F.types.has(m.type)) && (!F.conds.size || F.conds.has(m.cond))
      && (!q || (nm(m) + " " + m.model).toLocaleLowerCase(lang).includes(q)));
    if (F.sort === "az") list = [...list].sort((a, b) => nm(a).localeCompare(nm(b), lang));
    if (F.sort === "year") list = [...list].sort((a, b) => String(b.year).localeCompare(String(a.year)));
    if (F.sort === "new") list = [...list].sort((a, b) => (a.cond === "new" ? 0 : 1) - (b.cond === "new" ? 0 : 1));
    return list;
  }
  function grid(F) {
    const list = filterList(F);
    return { html: list.length ? list.map(pcard).join("") : `<div class="empty">${t("c_none")}</div>`, count: `${list.length} ${t("c_res")}` };
  }
  function catHead(F) {
    const one = F.types.size === 1 ? [...F.types][0] : "";
    return {
      crumbs: `<a href="${L.home}" aria-label="${t("c_home")}">${shop}</a>
      <span class="sep">›</span><a href="${L.cat()}" data-type="">${t("m_mach")}</a>
      ${one ? `<span class="sep">›</span><span>${t("types")[one]}</span>` : ""}`,
      h1: one ? t("types")[one] : t("c_h"),
    };
  }
  function catalog(F) {
    const types = Object.keys(t("types"));
    const cnt = (fn) => M.filter(fn).length;
    const g = grid(F), h = catHead(F);
    return `
  <div class="wrap">
    <div class="crumbs" id="crumbs">${h.crumbs}</div>
    <div class="pagehead">
      <div><h1 id="cath1">${h.h1}</h1>
        <div class="byline"><span class="av">KOŞ</span>Koş Makine <span>· ${M.length} ${t("c_sub")}</span></div></div>
      <div class="pacts"><a class="btn out" href="${WA}" target="_blank" rel="noopener">WhatsApp</a><a class="btn pri" href="#contact" data-go="contact">${t("cta_top")}</a></div>
    </div>
    <div class="cat">
      <aside class="side" id="side">
        <div><h4>${t("c_type")}</h4>${types.map((k) => `<label class="chk" for="ft-${k}"><span class="l"><input type="checkbox" id="ft-${k}" data-ft="${k}" ${F.types.has(k) ? "checked" : ""}>${tShort(k)}</span><span class="cnt">${cnt((m) => m.type === k)}</span></label>`).join("")}</div>
        <div><h4>${t("c_cond")}</h4>${["new", "used"].map((k) => `<label class="chk" for="fc-${k}"><span class="l"><input type="checkbox" id="fc-${k}" data-fc="${k}" ${F.conds.has(k) ? "checked" : ""}>${condTxt(k)}</span><span class="cnt">${cnt((m) => m.cond === k)}</span></label>`).join("")}</div>
        <button class="btn line" type="button" id="reset">${t("c_reset")}</button>
      </aside>
      <div style="min-width:0">
        <div class="toolbar">
          <div class="search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
            <input id="q" type="search" placeholder="${t("c_search")}" value="${esc(F.q)}" aria-label="${t("c_search")}"></div>
          <button class="btn line fbtn" type="button" id="fbtn">${t("c_filters")}</button>
          <span class="res" id="res">${g.count}</span>
          <select id="sort" aria-label="${t("c_sort")}">
            <option value="new" ${F.sort === "new" ? "selected" : ""}>${t("s_new")}</option>
            <option value="az" ${F.sort === "az" ? "selected" : ""}>${t("s_az")}</option>
            <option value="year" ${F.sort === "year" ? "selected" : ""}>${t("s_year")}</option>
          </select>
        </div>
        <div class="mgrid" id="mgrid">${g.html}</div>
      </div>
    </div>
  </div>
  ${contactHTML()}`;
  }

  // ---------- product ----------
  function product(slug) {
    const m = M.find((x) => x.slug === slug);
    if (!m) return "";
    const rows = [
      [t("ds_model"), esc(m.model)], [t("ds_type"), tShort(m.type)], [t("ds_cond"), condTxt(m.cond)], [t("ds_year"), esc(m.year)],
      [t("ds_w"), m.width ? `${esc(m.width)}<span class="u">mm</span>` : "—"], [t("ds_l"), !m.length || m.length === "—" ? "—" : `${esc(m.length)}<span class="u">mm</span>`],
      [t("ds_t"), m.thick ? `${esc(m.thick)}<span class="u">µm</span>` : "—"], [t("ds_v"), m.speed ? esc(spd(m)) : "—"], [t("ds_p"), m.power ? `${esc(m.power)}<span class="u">kW</span>` : "—"]];
    const sim = M.filter((x) => x.slug !== slug && x.type === m.type).concat(M.filter((x) => x.slug !== slug && x.type !== m.type)).slice(0, 3);
    const many = m.photos.length > 1;
    const descTxt = (m.desc && m.desc[lang]) || t("p_text")(m);
    return `
  <div class="wrap">
    <div class="crumbs">
      <a href="${L.cat()}" data-type="" aria-label="${t("m_mach")}">${shop}</a>
      <span class="sep">›</span><a href="${L.cat()}" data-type="">${t("m_mach")}</a>
      <span class="sep">›</span><a href="${L.cat(m.type)}" data-type="${m.type}">${t("types")[m.type]}</a>
    </div>
    <div class="pagehead" style="border-bottom:0;padding-bottom:0">
      <div style="min-width:0"><h1>${esc(nm(m))}${m.model ? ` – ${esc(m.model)}` : ""}</h1>
        <div class="byline"><span class="av">KOŞ</span>Koş Makine <span>· ${condTxt(m.cond)} · ${esc(m.year)}</span></div></div>
      <div class="pacts">
        <a class="btn out" href="${WA}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn line" href="${TEL}">${t("p_call")}</a>
        <a class="btn pri" href="#preq" data-go="preq">${t("p_req")}</a>
      </div>
    </div>
    <div class="gallery">
      <div class="main ph photo" id="gmain">${SRC(m) ? `<img src="${esc(SRC(m))}" alt="${esc(nm(m))}" fetchpriority="high">` : ""}<span class="st ${m.cond}">${condTxt(m.cond)}</span></div>
      ${SRC(m) ? `<div class="thumbs">${(many ? m.photos.slice(0, 6) : ZOOM).map((z, i) => many
        ? `<button type="button" data-gp="${esc(z)}" aria-pressed="${i === 0}" aria-label="${t("photo")} ${i + 1}"><div class="ph photo"><img src="${esc(z)}" alt="" loading="lazy"></div></button>`
        : `<button type="button" data-g="${i}" aria-pressed="${i === 0}" aria-label="${t("photo")} ${i + 1}"><div class="ph photo"><img src="${esc(SRC(m))}" alt="" style="--o:${z.o};transform:scale(${z.s})"></div></button>`).join("")}</div>` : ""}
    </div>
    <div class="pbody">
      <div class="desc">
        <h3>${t("p_desc")}</h3>${String(descTxt).split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}
        <h3>${t("p_uses")}</h3><ul class="uses"><li>${t("typesDesc")[m.type] || ""}</li></ul>
        <h3>${t("p_specs")}</h3>
        <table class="ds"><tbody>${rows.map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td></tr>`).join("")}</tbody></table>
        <span class="lab" style="text-transform:none;letter-spacing:0;font-weight:400">${t("p_note")}</span>
        <div class="card-p" id="preq" style="margin-top:12px"><h3>${t("p_req")}</h3>${formHTML(m.slug)}</div>
      </div>
      <aside class="buy">
        <span class="lab">${t("p_price")}</span>
        <span class="big">${priceTxt(m)}</span>
        <div class="meta"><div><span>${t("ds_cond")}</span>${condTxt(m.cond)}</div><div><span>${t("ds_year")}</span>${esc(m.year)}</div>
          <div><span>${t("ds_w")}</span>${esc(m.width)} mm</div><div><span>${t("ds_v")}</span>${esc(m.speed)}</div></div>
        <a class="btn pri" href="#preq" data-go="preq">${t("p_req")}</a>
        <a class="btn out" href="${WA}" target="_blank" rel="noopener">WhatsApp</a>
        <p class="note">${t("p_pnote")}<br>${esc(S.phone)}</p>
      </aside>
    </div>
  </div>
  <section class="blk" style="padding-top:0"><div class="wrap">
    <div class="sec-head"><h2>${t("p_sim")}</h2><a class="btn line" href="${L.cat()}" data-type="">${t("m_all")}</a></div>
    <div class="mgrid">${sim.map(pcard).join("")}</div>
  </div></section>`;
  }
  function mbar() {
    return `<a class="btn out" href="${WA}" target="_blank" rel="noopener">WhatsApp</a><a class="btn pri" href="#preq" data-go="preq">${t("p_req")}</a>`;
  }
  function notFound() {
    return `<div class="wrap" style="padding-block:120px;text-align:center"><h2>${lang === "tr" ? "Bu makine artık yayında değil" : "This machine is no longer listed"}<span class="hl">.</span></h2><p class="lead" style="margin:14px auto 24px">${lang === "tr" ? "Benzer makineler için kataloğa göz atın." : "Browse the catalog for similar machines."}</p><a class="btn pill" href="${L.cat()}" data-type="">${t("m_all")}</a></div>`;
  }

  return { t, L, WA, topbar, header, mob, footer, home, catalog, grid, catHead, product, mbar, notFound, nm };
}
