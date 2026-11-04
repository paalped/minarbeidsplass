import { NextResponse } from "next/server";
import { getB2bContext, getCompanyInsights, getIndustryBenchmark, presentInsights } from "@/lib/b2b-data";
import { getSessionUser } from "@/lib/data";

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Du må være innlogget." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const { membership } = await getB2bContext(user, searchParams.get("orgnr"));
  if (!membership) return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });

  const result = await getCompanyInsights(membership.orgnr);
  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }

  const benchmark = await getIndustryBenchmark(membership.company);
  return NextResponse.json(presentInsights(result.body, benchmark));
}
