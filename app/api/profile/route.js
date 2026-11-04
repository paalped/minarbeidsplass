import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase er ikke konfigurert." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const body = await request.json();
  const display_name = String(body.display_name ?? "").trim().slice(0, 80);
  if (display_name.length < 2) {
    return NextResponse.json({ error: "Kallenavnet må ha minst to tegn." }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update({ display_name }).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, display_name });
}
