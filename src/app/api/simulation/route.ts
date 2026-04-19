import { NextResponse } from "next/server";
import { DreamRequestSchema } from "@/services/validation";
import { smartClient } from "@/lib/aiRotator";
import { SimulationPrompt } from "@/lib/ai";
import { incrementUsage } from "@/lib/usage";

const SYSTEM_PROMPT = "You are a 'Future Simulation Engine' assistant. Provide immersive, engaging, and realistic scenarios.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = DreamRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { dream, history } = parsed.data;

    incrementUsage();
    const content = await smartClient.complete(SimulationPrompt(dream, history || []), SYSTEM_PROMPT);
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Simulation Error:", error);
    if (error.message.includes("exhausted")) {
      return NextResponse.json({ error: "AI temporarily unavailable, please retry" }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
