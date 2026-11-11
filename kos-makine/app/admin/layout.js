export const metadata = { title: "Koş Makine · Yönetim", robots: { index: false, follow: false }, icons: { icon: "/favicon.svg" } };
export { viewport } from "next-sanity/studio";

export default function AdminLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
