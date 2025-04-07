import { NextResponse } from "next/server"
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

// This API route now only uses the fallback mechanism - no OpenAI dependency
export async function POST(req: Request) {
  try {
    console.log("Chat API route called - using fallback only")

    // Parse the request body
    let messages = []
    try {
      const body = await req.json()
      if (body && body.messages && Array.isArray(body.messages)) {
        messages = body.messages
      }
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Get the last user message
    let lastUserMessage = ""
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (msg && typeof msg === "object" && msg.role === "user" && typeof msg.content === "string") {
        lastUserMessage = msg.content
        break
      }
    }

    console.log("Last user message:", lastUserMessage)

    // For test requests, return a simple response
    if (lastUserMessage === "test") {
      return NextResponse.json({
        id: `test-${Date.now()}`,
        role: "assistant",
        content: "This is a test response from the AI assistant.",
      })
    }

    // Simulate a delay for a more realistic experience
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Initialize response object
    const response: ChatResponse = {
      id: `fallback-${Date.now()}`,
      role: "assistant",
      content: "I'm here to help with lab test orders, tracking, and results. How can I assist you today?",
    }

    // Generate a response based on the user's message
    const lowerMessage = lastUserMessage.toLowerCase()

    // Check for specific order requests
    if (
      (lowerMessage.includes("order") || lowerMessage.includes("test")) &&
      (lowerMessage.includes("detail") ||
        lowerMessage.includes("view") ||
        lowerMessage.includes("show") ||
        lowerMessage.includes("about") ||
        lowerMessage.includes("info"))
    ) {
      // Try to extract order ID
      const orderIdMatch =
        lastUserMessage.match(/order\s+(?:id\s+)?([A-Za-z0-9]+)/i) ||
        lastUserMessage.match(/([A-Za-z0-9]+)\s+order/i) ||
        lastUserMessage.match(/#([A-Za-z0-9]+)/i) ||
        lastUserMessage.match(/\b(O[0-9]{4})\b/i) // Match our specific order ID format

      if (orderIdMatch) {
        const orderId = orderIdMatch[1].trim()
        const order = getOrderById(orderId)

        if (order) {
          const patient = getPatientById(order.patientId)

          response.content = `Here are the details for Order ${order.id}:

Patient: ${patient?.name || "Unknown"}
Test: ${order.testName}
Ordered Date: ${order.orderedDate}
Status: ${order.status}
Last Updated: ${order.lastUpdated}
Ordered By: ${order.orderedBy}
`

          if (order.results) {
            response.content += "Test Results: Available\n"
          }

          // Add metadata to trigger order view
          response.metadata = {
            action: "view_order",
            orderId: order.id,
            autoTrigger: true, // Automatically trigger the view
          }
        } else {
          response.content = `I couldn't find an order with ID "${orderId}" in our records. Please check the order ID and try again.`
        }
      } else {
        response.content = `I'd be happy to provide order details. Could you please specify which order you're interested in by providing an order ID or patient name?`
      }
    } else if (lowerMessage.includes("track") || lowerMessage.includes("status")) {
      // Try to extract order ID
      const orderIdMatch =
        lastUserMessage.match(/order\s+(?:id\s+)?([A-Za-z0-9]+)/i) ||
        lastUserMessage.match(/([A-Za-z0-9]+)\s+order/i) ||
        lastUserMessage.match(/#([A-Za-z0-9]+)/i) ||
        lastUserMessage.match(/\b(O[0-9]{4})\b/i)

      if (orderIdMatch) {
        const orderId = orderIdMatch[1].trim()
        const order = getOrderById(orderId)

        if (order) {
          const patient = getPatientById(order.patientId)
          response.content = `I'll show you the tracking information for order ${orderId} (${order.testName}) for ${patient?.name || "Unknown Patient"}.`
          response.metadata = {
            action: "track_order",
            orderId: orderId,
            patientName: patient?.name,
            autoTrigger: true,
          }
        }
      } else {
        response.content = `I can help you track an order. Please provide an order ID (like O5001) or a patient name to check their most recent order.`
      }
    } else if (
      // Check for new order request - expanded vocabulary
      lowerMessage.includes("new order") ||
      lowerMessage.includes("create order") ||
      lowerMessage.includes("place order") ||
      lowerMessage.includes("make order") ||
      lowerMessage.includes("submit order") ||
      lowerMessage.includes("start order") ||
      lowerMessage.includes("begin order") ||
      lowerMessage.includes("initiate order") ||
      // Order with test mentions
      lowerMessage.includes("order a test") ||
      lowerMessage.includes("order test") ||
      lowerMessage.includes("request a test") ||
      lowerMessage.includes("request test") ||
      lowerMessage.includes("schedule test") ||
      lowerMessage.includes("schedule a test") ||
      // Indirect order creation phrases
      (lowerMessage.includes("need") &&
        (lowerMessage.includes("test") || lowerMessage.includes("order"))) ||
      (lowerMessage.includes("want") &&
        (lowerMessage.includes("test") || lowerMessage.includes("order"))) ||
      (lowerMessage.includes("would like") &&
        (lowerMessage.includes("test") || lowerMessage.includes("order")))
    ) {
      response.content = "I'll help you create a new order. Opening the order form."
      response.metadata = {
        action: "create_order" as const,
        autoTrigger: true,
      }
    } else if (lowerMessage.includes("patient")) {
      // Try to extract patient name
      const patientNameMatch =
        lastUserMessage.match(/patient\s+([A-Za-z\s]+)/i) ||
        lastUserMessage.match(/for\s+([A-Za-z\s]+)/i) ||
        lastUserMessage.match(/([A-Za-z\s]+?)(?:'s)?\s+(?:results|tests|orders|info|record|profile|data)/i)

      if (patientNameMatch) {
        const patientName = patientNameMatch[1].trim()
        const patients = getPatientsByName(patientName)

        if (patients.length > 0) {
          response.content = `I found information for patient ${patients[0].name}. I'll show you their orders now.`
          response.metadata = {
            action: "filter_by_patient",
            patientName: patients[0].name,
            patientId: patients[0].id,
            autoTrigger: true,
          }
        } else {
          response.content = `I couldn't find a patient named "${patientName}" in our records. Please check the spelling or provide more information.`
        }
      } else {
        response.content = `I can help you find patient information. Please provide a patient name (like 'Show me James Wilson's information') or ask about their test orders or results.`
      }
    } else {
      // Default response for other queries
      response.content = `I'm here to help with lab test orders, tracking, and results. How can I assist you today? You can ask me about:

- Creating new lab test orders
- Checking the status of existing orders
- Retrieving patient test results
- Getting patient information

Please let me know what you need assistance with.`
    }

    console.log("Response generated")

    // Return the response
    return NextResponse.json({
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response.content,
      metadata: response.metadata,
    })
  } catch (error: any) {
    // Log the detailed error
    console.error("Error in chat API:", error)

    // Return a more detailed error message
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

