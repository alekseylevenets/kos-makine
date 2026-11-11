import "../../styles/globals.css";
import { notFound } from "next/navigation";
import { getMachines, getSettings } from "../../lib/data";
import { makeR, LANGS } from "../../lib/render";
import { SI } from "../../lib/content";
import { SITE_URL, json } from "../../lib/site";
import SiteClient from "../../components/SiteClient";

export const revalidate = 60;
export const dynamicParams = false;
export function generateStaticParams() { return LANGS.map((lang) => ({ lang })); }

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const tr = lang === "tr";
  const title = tr ? "Koş Makine · Plastik poşet makineleri, İstanbul" : "Koş Makine · Plastic bag machines, Istanbul";
  const description = tr
    ? "Atlet, dipten ve yandan kaynaklı poşet makineleri. İmalat, ikinci el alım-satım, tamir ve bakım. Bayrampaşa, İstanbul."
    : "T-shirt, bottom seal and side seal bag machines. Manufacturing, used machine trade, repair and maintenance. Bayrampaşa, Istanbul.";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s · Koş Makine" },
    description,
    icons: { icon: "/favicon.svg" },
    alternates: { canonical: `/${lang}`, languages: { tr: "/tr", en: "/en", "x-default": "/tr" } },
    openGraph: { type: "website", siteName: "Koş Makine", locale: tr ? "tr_TR" : "en_US", title, description, url: `/${lang}` },
  };
}
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#F3F4F1" };

export default async function Layout({ children, params }) {
  const { lang } = await params;
  if (!LANGS.includes(lang)) notFound();
  const [machines, settings] = await Promise.all([getMachines(), getSettings()]);
  const R = makeR({ lang, machines, settings });
  const org = {
    "@context": "https://schema.org", "@type": "LocalBusiness", name: "Koş Makine", url: SITE_URL,
    telephone: settings.phone, email: settings.email,
    address: { "@type": "PostalAddress", streetAddress: settings.address.tr, addressLocality: "Bayrampaşa", addressRegion: "İstanbul", addressCountry: "TR" },
  };
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700;800&display=swap" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(org) }} />
      </head>
      <body>
        <div className="proto"><div className="wrap pbar" id="pbar" dangerouslySetInnerHTML={{ __html: R.topbar() }} /></div>
        <header className="top" dangerouslySetInnerHTML={{ __html: R.header(`/${lang}`) }} />
        <div className="mob-dim" id="mobdim" />
        <div className="mob" id="mob" dangerouslySetInnerHTML={{ __html: R.mob() }} />
        {children}
        <a className="fwa" id="fwa" href={R.WA} target="_blank" rel="noopener" aria-label="WhatsApp" dangerouslySetInnerHTML={{ __html: SI.wa }} />
        <button className="totop" type="button" id="totop" aria-label="Top">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" /></svg>
        </button>
        <footer><div className="wrap" id="foot" dangerouslySetInnerHTML={{ __html: R.footer() }} /></footer>
        <SiteClient lang={lang} wa={R.WA} />
      </body>
    </html>
  );
}
