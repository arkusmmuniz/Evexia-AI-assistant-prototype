"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, FileText, Download, AlertCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type TestOrder, getPatientById } from "@/data/dummy-patients"
import { cn } from "@/lib/utils"

interface OrderViewProps {
  order: TestOrder
  onBack: () => void
  onTrackOrder?: (order: TestOrder) => void
  onViewLabResults?: (order: TestOrder) => void
  onViewPdfPreview?: (order: TestOrder) => void
}

export default function OrderView({ order, onBack, onTrackOrder, onViewLabResults, onViewPdfPreview }: OrderViewProps) {
  const patient = getPatientById(order.patientId)
  const [isVisible, setIsVisible] = useState(false)

  // Animation effect when component mounts
  useEffect(() => {
    // Small delay to allow for transition
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  // Function to determine badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "In Progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Kit Shipped":
      case "Kit Delivered":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "Sample Received":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Pending":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Handle back button with animation
  const handleBack = () => {
    setIsVisible(false)
    setTimeout(() => {
      onBack()
    }, 300) // Match transition duration
  }

  // Handle track order button
  const handleTrackOrder = () => {
    if (onTrackOrder) {
      onTrackOrder(order)
    }
  }

  // Handle view lab results button
  const handleViewLabResults = () => {
    if (onViewLabResults) {
      onViewLabResults(order)
    }
  }

  // Handle view PDF preview
  const handleViewPdfPreview = () => {
    if (onViewPdfPreview) {
      onViewPdfPreview(order)
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
          <h1 className="text-2xl font-semibold">Order Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1 bg-evexia-blue hover:bg-evexia-lightblue"
            onClick={handleTrackOrder}
          >
            <Truck className="h-4 w-4" />
            Track Order
          </Button>
        </div>
      </div>

      <Card className="mb-6 shadow-sm transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Order ID</div>
              <div className="font-medium">{order.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Patient</div>
              <div className="font-medium">{patient?.name || "Unknown"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Test Type</div>
              <div className="font-medium">{order.testName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <Badge className={getStatusBadgeClass(order.status)}>{order.status}</Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Date</div>
              <div className="font-medium">{order.orderedDate}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Doctor</div>
              <div className="font-medium">{order.orderedBy}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Last Updated</div>
              <div className="font-medium">{order.lastUpdated}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.results && (
        <Card className="mb-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Test Results</h2>
              {order.status === "Completed" && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={handleViewLabResults}>
                    HTML
                  </Button>
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800" onClick={handleViewPdfPreview}>
                    PDF
                  </Button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Test</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Result</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Units</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Reference Range</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Object.entries(order.results.resultDetails).map(([key, detail]) => (
                    <tr key={key} className="bg-white">
                      <td className="px-4 py-3 text-sm font-medium capitalize">{key}</td>
                      <td className="px-4 py-3 text-sm text-right">{detail.value}</td>
                      <td className="px-4 py-3 text-sm text-right">{detail.unit}</td>
                      <td className="px-4 py-3 text-sm text-right">{detail.reference}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        {detail.flag && (
                          <Badge
                            className={detail.flag === "H" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}
                          >
                            {detail.flag}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Result Summary</h3>
                <p className="mt-1">{order.results.resultSummary}</p>
              </div>

              {order.results.interpretation && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Interpretation</h3>
                  <p className="mt-1">{order.results.interpretation}</p>
                </div>
              )}

              {order.results.recommendedFollowUp && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Recommended Follow-Up</h3>
                  <p className="mt-1">{order.results.recommendedFollowUp}</p>
                </div>
              )}

              {order.results.flagged && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-md border border-red-100 mt-4">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Flagged Results</h4>
                    <p className="text-sm text-red-700">
                      This test has results outside the normal range that require attention.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {order.notes && (
        <Card className="shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Notes</h2>
            <p>{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

