"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X, Bot, Send, Loader2, AlertCircle, RefreshCw, Info, FileText, Filter, Truck, Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { getOrderById } from "@/data/dummy-orders"
import { getPatientById, getPatientsByName, type TestOrder, patients } from "@/data/dummy-patients"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  metadata?: {
    action?: "view_order" | "view_patient" | "filter_by_patient" | "create_order" | "track_order"
    orderId?: string
    patientId?: string
    patientName?: string
    autoTrigger?: boolean
  }
}

interface ChatAssistantProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
  onViewOrder: (order: TestOrder) => void
  onFilterByPatient: (patientName: string) => void
  onCreateNewOrder: (patientId?: string) => void
  onTrackOrderById: (orderId: string, patientName?: string) => void
}

export default function ChatAssistant({
  isOpen,
  onToggle,
  className,
  onViewOrder,
  onFilterByPatient,
  onCreateNewOrder,
  onTrackOrderById,
}: ChatAssistantProps) {
  // Update the notification banner to show when we're using the enhanced AI

  // First, add a new state to track if we're using the OpenAI API
  const [usingOpenAI, setUsingOpenAI] = useState<boolean | null>(null)

  // Add a useEffect to check if the OpenAI API is configured when the component mounts
  useEffect(() => {
    const checkOpenAIConfig = async () => {
      try {
        const response = await fetch("/api/check-config")
        const data = await response.json()
        setUsingOpenAI(data.configured)
      } catch (error) {
        console.error("Error checking OpenAI configuration:", error)
        setUsingOpenAI(false)
      }
    }

    checkOpenAIConfig()
  }, [])

  // Initial welcome message
  const welcomeMessage = {
    id: "welcome-message",
    role: "assistant" as const,
    content:
      "Hello, I'm your Evexia lab assistant. How can I help you today? I can help you create new lab test orders, check on existing orders, or retrieve patient test results.",
    timestamp: new Date().toISOString(),
  }

  // State for messages, input, and loading
  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContentRef = useRef<HTMLDivElement>(null)

  // Improved scroll handling
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Clear chat history
  const clearChat = () => {
    setMessages([welcomeMessage])
    setError(null)
  }

  // Function to extract order IDs from message content
  const extractOrderId = (content: string): string | null => {
    // Look for patterns like "Order O5001" or "order ID O5001" or just "O5001"
    const orderIdMatch =
      content.match(/order\s+(?:id\s+)?([A-Za-z0-9]+)/i) ||
      content.match(/([A-Za-z0-9]+)\s+order/i) ||
      content.match(/#([A-Za-z0-9]+)/i) ||
      content.match(/\b(O[0-9]{4})\b/i) // Match our specific order ID format

    return orderIdMatch ? orderIdMatch[1] : null
  }

  // Function to extract patient names from message content
  const extractPatientName = (content: string): string | null => {
    // Normalize the content for better matching
    const normalizedContent = content.toLowerCase()

    // Look for patterns like "patient John Smith" or "for John Smith" or "John Smith's results"
    // or just "John Smith" if it matches a known patient
    const patientNameMatch =
      content.match(/patient\s+([A-Za-z\s]+?)(?:\s*\b(?:results|tests|orders|info|record|profile|data)\b|\s*$)/i) ||
      content.match(/for\s+([A-Za-z\s]+?)(?:\s*\b(?:results|tests|orders|info|record|profile|data)\b|\s*$)/i) ||
      content.match(/([A-Za-z\s]+?)(?:'s)?\s+(?:results|tests|orders|info|record|profile|data)/i) ||
      content.match(/find\s+([A-Za-z\s]+?)(?:\s*\b(?:results|tests|orders|info|record|profile|data)\b|\s*$)/i) ||
      content.match(/show\s+([A-Za-z\s]+?)(?:\s*\b(?:results|tests|orders|info|record|profile|data)\b|\s*$)/i) ||
      content.match(/get\s+([A-Za-z\s]+?)(?:\s*\b(?:results|tests|orders|info|record|profile|data)\b|\s*$)/i)

    // If we found a match using the patterns, return it
    if (patientNameMatch) {
      return patientNameMatch[1].trim()
    }

    // If no match yet, check if any known patient names appear in the message
    for (const patient of patients) {
      const patientNameLower = patient.name.toLowerCase()
      if (normalizedContent.includes(patientNameLower)) {
        // Extract the actual case from the original message using the position
        const startIndex = normalizedContent.indexOf(patientNameLower)
        const endIndex = startIndex + patientNameLower.length
        return content.substring(startIndex, endIndex)
      }
    }

    return null
  }

  // Function to check if the message is requesting patient results
  const isRequestingPatientResults = (content: string): boolean => {
    const normalizedContent = content.toLowerCase()
    
    // Common phrases for requesting results
    const resultRequestPatterns = [
      "may i see",
      "can i see",
      "could i see",
      "would you show me",
      "please show me",
      "show me",
      "get",
      "view",
      "check",
      "find",
      "look up",
      "retrieve",
      "access",
      "pull up",
      "display",
      "see",
      "tell me",
      "give me",
      "share",
      "let me see",
      "i want to see",
      "i need to see",
      "i would like to see",
      "i'd like to see",
      "i want to check",
      "i need to check",
      "i would like to check",
      "i'd like to check"
    ]
    
    // Keywords that indicate results
    const resultKeywords = [
      "result",
      "test result",
      "lab result",
      "latest result",
      "completed test",
      "test outcome",
      "finding",
      "report",
      "data",
      "value",
      "reading",
      "measurement",
      "analysis",
      "outcome"
    ]
    
    // Check if any of the request patterns are in the content
    const hasRequestPattern = resultRequestPatterns.some(pattern => 
      normalizedContent.includes(pattern)
    )
    
    // Check if any of the result keywords are in the content
    const hasResultKeyword = resultKeywords.some(keyword => 
      normalizedContent.includes(keyword)
    )
    
    // Return true if we have both a request pattern and a result keyword
    return hasRequestPattern && hasResultKeyword
  }

  // Function to check if the message is requesting order tracking
  const isRequestingOrderTracking = (content: string): boolean => {
    const normalizedContent = content.toLowerCase()
    
    // Common phrases for requesting tracking
    const trackingRequestPatterns = [
      "track",
      "tracking",
      "status",
      "where is",
      "what's the status",
      "what is the status",
      "check status",
      "order status",
      "order tracking",
      "follow",
      "follow up",
      "progress",
      "update",
      "latest update",
      "current status",
      "where's my order",
      "order location",
      "order progress",
      "order update"
    ]
    
    // Check if any of the tracking patterns are in the content
    return trackingRequestPatterns.some(pattern => 
      normalizedContent.includes(pattern)
    )
  }

  // Function to handle order tracking
  const handleOrderTracking = (patientName: string) => {
    // Find patient by name
    const patient = patients.find(p => p.name.toLowerCase() === patientName.toLowerCase())
    if (patient) {
      // Get all orders for the patient
      const patientOrders = patient.orders
      if (patientOrders.length > 0) {
        // Get the latest order
        const latestOrder = patientOrders[patientOrders.length - 1]
        // Add message with metadata to track the order
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `I found the latest order for ${patient.name}. Opening the tracking details...`,
            metadata: {
              action: "track_order",
              orderId: latestOrder.id,
              patientName: patient.name,
              autoTrigger: true
            },
            timestamp: new Date().toISOString()
          }
        ])
        // Trigger the action
        if (onTrackOrderById) {
          onTrackOrderById(latestOrder.id, patient.name)
        }
      } else {
        // No orders found
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `I found ${patient.name} in our records, but they don't have any orders yet.`,
            timestamp: new Date().toISOString()
          }
        ])
      }
    } else {
      // Patient not found
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `I couldn't find a patient named "${patientName}" in our records. Please check the spelling or try a different name.`,
          timestamp: new Date().toISOString()
        }
      ])
    }
  }

  // Function to handle clicking on an order reference in a message
  const handleOrderClick = (orderId: string) => {
    const order = getOrderById(orderId)
    if (order && onViewOrder) {
      onViewOrder(order)
    }
  }

  // Function to handle clicking on a patient filter button
  const handlePatientFilterClick = (patientName: string) => {
    if (onFilterByPatient) {
      onFilterByPatient(patientName)
    }
  }

  // Function to handle clicking on create order button
  const handleCreateOrderClick = () => {
    if (onCreateNewOrder) {
      onCreateNewOrder()
    }
  }

  // Function to handle clicking on track order button
  const handleTrackOrderClick = (orderId: string, patientName?: string) => {
    if (onTrackOrderById) {
      onTrackOrderById(orderId, patientName)
    }
  }

  // Function to check if text contains a patient name and make it styled
  const highlightPatientNames = (text: string): React.ReactNode => {
    // Create a copy of the text to work with
    const result = text
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    // Check for each patient name in the text
    for (const patient of patients) {
      const patientName = patient.name
      const patientNameRegex = new RegExp(`\\b${patientName}\\b`, "gi")
      let match

      // Reset the regex for each search
      patientNameRegex.lastIndex = 0

      // Find all instances of this patient name
      while ((match = patientNameRegex.exec(text)) !== null) {
        const matchIndex = match.index
        const matchLength = match[0].length

        // Add text before the match
        if (matchIndex > lastIndex) {
          elements.push(<span key={`text-${lastIndex}-${matchIndex}`}>{text.substring(lastIndex, matchIndex)}</span>)
        }

        // Add the highlighted patient name
        elements.push(
          <span key={`patient-${matchIndex}`} className="font-semibold text-evexia-blue">
            {match[0]}
          </span>,
        )

        lastIndex = matchIndex + matchLength
      }
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      elements.push(<span key={`text-${lastIndex}-end`}>{text.substring(lastIndex)}</span>)
    }

    return elements.length > 0 ? <>{elements}</> : text
  }

  // Now modify the renderMessageContent function to use the highlightPatientNames function:

  const renderMessageContent = (content: string, metadata?: Message["metadata"]): React.ReactNode => {
    // Si el contenido incluye "Metadata:", lo eliminamos
    const cleanContent = content.replace(/Metadata:.*$/, "").trim()

    if (!metadata) {
      // Check for order IDs in the content
      const orderIdMatch = extractOrderId(cleanContent)
      if (orderIdMatch && getOrderById(orderIdMatch)) {
        // If we find an order ID, make it clickable
        const parts = cleanContent.split(new RegExp(`(\\b${orderIdMatch}\\b)`, "i"))
        return (
          <>
            {parts.map((part, index) =>
              part.toUpperCase() === orderIdMatch.toUpperCase() ? (
                <button
                  key={index}
                  onClick={() => handleOrderClick(orderIdMatch)}
                  className="text-blue-600 underline font-medium hover:text-blue-800"
                >
                  {part}
                </button>
              ) : (
                <span key={index}>{highlightPatientNames(part)}</span>
              ),
            )}
          </>
        )
      }

      // If no order ID, just highlight patient names
      return highlightPatientNames(cleanContent)
    } else if (metadata.action === "view_order" && metadata.orderId && getOrderById(metadata.orderId)) {
      // If the message has an explicit order reference, add a view button
      return (
        <>
          <p>{highlightPatientNames(cleanContent)}</p>
          {!metadata.autoTrigger && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleOrderClick(metadata.orderId!)}
              >
                <FileText className="h-3 w-3 mr-1" />
                View Order Details
              </Button>
            </div>
          )}
        </>
      )
    } else if (metadata.action === "track_order" && metadata.orderId) {
      // If the message has an explicit order tracking reference, add a track button
      return (
        <>
          <p>{highlightPatientNames(cleanContent)}</p>
          {!metadata.autoTrigger && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleTrackOrderClick(metadata.orderId!, metadata.patientName)}
              >
                <Truck className="h-3 w-3 mr-1" />
                Track Order
              </Button>
            </div>
          )}
        </>
      )
    } else if (metadata.action === "filter_by_patient" && metadata.patientName) {
      // If the message has a patient filter action, add a filter button
      return (
        <>
          <p>{highlightPatientNames(cleanContent)}</p>
          {!metadata.autoTrigger && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handlePatientFilterClick(metadata.patientName!)}
              >
                <Filter className="h-3 w-3 mr-1" />
                View {metadata.patientName}'s Orders
              </Button>
            </div>
          )}
        </>
      )
    } else if (metadata.action === "create_order") {
      // If the message has a create order action, add a create button
      return (
        <>
          <p>{highlightPatientNames(cleanContent)}</p>
          {!metadata.autoTrigger && (
            <div className="mt-2">
              <Button size="sm" variant="outline" className="text-xs" onClick={handleCreateOrderClick}>
                <FileText className="h-3 w-3 mr-1" />
                Create New Order
              </Button>
            </div>
          )}
        </>
      )
    }

    // Default case: just return the content with patient names highlighted
    return highlightPatientNames(cleanContent)
  }

  // Generate a fallback response directly without API call
  const generateFallbackResponse = (userMessage: string): Message => {
    // Normalize the message for easier pattern matching
    const normalizedMessage = userMessage.toLowerCase().trim()

    // Extract potential order ID from message
    const orderIdMatch = extractOrderId(userMessage)

    // Extract potential patient name from message
    const patientNameMatch = extractPatientName(userMessage)

    let responseContent = "I'm here to help with lab test orders, tracking, and results. How can I assist you today?"
    let metadata = undefined

    // Check for tracking requests
    if (
      normalizedMessage.includes("track") ||
      normalizedMessage.includes("status") ||
      normalizedMessage.includes("where is") ||
      normalizedMessage.includes("shipping") ||
      normalizedMessage.includes("delivery") ||
      normalizedMessage.includes("progress") ||
      normalizedMessage.includes("follow") ||
      (normalizedMessage.includes("check") &&
        (normalizedMessage.includes("order") ||
          normalizedMessage.includes("package") ||
          normalizedMessage.includes("kit")))
    ) {
      // If there's an order ID in the message, use it
      if (orderIdMatch) {
        const order = getOrderById(orderIdMatch)
        if (order) {
          const patient = getPatientById(order.patientId)
          responseContent = `I'll show you the tracking information for order ${orderIdMatch} (${order.testName}) for ${patient?.name || "Unknown Patient"}.`
          metadata = {
            action: "track_order",
            orderId: orderIdMatch,
            patientName: patient?.name,
            autoTrigger: true,
          }
        } else {
          responseContent = `I couldn't find an order with ID "${orderIdMatch}" to track. Please check the order ID and try again.`
          metadata = {
            action: "track_order",
            orderId: orderIdMatch,
            autoTrigger: true,
          }
        }
      }
      // If there's a patient name but no order ID, suggest their most recent order
      else if (patientNameMatch) {
        const patients = getPatientsByName(patientNameMatch)
        if (patients.length > 0) {
          const patient = patients[0]
          if (patient.orders.length > 0) {
            // Get the most recent order
            const latestOrder = patient.orders.sort(
              (a, b) => new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime(),
            )[0]

            responseContent = `I'll show you the tracking information for ${patient.name}'s most recent order (${latestOrder.testName}, Order ID: ${latestOrder.id}).`
            metadata = {
              action: "track_order",
              orderId: latestOrder.id,
              patientName: patient.name,
              autoTrigger: true,
            }
          } else {
            responseContent = `${patient.name} doesn't have any orders to track.`
          }
        } else {
          responseContent = `I couldn't find a patient named "${patientNameMatch}" to check order tracking. Please provide more information.`
        }
      } else {
        responseContent = `I can help you track an order. Please provide an order ID (like O5001) or a patient name to check their most recent order.`
      }
    }
    // Check for new order request - expanded vocabulary
    else if (
      // Direct order creation phrases
      normalizedMessage.includes("new order") ||
      normalizedMessage.includes("create order") ||
      normalizedMessage.includes("place order") ||
      normalizedMessage.includes("make order") ||
      normalizedMessage.includes("submit order") ||
      normalizedMessage.includes("start order") ||
      normalizedMessage.includes("begin order") ||
      normalizedMessage.includes("initiate order") ||
      // Order with test mentions
      normalizedMessage.includes("order a test") ||
      normalizedMessage.includes("order test") ||
      normalizedMessage.includes("request a test") ||
      normalizedMessage.includes("request test") ||
      normalizedMessage.includes("schedule test") ||
      normalizedMessage.includes("schedule a test") ||
      // Indirect order creation phrases
      (normalizedMessage.includes("need") &&
        (normalizedMessage.includes("test") || normalizedMessage.includes("order"))) ||
      (normalizedMessage.includes("want") &&
        (normalizedMessage.includes("test") || normalizedMessage.includes("order"))) ||
      (normalizedMessage.includes("would like") &&
        (normalizedMessage.includes("test") || normalizedMessage.includes("order")))
    ) {
      responseContent =
        "I'd be happy to help you create a new order. You can use our order form to select a patient and test type."
      metadata = {
        action: "create_order",
        autoTrigger: true,
      }
    }
    // First check for order ID
    else if (orderIdMatch) {
      const order = getOrderById(orderIdMatch)
      if (order) {
        const patient = getPatientById(order.patientId)
        responseContent = `I found order ${orderIdMatch}. This is a ${order.testName} test for ${patient?.name || "Unknown Patient"} (ID: ${order.patientId}). The current status is ${order.status}.`
        metadata = {
          action: "view_order",
          orderId: orderIdMatch,
          autoTrigger: true,
        }
      } else {
        responseContent = `I couldn't find an order with ID "${orderIdMatch}" in our system. Please check the order ID and try again.`
      }
    }
    // Then check for patient name
    else if (patientNameMatch) {
      const patients = getPatientsByName(patientNameMatch)

      if (patients.length > 0) {
        const patient = patients[0] // Use the first matching patient

        // Add a greeting that acknowledges the patient name
        responseContent = `I found information for patient ${patient.name} (ID: ${patient.id}). `

        // Check if we're looking for test results - expanded vocabulary
        if (
          normalizedMessage.includes("result") ||
          normalizedMessage.includes("lab") ||
          normalizedMessage.includes("test result") ||
          normalizedMessage.includes("findings") ||
          normalizedMessage.includes("report") ||
          normalizedMessage.includes("data") ||
          normalizedMessage.includes("values") ||
          normalizedMessage.includes("numbers") ||
          normalizedMessage.includes("outcome")
        ) {
          // Find completed orders with results
          const completedOrders = patient.orders.filter((order) => order.status === "Completed" && order.results)

          if (completedOrders.length > 0) {
            // Sort by most recent
            const latestOrder = completedOrders.sort(
              (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
            )[0]

            responseContent += `The most recent completed test is ${latestOrder.testName} from ${latestOrder.orderedDate}. The status is ${latestOrder.status}.`

            if (latestOrder.results) {
              responseContent += ` Summary: ${latestOrder.results.resultSummary}`
            }

            metadata = {
              action: "view_order",
              orderId: latestOrder.id,
              autoTrigger: true,
            }
          } else {
            responseContent += `${patient.name} has ${patient.orders.length} test orders, but none have completed results yet.`

            // If they have any orders, offer to show the most recent one
            if (patient.orders.length > 0) {
              const latestOrder = patient.orders.sort(
                (a, b) => new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime(),
              )[0]

              responseContent += ` Would you like to see details of their most recent order (${latestOrder.testName})?`

              metadata = {
                action: "view_order",
                orderId: latestOrder.id,
                autoTrigger: false,
              }
            }
          }
        }
        // Check if we're looking for orders - expanded vocabulary
        else if (
          normalizedMessage.includes("order") ||
          normalizedMessage.includes("test") ||
          normalizedMessage.includes("lab work") ||
          normalizedMessage.includes("requisition") ||
          normalizedMessage.includes("panel") ||
          normalizedMessage.includes("diagnostic") ||
          normalizedMessage.includes("specimen") ||
          normalizedMessage.includes("sample") ||
          normalizedMessage.includes("history") ||
          normalizedMessage.includes("record")
        ) {
          if (patient.orders.length > 0) {
            const latestOrder = patient.orders.sort(
              (a, b) => new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime(),
            )[0]

            responseContent += `${patient.name} has ${patient.orders.length} test orders. The most recent is a ${latestOrder.testName} ordered on ${latestOrder.orderedDate} with status "${latestOrder.status}".`

            // Add metadata to filter by patient
            metadata = {
              action: "filter_by_patient",
              patientName: patient.name,
              patientId: patient.id,
              autoTrigger: true,
            }
          } else {
            responseContent += `${patient.name} doesn't have any test orders in the system.`
          }
        }
        // General patient info (if no specific query type is detected)
        else {
          responseContent = `Patient: ${patient.name}
ID: ${patient.id}
DOB: ${patient.dateOfBirth}
Gender: ${patient.gender}
Contact: ${patient.email}

This patient has ${patient.orders.length} test orders in the system.`

          if (patient.orders.length > 0) {
            // Change this to automatically show orders instead of asking
            responseContent += ` I'll show you their orders now.`

            metadata = {
              action: "filter_by_patient",
              patientName: patient.name,
              patientId: patient.id,
              autoTrigger: true,
            }
          }
        }
      } else {
        responseContent = `I couldn't find a patient named "${patientNameMatch}" in our records. Please check the spelling or provide more information.`
      }
    }
    // Handle general queries with expanded vocabulary
    else if (
      // Test/order related queries
      normalizedMessage.includes("test") ||
      normalizedMessage.includes("order") ||
      normalizedMessage.includes("lab") ||
      normalizedMessage.includes("diagnostic") ||
      normalizedMessage.includes("panel") ||
      normalizedMessage.includes("specimen") ||
      normalizedMessage.includes("sample")
    ) {
      responseContent =
        "I can help you with test orders. Would you like to see recent orders or search for a specific one? You can ask about a specific order by ID (like O5001) or ask about a patient's orders by name."
    } else if (
      // Patient related queries
      normalizedMessage.includes("patient") ||
      normalizedMessage.includes("person") ||
      normalizedMessage.includes("client") ||
      normalizedMessage.includes("individual") ||
      normalizedMessage.includes("subject") ||
      normalizedMessage.includes("customer") ||
      normalizedMessage.includes("profile") ||
      normalizedMessage.includes("record") ||
      normalizedMessage.includes("find") ||
      normalizedMessage.includes("search") ||
      normalizedMessage.includes("lookup")
    ) {
      responseContent =
        "I can help you find patient information. Please provide a patient name (like 'Show me James Wilson's information') or ask about their test orders or results."
    } else if (
      // Result related queries
      normalizedMessage.includes("result") ||
      normalizedMessage.includes("report") ||
      normalizedMessage.includes("finding") ||
      normalizedMessage.includes("outcome") ||
      normalizedMessage.includes("value") ||
      normalizedMessage.includes("data") ||
      normalizedMessage.includes("reading") ||
      normalizedMessage.includes("measurement") ||
      normalizedMessage.includes("analysis")
    ) {
      responseContent =
        "I can help you find test results. Please specify which patient you're interested in (like 'Show me test results for Maria Garcia') or provide an order ID."
    }

    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseContent,
      metadata,
      timestamp: new Date().toISOString(),
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Check if the message is requesting order tracking
    const patientName = extractPatientName(input)
    if (patientName && isRequestingOrderTracking(input)) {
      handleOrderTracking(patientName)
      return
    }

    // Check if the message is requesting patient results
    if (patientName && isRequestingPatientResults(input)) {
      console.log("Found patient name and requesting results:", patientName)
      // Find patient by name
      const patient = patients.find(p => p.name.toLowerCase() === patientName.toLowerCase())
      if (patient) {
        console.log("Found patient:", patient)
        // Find completed orders with results
        const completedOrders = patient.orders.filter(order => order.status === "Completed")
        if (completedOrders.length > 0) {
          // Get the latest order
          const latestOrder = completedOrders[completedOrders.length - 1]
          // Add message with metadata to view the order
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: `I found the latest results for ${patient.name}. Opening the order details...`,
              metadata: {
                action: "view_order",
                orderId: latestOrder.id,
                patientName: patient.name,
                autoTrigger: true
              },
              timestamp: new Date().toISOString()
            }
          ])
          // Trigger the action
          if (onViewOrder) {
            onViewOrder(latestOrder)
          }
          return
        } else {
          // No completed orders found
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: `I found ${patient.name} in our records, but they don't have any completed orders with results yet.`,
              timestamp: new Date().toISOString()
            }
          ])
          return
        }
      } else {
        // Patient not found
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `I couldn't find a patient named "${patientName}" in our records. Please check the spelling or try a different name.`,
            timestamp: new Date().toISOString()
          }
        ])
        return
      }
    }

    // Extract patient name from user message
    const patientNameFromMessage = extractPatientName(input)
    console.log("Extracted patient name:", patientNameFromMessage)

    // Call OpenAI API
      const response = await fetch("/api/chat-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        messages: [...messages, { role: "user", content: input }],
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

    const data = await response.json()
    const metadata = data.metadata as Message["metadata"] | undefined
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: data.content,
      metadata,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, assistantMessage])

    // Handle any automatic actions based on metadata
    if (metadata) {
      console.log("Received metadata:", metadata)
      if (metadata.action === "create_order" && metadata.autoTrigger === true && onCreateNewOrder) {
        console.log("Executing create_order action")
        if (patientNameFromMessage) {
          console.log("Found patient name in message:", patientNameFromMessage)
          // Find patient by name (case-insensitive)
          const patient = patients.find(p => p.name.toLowerCase() === patientNameFromMessage.toLowerCase())
          if (patient) {
            console.log("Found patient:", patient)
            onCreateNewOrder(patient.id)
          } else {
            console.log("Patient not found, creating order without patient")
            onCreateNewOrder()
          }
        } else {
          console.log("No patient name found in message, creating order without patient")
              onCreateNewOrder()
        }
      } else if (metadata.action === "filter_by_patient" && 
          metadata.patientName && 
          metadata.autoTrigger === true && 
          onFilterByPatient) {
        console.log("Executing filter_by_patient action with:", metadata.patientName)
        onFilterByPatient(metadata.patientName)
      } else if (metadata.action === "track_order" && 
          metadata.orderId && 
          metadata.autoTrigger === true && 
          onTrackOrderById) {
        console.log("Executing track_order action with:", metadata.orderId)
        onTrackOrderById(metadata.orderId)
      } else if (metadata.action === "view_order" && 
          metadata.orderId && 
          metadata.autoTrigger === true && 
          onViewOrder) {
        console.log("Executing view_order action with:", metadata.orderId)
        onViewOrder(metadata.orderId)
      } else {
        console.log("No matching action found in metadata")
        console.log("Action:", metadata.action)
        console.log("AutoTrigger:", metadata.autoTrigger)
        console.log("onCreateNewOrder available:", !!onCreateNewOrder)
      }
    } else {
      console.log("No metadata received in response")
    }
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Verificar si el navegador soporta Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Your browser does not support voice recognition.')
      return
    }

    // Inicializar el reconocimiento de voz
    const SpeechRecognitionAPI = (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionConstructor
    const recognition = new SpeechRecognitionAPI()
    
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsRecording(false)
      setIsProcessing(false)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Recognition error:', event.error)
      setSpeechError(`Error: ${event.error}`)
      setIsRecording(false)
      setIsProcessing(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      setIsProcessing(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleMicrophoneClick = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsRecording(false)
      setSpeechError(null)
    } else {
      if (!recognitionRef.current) {
        setSpeechError('Voice recognition is not available.')
        return
      }

      try {
        recognitionRef.current.start()
        setIsRecording(true)
        setIsProcessing(true)
        setSpeechError(null)
      } catch (error) {
        console.error('Error starting recognition:', error)
        setSpeechError('Error starting voice recognition.')
        setIsRecording(false)
        setIsProcessing(false)
      }
    }
  }

  // Floating button when chat is closed
  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-evexia-blue hover:bg-evexia-lightblue z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className={cn("border-l flex flex-col h-full transition-all duration-300", className)}>
      <Card className="flex flex-col h-full rounded-none border-0">
        <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between space-y-0 bg-evexia-blue text-white shrink-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-white text-evexia-blue">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="text-base font-medium">Lab Assistant</div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8 text-white hover:bg-evexia-lightblue"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 text-white hover:bg-evexia-lightblue"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div
          className={cn(
            "p-2 text-xs flex items-center shrink-0",
            usingOpenAI ? "bg-green-50 text-green-800" : "bg-yellow-50 text-yellow-800",
          )}
        >
          <Info className="h-3 w-3 mr-1" />
          {usingOpenAI === null
            ? "Checking AI configuration..."
            : usingOpenAI
              ? "Enhanced AI mode: Using OpenAI for natural language understanding"
              : "Running in fallback mode with simulated responses"}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <CardContent
            ref={chatContentRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{
              height: "calc(100% - 70px)",
              maxHeight: "calc(100% - 70px)",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div className="flex flex-col space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3 text-sm", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-0.5 bg-evexia-blue text-white shrink-0">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%]",
                      message.role === "user" ? "bg-evexia-blue text-white" : "bg-gray-100",
                    )}
                  >
                    {renderMessageContent(message.content, message.metadata)}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 mt-0.5 bg-evexia-blue text-white shrink-0">
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 text-sm justify-start">
                  <Avatar className="h-8 w-8 mt-0.5 bg-evexia-blue text-white shrink-0">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 bg-gray-100 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-4 text-sm bg-red-50 rounded-md border border-red-200">
                  <div className="flex items-center text-red-600 mb-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Error connecting to AI assistant</span>
                  </div>
                  <p className="text-red-600 mb-2">{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-2 border-t shrink-0">
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                name="message"
                placeholder="Ask about tests, orders, results or lab reports..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isLoading || isProcessing}
              />
              <button
                type="button"
                onClick={handleMicrophoneClick}
                disabled={isProcessing}
                className={cn(
                  "p-2 rounded-full transition-colors duration-200",
                  isRecording 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-gray-200 hover:bg-gray-300",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                title={
                  isProcessing 
                    ? "Processing audio..." 
                    : isRecording 
                      ? "Stop recording" 
                      : "Start recording"
                }
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim() || isProcessing}
                className="bg-evexia-blue hover:bg-evexia-lightblue shrink-0"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            {(speechError || isProcessing) && (
              <div className={cn(
                "text-sm mt-2",
                speechError ? "text-red-500" : "text-gray-500"
              )}>
                {speechError || "Processing audio..."}
              </div>
            )}
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

