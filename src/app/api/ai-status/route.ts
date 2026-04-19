import { NextResponse } from "next/server";
import { smartClient } from "@/lib/aiRotator";

export async function GET() {
  try {
    const status = smartClient.getStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
