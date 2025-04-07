import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getPatientById, getPatientsByName } from "@/data/dummy-patients"
import { getOrderById } from "@/data/dummy-orders"

// Define response type with metadata
interface ChatResponse {
  id: string
  role: "assistant"
  content: string
  metadata?: {
    action?: "view_order" | "view_patient" | "filter_by_patient" | "create_order" | "track_order"
    orderId?: string
    patientId?: string
    patientName?: string
    autoTrigger?: boolean
  }
}

export async function POST(req: Request) {
  try {
    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.log("OpenAI API key not found, falling back to rule-based responses")
      // Redirect to the fallback API if no API key is available
      const fallbackResponse = await fetch(new URL("/api/chat", req.url), {
        method: "POST",
        headers: req.headers,
        body: JSON.stringify(await req.json()),
      })
      return fallbackResponse
    }

    // Initialize OpenAI client with the dangerouslyAllowBrowser option
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true, // Add this option to fix the error
    })

    // Parse the request body
    const body = await req.json()
    const messages = body.messages || []

    // Extract the conversation history for context
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add system message with instructions
    const systemMessage = {
      role: "system",
      content: `You are a lab assistant specialized in helping with medical lab orders.
Your goal is to understand user intent and provide relevant responses.

When the user expresses intent to order or purchase tests:
1. If they mention a specific patient, include the patient name in the metadata
2. Set metadata with action="create_order" and autoTrigger=true
3. Respond with "I'll help you create a new order. Opening the order form."
4. Keep responses concise and professional

IMPORTANT: Never include metadata information in the response text. Only include it in the metadata field.`,
    }
    conversationHistory.unshift(systemMessage)

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 500,
    })

    // Get the response content
    const responseContent = completion.choices[0].message.content || ""

    // Get the last user message safely
    const lastUserMessage = messages[messages.length - 1]?.content || ""

    // Extract potential metadata from the response
    const metadata = extractMetadataFromResponse(responseContent, lastUserMessage)

    // Return the response with metadata
    return NextResponse.json({
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseContent,
      metadata: metadata,
    })
  } catch (error: any) {
    console.error("Error in OpenAI chat API:", error)

    // Fall back to the rule-based API if there's an error
    try {
      const fallbackResponse = await fetch(new URL("/api/chat", req.url), {
        method: "POST",
        headers: req.headers,
        body: JSON.stringify(await req.json()),
      })
      return fallbackResponse
    } catch (fallbackError) {
      // If even the fallback fails, return an error
      return NextResponse.json(
        {
          error: "Failed to process chat request",
          details: error.message || "Unknown error",
        },
        { status: 500 },
      )
    }
  }
}

// Helper function to extract metadata from the response
function extractMetadataFromResponse(responseContent: string, userMessage: string): ChatResponse["metadata"] {
  // Initialize metadata
  let metadata: ChatResponse["metadata"] = undefined

  // Ensure we have strings to work with
  const safeResponseContent = responseContent || ""
  const safeUserMessage = userMessage || ""

  // Extract potential order ID from user message
  const orderIdMatch =
    safeUserMessage.match(/order\s+(?:id\s+)?([A-Za-z0-9]+)/i) ||
    safeUserMessage.match(/([A-Za-z0-9]+)\s+order/i) ||
    safeUserMessage.match(/#([A-Za-z0-9]+)/i) ||
    safeUserMessage.match(/\b(O[0-9]{4})\b/i)

  const orderId = orderIdMatch ? orderIdMatch[1] : null

  // Extract potential patient name from user message
  const patientNameMatch =
    safeUserMessage.match(/patient\s+([A-Za-z\s]+?)(?:\s*\b(?:results|tests|orders|info|record|profile|data)\b|\s*$)/i) ||
    safeUserMessage.match(/for\s+([A-Za-z\s]+?)(?:\s*\b(?:results|tests|orders|info|record|profile|data)\b|\s*$)/i) ||
    safeUserMessage.match(/([A-Za-z\s]+?)(?:'s)?\s+(?:results|tests|orders|info|record|profile|data)/i)

  const patientName = patientNameMatch ? patientNameMatch[1].trim() : null

  // Check for tracking requests
  if (
    safeResponseContent.toLowerCase().includes("tracking") ||
    safeResponseContent.toLowerCase().includes("track order") ||
    (safeUserMessage.toLowerCase().includes("track") && orderId)
  ) {
    if (orderId) {
      const order = getOrderById(orderId)
      if (order) {
        const patient = getPatientById(order.patientId)
        metadata = {
          action: "track_order" as const,
          orderId: orderId,
          patientName: patient?.name,
          autoTrigger: true,
        }
      }
    }
  }
  // Check for order view requests
  else if (
    (safeResponseContent.toLowerCase().includes("order details") ||
      safeResponseContent.toLowerCase().includes("found order")) &&
    orderId
  ) {
    const order = getOrderById(orderId)
    if (order) {
      metadata = {
        action: "view_order" as const,
        orderId: orderId,
        autoTrigger: true,
      }
    }
  }
  // Check for new order requests
  else if (
    safeResponseContent.toLowerCase().includes("create a new order") ||
    safeResponseContent.toLowerCase().includes("place an order") ||
    safeResponseContent.toLowerCase().includes("order form")
  ) {
    metadata = {
      action: "create_order" as const,
      autoTrigger: true,
    }
  }
  // Check for patient filter requests
  else if (patientName && safeResponseContent.toLowerCase().includes(patientName.toLowerCase())) {
    const patients = getPatientsByName(patientName)
    if (patients.length > 0) {
      metadata = {
        action: "filter_by_patient" as const,
        patientName: patients[0].name,
        patientId: patients[0].id,
        autoTrigger: true,
      }
    }
  }

  return metadata
}

