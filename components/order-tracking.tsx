"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  ClipboardCheck,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Clock,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type TestOrder, getPatientById } from "@/data/dummy-patients"

interface OrderTrackingProps {
  order: TestOrder | null
  onBack: () => void
  error?: string
}

export default function OrderTracking({ order, onBack, error }: OrderTrackingProps) {
  const patient = order ? getPatientById(order.patientId) : null
  const [isVisible, setIsVisible] = useState(false)

  // Animation effect when component mounts
  useEffect(() => {
    // Small delay to allow for transition
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  // Handle back button with animation
  const handleBack = () => {
    setIsVisible(false)
    setTimeout(() => {
      onBack()
    }, 300) // Match transition duration
  }

  // Generate tracking steps based on order status
  const getTrackingSteps = () => {
    if (!order) return []

    const steps = [
      {
        id: "ordered",
        label: "Order Placed",
        date: order.orderedDate,
        icon: ClipboardCheck,
        completed: true,
        description: `Order placed by ${order.orderedBy}`,
      },
      {
        id: "kit_shipped",
        label: "Kit Shipped",
        date:
          order.status === "Kit Shipped" ||
          order.status === "Kit Delivered" ||
          order.status === "Sample Received" ||
          order.status === "In Progress" ||
          order.status === "Completed"
            ? new Date(new Date(order.orderedDate).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
            : null,
        icon: Package,
        completed: ["Kit Shipped", "Kit Delivered", "Sample Received", "In Progress", "Completed"].includes(
          order.status,
        ),
        description: "Test kit has been shipped to the patient",
      },
      {
        id: "kit_delivered",
        label: "Kit Delivered",
        date:
          order.status === "Kit Delivered" ||
          order.status === "Sample Received" ||
          order.status === "In Progress" ||
          order.status === "Completed"
            ? new Date(new Date(order.orderedDate).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
            : null,
        icon: Truck,
        completed: ["Kit Delivered", "Sample Received", "In Progress", "Completed"].includes(order.status),
        description: "Test kit has been delivered to the patient",
      },
      {
        id: "sample_received",
        label: "Sample Received",
        date:
          order.status === "Sample Received" || order.status === "In Progress" || order.status === "Completed"
            ? new Date(new Date(order.orderedDate).getTime() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString()
            : null,
        icon: Package,
        completed: ["Sample Received", "In Progress", "Completed"].includes(order.status),
        description: "Sample has been received by the lab",
      },
      {
        id: "in_progress",
        label: "Testing In Progress",
        date:
          order.status === "In Progress" || order.status === "Completed"
            ? new Date(new Date(order.orderedDate).getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString()
            : null,
        icon: AlertCircle,
        completed: ["In Progress", "Completed"].includes(order.status),
        description: "Lab is processing the sample",
      },
      {
        id: "completed",
        label: "Results Ready",
        date: order.status === "Completed" ? order.lastUpdated : null,
        icon: CheckCircle,
        completed: order.status === "Completed",
        description: "Test results are ready to view",
      },
    ]

    return steps
  }

  const trackingSteps = getTrackingSteps()
  const currentStepIndex = trackingSteps.findIndex((step) => !step.completed)
  const activeStepIndex = currentStepIndex === -1 ? trackingSteps.length - 1 : currentStepIndex - 1

  // Format date for display - match the format used in order history
  const formatDate = (dateString: string) => {
    try {
      // Simply return the date string as is to match order history format
      return dateString
    } catch (e) {
      return dateString
    }
  }

  return (
    <div
      className={cn(
        "p-6 max-w-5xl mx-auto transition-all duration-300 ease-in-out overflow-y-auto",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Order Tracking</h1>
        </div>
      </div>

      {error ? (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-800 text-lg">Order Not Found</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
                  onClick={handleBack}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : order ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Order Details Card */}
            <Card className="shadow-sm transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Order ID</div>
                      <div className="font-medium">{order.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Status</div>
                      <div className="font-medium">
                        <span
                          className={`status-badge ${
                            order.status === "Completed"
                              ? "status-badge-ready"
                              : order.status === "In Progress"
                                ? "status-badge-progress"
                                : order.status === "Kit Shipped"
                                  ? "status-badge-shipped"
                                  : order.status === "Kit Delivered"
                                    ? "status-badge-delivered"
                                    : "status-badge-progress"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Test Type</div>
                    <div className="font-medium">{order.testName}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date Ordered
                      </div>
                      <div className="font-medium">{order.orderedDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last Updated
                      </div>
                      <div className="font-medium">{order.lastUpdated}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Ordered By
                    </div>
                    <div className="font-medium">{order.orderedBy}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Billing to</div>
                    <div className="font-medium">Clinician</div>
                  </div>

                  {order.notes && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Notes
                      </div>
                      <div className="text-sm bg-gray-50 p-2 rounded border border-gray-100">{order.notes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Details Card */}
            <Card className="shadow-sm transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {patient ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Name</div>
                      <div className="font-medium">{patient.name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Patient ID</div>
                        <div className="font-medium">{patient.id}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Gender</div>
                        <div className="font-medium">{patient.gender}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
                      <div className="font-medium">{patient.dateOfBirth}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Contact</div>
                      <div className="font-medium">{patient.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Address</div>
                      <div className="font-medium">{patient.address}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Patient information not available</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-500" />
                Tracking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative">
                {/* Vertical line connecting steps */}
                <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

                {/* Tracking steps */}
                <div className="space-y-8">
                  {trackingSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div
                        className={cn(
                          "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                          step.completed
                            ? "bg-green-100 border-green-200"
                            : index === currentStepIndex
                              ? "bg-blue-100 border-blue-200"
                              : "bg-gray-100 border-gray-200",
                        )}
                      >
                        <step.icon
                          className={cn(
                            "h-5 w-5",
                            step.completed
                              ? "text-green-600"
                              : index === currentStepIndex
                                ? "text-blue-600"
                                : "text-gray-400",
                          )}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3
                            className={cn(
                              "font-medium",
                              step.completed
                                ? "text-green-700"
                                : index === currentStepIndex
                                  ? "text-blue-700"
                                  : "text-gray-700",
                            )}
                          >
                            {step.label}
                          </h3>
                          {index === activeStepIndex && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
                        {step.date && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(step.date).toLocaleDateString()} {index === activeStepIndex && "• Today"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.status === "Kit Shipped" && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Truck className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Tracking Information</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        Your kit is on the way! Tracking number:{" "}
                        <span className="font-medium">UPS 1Z999AA10123456784</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        Track Package
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-amber-800 text-lg">No Order Selected</h3>
                <p className="text-amber-700 mt-1">Please select an order to view tracking information.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-amber-200 text-amber-700 hover:bg-amber-100"
                  onClick={handleBack}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

