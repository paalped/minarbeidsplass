import { NextResponse } from "next/server";
import { searchEnheter } from "@/lib/brreg";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const companies = await searchEnheter(q);
  return NextResponse.json({ companies });
}
