"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, Search, Download, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getPatientById, type TestOrder, patients } from "@/data/dummy-patients"

interface OrderHistoryProps {
  className?: string
  onViewOrder?: (order: TestOrder) => void
  onTrackOrder?: (order: TestOrder) => void
  onBack?: () => void
  selectedPatientId?: string | null
  selectedPatientName?: string | null
  onClearPatientFilter?: () => void
  createdOrders?: TestOrder[]
  onViewLabResults?: (order: TestOrder) => void
  onViewPdfPreview?: (order: TestOrder) => void // Add this line
}

export default function OrderHistory({
  className,
  onViewOrder,
  onTrackOrder,
  onBack,
  selectedPatientId,
  selectedPatientName,
  onClearPatientFilter,
  createdOrders = [],
  onViewLabResults,
  onViewPdfPreview, // Add this line
}: OrderHistoryProps) {
  // State for expanded rows
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  // State for search
  const [searchTerm, setSearchTerm] = useState("")
  const [searchFilter, setSearchFilter] = useState("order")
  const [isFiltering, setIsFiltering] = useState(false)

  // Get all orders from all patients
  const allOrders = useMemo(() => {
    const orders: TestOrder[] = []
    patients.forEach((patient) => {
      patient.orders.forEach((order) => {
        orders.push({ ...order, patientId: patient.id })
      })
    })
    return orders.sort((a, b) => new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime())
  }, [])

  // Filter orders based on search and selected patient
  const filteredOrders = useMemo(() => {
    // Combine all orders with created orders
    let filtered = [...allOrders]

    // Add created orders if they exist
    if (createdOrders && createdOrders.length > 0) {
      filtered = [...createdOrders, ...filtered]
    }

    // First apply patient filter if selected
    if (selectedPatientId) {
      filtered = filtered.filter((order) => order.patientId === selectedPatientId)
    }

    // Then apply search filter if provided
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()

      if (searchFilter === "order") {
        filtered = filtered.filter((order) => order.id.toLowerCase().includes(lowerSearchTerm))
      } else if (searchFilter === "patient") {
        filtered = filtered.filter((order) => {
          const patient = getPatientById(order.patientId)
          return patient?.name.toLowerCase().includes(lowerSearchTerm)
        })
      } else if (searchFilter === "status") {
        filtered = filtered.filter((order) => order.status.toLowerCase().includes(lowerSearchTerm))
      }
    }

    return filtered
  }, [allOrders, searchTerm, searchFilter, selectedPatientId, createdOrders])

  // Toggle expanded row
  const toggleExpandRow = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
    } else {
      setExpandedOrderId(orderId)
    }
  }

  // Format order ID to match the design
  const formatOrderId = (id: string) => {
    // Extract numeric part if it exists
    const match = id.match(/O(\d+)/)
    if (match && match[1]) {
      return `#${match[1]}`
    }
    return id
  }

  // Get current month and year
  const currentMonth = new Date().toLocaleString("default", { month: "long" })
  const currentYear = new Date().getFullYear()

  // Handle clearing patient filter
  const handleClearPatientFilter = () => {
    if (onClearPatientFilter) {
      onClearPatientFilter()
      setIsFiltering(false)
    }
  }

  // Handle track order button click
  const handleTrackOrder = (e: React.MouseEvent, order: TestOrder) => {
    e.stopPropagation() // Prevent row expansion when clicking the button
    if (onTrackOrder) {
      onTrackOrder(order)
    }
  }

  // Handle view lab results button click
  const handleViewLabResults = (e: React.MouseEvent, order: TestOrder) => {
    e.stopPropagation() // Prevent row expansion when clicking the button
    if (onViewLabResults) {
      onViewLabResults(order)
    }
  }

  // Handle view PDF preview button click
  const handleViewPdfPreview = (e: React.MouseEvent, order: TestOrder) => {
    e.stopPropagation() // Prevent row expansion when clicking the button
    if (onViewPdfPreview) {
      onViewPdfPreview(order)
    }
  }

  return (
    <div className={cn("bg-gray-50 h-full overflow-hidden flex flex-col", className)}>
      <div className="p-6 flex flex-col h-full overflow-hidden">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>My Business</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-gray-700">Order History</span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
            <p className="text-sm text-gray-500">
              {filteredOrders.length} Orders for {currentMonth}
              {selectedPatientName && (
                <span className="ml-1">
                  filtered by patient: <span className="font-medium">{selectedPatientName}</span>
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedPatientId && (
              <Button variant="outline" className="flex items-center gap-1" onClick={handleClearPatientFilter}>
                <X className="h-4 w-4" />
                Clear Patient Filter
              </Button>
            )}
            <Button className="bg-white border text-gray-700 hover:bg-gray-50 flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex mb-6 sticky top-0 z-10">
          <Select value={searchFilter} onValueChange={setSearchFilter}>
            <SelectTrigger className="w-[120px] rounded-r-none border-r-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-none border-r-0 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button className="rounded-l-none bg-blue-500 hover:bg-blue-600">Search</Button>
        </div>

        {/* Orders table with fixed header and scrollable body */}
        <div className="bg-white rounded-md border overflow-hidden flex flex-col flex-1">
          {/* Table header - fixed */}
          <div className="grid grid-cols-8 border-b text-sm font-medium text-gray-500 bg-gray-100 sticky top-0 z-10">
            <div className="p-4">Order:</div>
            <div className="p-4">Date Ordered:</div>
            <div className="p-4">Patient:</div>
            <div className="p-4">Billing to:</div>
            <div className="p-4">Order Status:</div>
            <div className="p-4">Cost:</div>
            <div className="p-4">FHR:</div>
            <div className="p-4">Actions:</div>
          </div>

          {/* Table body - scrollable */}
          <div className="flex-1 overflow-y-auto">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const patient = getPatientById(order.patientId)
                const isExpanded = expandedOrderId === order.id

                return (
                  <div key={order.id} className="border-b last:border-b-0">
                    {/* Main row */}
                    <div
                      className="grid grid-cols-8 items-center hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpandRow(order.id)}
                    >
                      <div className="p-4 flex items-center text-blue-500">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 mr-2" />
                        ) : (
                          <ChevronRight className="h-5 w-5 mr-2" />
                        )}
                        {formatOrderId(order.id)}
                      </div>
                      <div className="p-4">{new Date(order.orderedDate).toLocaleDateString()}</div>
                      <div className="p-4">{patient?.name}</div>
                      <div className="p-4">Clinician</div>
                      <div className="p-4">
                        <span
                          className={`status-badge ${
                            order.status === "Completed"
                              ? "status-badge-ready"
                              : order.status === "In Progress"
                                ? "status-badge-progress"
                                : "status-badge-progress"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="p-4">
                        ${((Number.parseInt(order.id.replace(/\D/g, "")) % 900) + 100).toFixed(2)}
                      </div>
                      <div className="p-4"></div>
                      <div className="p-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-700 border-blue-200 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onViewOrder) onViewOrder(order)
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-700 border-blue-200 hover:bg-blue-50"
                          onClick={(e) => handleTrackOrder(e, order)}
                        >
                          Track
                        </Button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="bg-gray-50 p-4 grid grid-cols-4 gap-6 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-500 mb-2">Specimen:</h4>
                          <div className="space-y-1">
                            <p>#123-2567-78</p>
                            <p>#123-2567-79</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-500 mb-2">Lab Name:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>LabCorp</li>
                            <li>Diagnostic Solutions Laboratory</li>
                            <li>KMBO</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-500 mb-2">Collected</h4>
                          <div className="space-y-1">
                            <p>{new Date(order.orderedDate).toLocaleDateString()}</p>
                            <p>{new Date(order.orderedDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-500 mb-2">Order Status:</h4>
                          <div className="space-y-2">
                            {order.status === "Completed" && (
                              <div className="flex items-center">
                                <span className="mr-2">Results Ready</span>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </div>
                            )}
                            {(order.status === "In Progress" || order.status === "Completed") && (
                              <div className="flex items-center">
                                <span className="mr-2">Testing In Progress</span>
                                {order.status === "Completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                              </div>
                            )}
                            {(order.status === "Sample Received" || order.status === "In Progress" || order.status === "Completed") && (
                              <div className="flex items-center">
                                <span className="mr-2">Sample Received</span>
                                {(order.status === "In Progress" || order.status === "Completed") && <CheckCircle className="h-4 w-4 text-green-500" />}
                              </div>
                            )}
                            {(order.status === "Kit Delivered" || order.status === "Sample Received" || order.status === "In Progress" || order.status === "Completed") && (
                              <div className="flex items-center">
                                <span className="mr-2">Kit Delivered</span>
                                {(order.status === "Sample Received" || order.status === "In Progress" || order.status === "Completed") && <CheckCircle className="h-4 w-4 text-green-500" />}
                              </div>
                            )}
                            {(order.status === "Kit Shipped" || order.status === "Kit Delivered" || order.status === "Sample Received" || order.status === "In Progress" || order.status === "Completed") && (
                              <div className="flex items-center">
                                <span className="mr-2">Kit Shipped</span>
                                {(order.status === "Kit Delivered" || order.status === "Sample Received" || order.status === "In Progress" || order.status === "Completed") && <CheckCircle className="h-4 w-4 text-green-500" />}
                              </div>
                            )}
                            <div className="flex items-center">
                              <span className="mr-2">Order Placed</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-500 mb-2">Lab Results</h4>
                          {order.results && (
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600"
                                  onClick={(e) => handleViewPdfPreview(e, order)}
                                >
                                  PDF
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-700 hover:bg-blue-800"
                                  onClick={(e) => handleViewLabResults(e, order)}
                                >
                                  HTML
                                </Button>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600"
                                  onClick={(e) => handleViewPdfPreview(e, order)}
                                >
                                  PDF
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-700 hover:bg-blue-800"
                                  onClick={(e) => handleViewLabResults(e, order)}
                                >
                                  HTML
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-500 mb-2">Tracking Number</h4>
                          <div className="space-y-1">
                            <p className="text-blue-500">UPS 009890389</p>
                            <p className="text-blue-500">UPS 009890390</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                {selectedPatientId
                  ? "No orders found for the selected patient."
                  : "No orders found matching your search criteria."}
              </div>
            )}
          </div>

          {/* Order count indicator - fixed at bottom */}
          <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 border-t sticky bottom-0">
            {selectedPatientId
              ? `Showing ${filteredOrders.length} order${filteredOrders.length !== 1 ? "s" : ""} for selected patient`
              : `Showing ${filteredOrders.length} order${filteredOrders.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>
    </div>
  )
}

