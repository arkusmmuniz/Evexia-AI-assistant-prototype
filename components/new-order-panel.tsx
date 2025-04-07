"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, FileText, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getTestTypes, patients } from "@/data/dummy-patients"

interface NewOrderPanelProps {
  onBack: () => void
  onOrderCreated?: (orderId: string) => void
}

export default function NewOrderPanel({ onBack, onOrderCreated }: NewOrderPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState("")

  // Form state
  const [patientId, setPatientId] = useState("")
  const [testType, setTestType] = useState("")
  const [notes, setNotes] = useState("")

  // Get test types
  const testTypes = getTestTypes()

  // Animation effect when component mounts
  useState(() => {
    // Small delay to allow for transition
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  })

  // Handle back button with animation
  const handleBack = () => {
    setIsVisible(false)
    setTimeout(() => {
      onBack()
    }, 300) // Match transition duration
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!patientId || !testType) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a random order ID
      const newOrderId = `O${Math.floor(5000 + Math.random() * 5000)}`
      setOrderId(newOrderId)
      setSuccess(true)

      // Notify parent component
      if (onOrderCreated) {
        onOrderCreated(newOrderId)
      }
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "p-6 max-w-3xl mx-auto transition-all duration-300 ease-in-out overflow-y-auto",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Create New Order</h1>
        </div>
      </div>

      <Card className="shadow-sm transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient">Patient</Label>
                  <Select value={patientId} onValueChange={setPatientId} required>
                    <SelectTrigger id="patient" className="w-full">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="test-type">Test Type</Label>
                  <Select value={testType} onValueChange={setTestType} required>
                    <SelectTrigger id="test-type" className="w-full">
                      <SelectValue placeholder="Select a test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((test) => (
                        <SelectItem key={test} value={test}>
                          {test}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add any special instructions or notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-24"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !patientId || !testType}
                  className="bg-evexia-blue hover:bg-evexia-lightblue"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create Order
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Created Successfully</h2>
              <p className="text-gray-600 mb-6">
                Your new order has been created with ID: <span className="font-medium text-evexia-blue">{orderId}</span>
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={handleBack}>
                  Return to Dashboard
                </Button>
                <Button className="bg-evexia-blue hover:bg-evexia-lightblue">View Order Details</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

