import { NextResponse } from "next/server";
import { getGeminiJSON, CareerGuidancePrompt } from "@/lib/ai";
import { getCachedServer, setCachedServer } from "@/lib/serverCache";

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();
    
    if (!answers || answers.length < 5) {
      return NextResponse.json({ error: "Incomplete quiz answers" }, { status: 400 });
    }

    const cacheKey = `quiz_${answers.join("_")}`.toLowerCase();
    const cached = getCachedServer(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }

    const prompt = CareerGuidancePrompt(answers);
    const result = await getGeminiJSON(prompt, "You are a career counselor AI focused on the Indian market.");
    
    setCachedServer(cacheKey, result);

    return NextResponse.json({ ...result, fromCache: false });
  } catch (error: any) {
    console.error("Career Guidance API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
