import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";
import { hasSanity, projectId } from "../../../studio/env";
import AdminGate from "../../../components/AdminGate";

export const dynamic = "force-static";

export default function AdminPage() {
  if (!hasSanity) {
    return (
      <div style={{ font: "16px/1.6 system-ui, sans-serif", maxWidth: 560, margin: "80px auto", padding: 24 }}>
        <h1 style={{ fontSize: 22 }}>Yönetim paneli henüz bağlı değil</h1>
        <p>Vercel → Settings → Environment Variables bölümüne <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> ekleyin ve projeyi yeniden yayınlayın (Redeploy).</p>
      </div>
    );
  }
  return (
    <AdminGate projectId={projectId}>
      <NextStudio config={config} />
    </AdminGate>
  );
}
