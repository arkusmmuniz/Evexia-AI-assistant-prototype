"use client"

import { useState } from "react"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function useAiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello, I'm your lab assistant. How can I help you today? I can help you create new lab test orders, check on existing orders, or retrieve patient test results.",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    addMessage("user", content)

    // Set loading state
    setIsLoading(true)

    try {
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let responseContent = ""

      if (content.toLowerCase().includes("order") || content.toLowerCase().includes("test")) {
        responseContent =
          "I can help you create a new lab test order. What type of test are you looking for? We have over 6,000 tests available, including specialty tests."
      } else if (content.toLowerCase().includes("result") || content.toLowerCase().includes("patient")) {
        responseContent =
          "I can help you retrieve patient test results. Please provide the patient's name or ID to proceed."
      } else if (content.toLowerCase().includes("status") || content.toLowerCase().includes("track")) {
        responseContent =
          "I can check the status of your test orders. Would you like to see all pending orders or a specific one?"
      } else {
        responseContent = "I'm here to help with lab test orders, tracking, and results. How can I assist you today?"
      }

      // Add AI response
      addMessage("assistant", responseContent)
    } catch (error) {
      console.error("Error sending message:", error)
      addMessage("assistant", "I'm sorry, I encountered an error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
  }
}

