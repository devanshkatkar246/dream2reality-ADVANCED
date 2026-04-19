import { NextResponse } from "next/server";
import { smartClient } from "@/lib/aiRotator";

export async function GET() {
  return NextResponse.json(smartClient.getStatus());
}
