"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, Check } from "lucide-react"

export default function ApiDiagnostics() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "warning">("loading")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<string>("")

  const checkApiStatus = async () => {
    setStatus("loading")
    setMessage("Checking API configuration...")

    try {
      // Check if the OpenAI API key is configured
      const configResponse = await fetch("/api/check-config")
      const configData = await configResponse.json()

      if (!configData.configured) {
        setStatus("warning")
        setMessage("OpenAI API key is not configured")
        setDetails(
          "The system will use the fallback chat mode. To enable enhanced AI responses, add your OpenAI API key to the environment variables.",
        )
        return
      }

      // Test the OpenAI integration
      try {
        const testResponse = await fetch("/api/chat-openai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: "test" }],
          }),
        })

        if (testResponse.ok) {
          setStatus("success")
          setMessage("OpenAI integration is working")
          setDetails(
            "The enhanced AI chat is configured and working correctly. You can use the chat assistant with advanced natural language understanding.",
          )
        } else {
          setStatus("warning")
          setMessage("OpenAI API returned an error")
          setDetails("The OpenAI API is configured but returned an error. The fallback mode will be used.")
        }
      } catch (apiError) {
        setStatus("warning")
        setMessage("Could not connect to OpenAI API")
        setDetails("The OpenAI API is configured but could not be reached. The fallback mode will be used.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error checking API status")
      setDetails(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "loading" && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
          API Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-800 p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Using local fallback system - no API key required</span>
            </div>
            <p className="text-xs text-gray-500">
              The system is using a local response generator for the chat assistant.
            </p>
          </div>
          <Button onClick={checkApiStatus} disabled={status === "loading"} className="w-full">
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Again"
            )}
          </Button>

          <div className="text-sm text-muted-foreground mt-4 pt-4 border-t">
            <p>The chat assistant is currently using the fallback mode with simulated responses.</p>
            <p className="mt-2">This ensures functionality even without an active OpenAI API connection.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

