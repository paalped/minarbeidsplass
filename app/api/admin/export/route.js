import { NextResponse } from "next/server";
import { fetchAll, osloDate, requireAdmin, toCsv } from "@/lib/admin";

export async function GET(request) {
  const { ok, supabase } = await requireAdmin();
  if (!ok || !supabase) {
    return NextResponse.json({ error: "Ikke tilgang." }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type");
  const stamp = osloDate();

  try {
    if (type === "users") {
      const { data, error } = await supabase.rpc("admin_user_rows");
      if (error) throw error;
      const csv = toCsv(
        ["id", "email", "display_name", "created_at", "is_admin"],
        (data ?? []).map((row) => ({
          id: row.id,
          email: row.email,
          display_name: row.display_name,
          created_at: row.created_at,
          is_admin: row.is_admin ? "ja" : "nei",
        })),
      );
      return file(csv, `brukere-${stamp}.csv`);
    }

    if (type === "responses") {
      const [rows, companies, surveys] = await Promise.all([
        fetchAll(() =>
          supabase
            .from("survey_responses")
            .select(
              "id, created_at, overall_score, category_scores, answers, user_id, company_orgnr, survey_id",
            )
            .order("created_at", { ascending: false }),
        ),
        fetchAll(() => supabase.from("companies").select("orgnr, name, municipality")),
        fetchAll(() => supabase.from("surveys").select("id, slug, title")),
      ]);

      const companyByOrgnr = Object.fromEntries((companies ?? []).map((c) => [c.orgnr, c]));
      const surveyById = Object.fromEntries((surveys ?? []).map((s) => [s.id, s]));

      const csv = toCsv(
        [
          "id",
          "created_at",
          "survey_slug",
          "survey_title",
          "company_orgnr",
          "company_name",
          "municipality",
          "overall_score",
          "category_scores",
          "answers",
          "user_id",
        ],
        rows.map((row) => {
          const company = companyByOrgnr[row.company_orgnr] ?? {};
          const survey = surveyById[row.survey_id] ?? {};
          return {
            id: row.id,
            created_at: row.created_at,
            survey_slug: survey.slug ?? "",
            survey_title: survey.title ?? "",
            company_orgnr: row.company_orgnr,
            company_name: company.name ?? "",
            municipality: company.municipality ?? "",
            overall_score: row.overall_score,
            category_scores: row.category_scores,
            answers: row.answers,
            user_id: row.user_id,
          };
        }),
      );
      return file(csv, `undersokelser-${stamp}.csv`);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunne ikke eksportere." },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "Ugyldig eksport." }, { status: 400 });
}

function file(csv, filename) {
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
