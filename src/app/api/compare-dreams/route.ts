import { NextResponse } from "next/server";
import { getGeminiJSON, CompareDreamsPrompt } from "@/lib/ai";
import { getCachedServer, setCachedServer } from "@/lib/serverCache";

export async function POST(req: Request) {
  try {
    const { dreams } = await req.json();
    
    if (!dreams || dreams.length < 2) {
      return NextResponse.json({ error: "At least 2 dreams required for comparison" }, { status: 400 });
    }

    const cacheKey = `compare_${dreams.map((d:string) => d.trim().toLowerCase()).sort().join("_")}`;
    const cached = getCachedServer(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }

    const prompt = CompareDreamsPrompt(dreams);
    const result = await getGeminiJSON(prompt, "You are a career strategy expert comparing multiple dream paths.");
    
    // Normalize data to ensure realityScore exists
    if (result && result.comparisons) {
      result.comparisons = result.comparisons.map((c: any) => ({
        ...c,
        realityScore: Number(
          c.realityScore ?? 
          c.score ?? 
          c.reality_score ?? 
          c.realisticScore ?? 
          c.realScore ?? 
          75
        ) || 75
      }));
    }

    setCachedServer(cacheKey, result);

    return NextResponse.json({ ...result, fromCache: false });
  } catch (error: any) {
    console.error("Comparison API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
