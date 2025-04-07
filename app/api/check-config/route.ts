import { NextResponse } from "next/server"

export async function GET() {
  // Check if OpenAI API key is configured
  const openaiApiKey = process.env.OPENAI_API_KEY

  return NextResponse.json({
    configured: !!openaiApiKey,
    message: openaiApiKey ? "OpenAI API key is configured" : "OpenAI API key is not configured",
  })
}

