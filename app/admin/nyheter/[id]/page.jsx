import { notFound } from "next/navigation";
import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { AdminNewsForm } from "@/components/admin-news-form";
import { PageShell } from "@/components/page-shell";
import { requireAdmin } from "@/lib/admin";

export const metadata = {
  title: "Rediger sak · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewsEditPage({ params }) {
  const { user, supabase, ok } = await requireAdmin();
  const { id } = await params;

  if (!user || !ok) {
    return <AdminGate user={user} ok={ok} nextPath={`/admin/nyheter/${id}`} />;
  }

  return <EditForm supabase={supabase} id={id} />;
}

async function EditForm({ supabase, id }) {
  const { data: article } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
  if (!article) notFound();

  return (
    <PageShell>
      <p className="kicker">Admin</p>
      <h1 className="mt-2 font-serif text-4xl">Rediger sak</h1>
      <AdminNav current="/admin/nyheter" />
      <AdminNewsForm article={article} />
    </PageShell>
  );
}
