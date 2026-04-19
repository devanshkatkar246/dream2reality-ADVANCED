import { NextResponse } from "next/server";
import { RoadmapPrompt, getGeminiJSON } from "@/lib/ai";
import { getCachedServer, setCachedServer } from "@/lib/serverCache";

export async function POST(req: Request) {
  try {
    const { dream, simulationSummary } = await req.json();

    if (!dream) {
      return NextResponse.json({ error: "Dream is required" }, { status: 400 });
    }

    const cacheKey = `roadmap-${dream.toLowerCase().trim()}`;
    const cached = getCachedServer(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }

    const data = await getGeminiJSON(RoadmapPrompt(dream, simulationSummary), "You are an expert career planner.");
    setCachedServer(cacheKey, data);

    return NextResponse.json({ ...data, fromCache: false });
  } catch (error: any) {
    console.error("Roadmap Error:", error);
    if (error.message.includes("exhausted")) {
      return NextResponse.json({ error: "AI temporarily unavailable, please retry" }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
