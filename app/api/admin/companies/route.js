import { NextResponse } from "next/server";
import { PLANS } from "@/lib/b2b";
import { requireAdmin } from "@/lib/admin";

export async function POST(request) {
  const { user, supabase, ok } = await requireAdmin();
  if (!user || !ok || !supabase) {
    return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });
  }

  const body = await request.json();
  const action = String(body.action ?? "");

  if (action === "plan") {
    const orgnr = String(body.orgnr ?? "").trim();
    const plan = String(body.plan ?? "");
    if (!orgnr || !PLANS.some((item) => item.key === plan)) {
      return NextResponse.json({ error: "Ugyldig plan." }, { status: 400 });
    }
    const { error } = await supabase
      .from("company_accounts")
      .update({ plan })
      .eq("orgnr", orgnr);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const claimId = String(body.claim_id ?? "");
  const { data: claim } = await supabase.from("company_claims").select("*").eq("id", claimId).maybeSingle();
  if (!claim) return NextResponse.json({ error: "Fant ikke kravet." }, { status: 404 });

  if (action === "reject") {
    const { error } = await supabase
      .from("company_claims")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", claim.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action !== "approve") {
    return NextResponse.json({ error: "Ugyldig handling." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { error: claimError } = await supabase
    .from("company_claims")
    .update({ status: "verified", reviewed_at: now })
    .eq("id", claim.id);
  if (claimError) return NextResponse.json({ error: claimError.message }, { status: 400 });

  const { error: memberError } = await supabase.from("company_members").upsert({
    orgnr: claim.orgnr,
    user_id: claim.user_id,
    role: "admin",
    status: "active",
  });
  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 400 });

  const { error: accountError } = await supabase.from("company_accounts").upsert({
    orgnr: claim.orgnr,
    plan: "basic",
    verified_at: now,
  });
  if (accountError) return NextResponse.json({ error: accountError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
