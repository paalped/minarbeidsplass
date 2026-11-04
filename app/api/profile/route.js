import { NextResponse } from "next/server";
import { readWorkStyle } from "@/lib/fit";
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
  const patch = {};

  if (body.display_name !== undefined) {
    const display_name = String(body.display_name ?? "").trim().slice(0, 80);
    if (display_name.length < 2) {
      return NextResponse.json({ error: "Kallenavnet må ha minst to tegn." }, { status: 400 });
    }
    patch.display_name = display_name;
  }

  if (body.work_style !== undefined) {
    const workStyle = readWorkStyle(body.work_style);
    if (!workStyle) {
      return NextResponse.json({ error: "Svar på alle spørsmålene om arbeidstil." }, { status: 400 });
    }
    patch.work_style = { ...workStyle, updated_at: new Date().toISOString() };
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Ingenting å lagre." }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, ...patch });
}
