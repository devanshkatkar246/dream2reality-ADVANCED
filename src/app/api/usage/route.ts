import { NextResponse } from "next/server";
import { getUsage } from "@/lib/usage";

export async function GET() {
  return NextResponse.json(getUsage());
}
