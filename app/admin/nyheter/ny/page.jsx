import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { AdminNewsForm } from "@/components/admin-news-form";
import { PageShell } from "@/components/page-shell";
import { requireAdmin } from "@/lib/admin";

export const metadata = {
  title: "Ny sak · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewsNewPage() {
  const { user, ok } = await requireAdmin();

  if (!user || !ok) {
    return <AdminGate user={user} ok={ok} nextPath="/admin/nyheter/ny" />;
  }

  return (
    <PageShell>
      <p className="kicker">Admin</p>
      <h1 className="mt-2 font-serif text-4xl">Ny sak</h1>
      <AdminNav current="/admin/nyheter" />
      <AdminNewsForm />
    </PageShell>
  );
}
