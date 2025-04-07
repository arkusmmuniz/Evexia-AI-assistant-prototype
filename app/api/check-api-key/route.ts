import { NextResponse } from "next/server"

// This function now always returns "not configured" - no OpenAI dependency
export async function GET() {
  return NextResponse.json(
    {
      valid: false,
      message: "OpenAI API key is not required - using local fallback system",
    },
    { status: 200 },
  )
}

