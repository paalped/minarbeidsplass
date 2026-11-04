import { NextResponse } from "next/server";
import { getB2bContext } from "@/lib/b2b-data";
import { httpsUrl, isCompanyAdminRole } from "@/lib/b2b";
import { getSessionUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });

  const body = await request.json();
  const { membership } = await getB2bContext(user, body.orgnr);
  if (!membership) return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });
  if (!isCompanyAdminRole(membership.role) && !user.isAdmin) {
    return NextResponse.json({ error: "Bare bedriftsadmin kan endre profilen." }, { status: 403 });
  }

  const intro = String(body.intro ?? "").trim().slice(0, 2000);
  const values_text = String(body.values_text ?? "").trim().slice(0, 1000);
  const logo_url = httpsUrl(body.logo_url);
  const banner_url = httpsUrl(body.banner_url);
  const career_url = httpsUrl(body.career_url);
  if ((body.logo_url && !logo_url) || (body.banner_url && !banner_url) || (body.career_url && !career_url)) {
    return NextResponse.json({ error: "Lenker må være https." }, { status: 400 });
  }

  const row = {
    orgnr: membership.orgnr,
    intro: intro || null,
    values_text: values_text || null,
    logo_url,
    banner_url,
    career_url,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("company_branding").upsert(row).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ branding: data });
}
