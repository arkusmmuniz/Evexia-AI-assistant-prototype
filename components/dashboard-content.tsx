"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRecentOrders, getPatientById, type TestOrder, patients } from "@/data/dummy-patients"
import OrderDetailsModal from "./order-details-modal"
import PatientFilter from "./patient-filter"

interface DashboardContentProps {
  className?: string
  onViewOrder?: (order: TestOrder) => void
  onViewAllOrders?: () => void
  selectedPatientId?: string | null
  onPatientSelect?: (patientId: string | null) => void
  createdOrders?: TestOrder[] // Add this line
}

export default function DashboardContent({
  className,
  onViewOrder,
  onViewAllOrders,
  selectedPatientId: initialSelectedPatientId,
  onPatientSelect,
  createdOrders = [], // Add this with default empty array
}: DashboardContentProps) {
  // State for order details modal
  const [selectedOrder, setSelectedOrder] = useState<TestOrder | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // State for patient filtering
  const [filteredOrders, setFilteredOrders] = useState<TestOrder[]>([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialSelectedPatientId || null)

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

  // Filter orders when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId) {
      setIsFiltering(true)
      const filtered = allOrders.filter((order) => order.patientId === selectedPatientId)
      setFilteredOrders(filtered)
    } else {
      setIsFiltering(false)
      setFilteredOrders([])
    }
  }, [selectedPatientId, allOrders])

  // Get orders to display - either filtered or recent, including created orders
  const ordersToDisplay = useMemo(() => {
    if (isFiltering) {
      return filteredOrders
    } else {
      // Combine recent orders with created orders, limited to 5 total
      const recentDummyOrders = getRecentOrders(createdOrders.length > 0 ? 5 - createdOrders.length : 5)
      return [...createdOrders, ...recentDummyOrders].slice(0, 5)
    }
  }, [isFiltering, filteredOrders, createdOrders])

  // Function to open the order details modal
  const openOrderDetails = (order: TestOrder) => {
    if (onViewOrder) {
      onViewOrder(order)
    } else {
      setSelectedOrder(order)
      setIsModalOpen(true)
    }
  }

  // Function to close the order details modal
  const closeOrderDetails = () => {
    setIsModalOpen(false)
  }

  // Handle patient selection for filtering
  const handlePatientSelect = useCallback(
    (patientId: string | null) => {
      setSelectedPatientId(patientId)
      onPatientSelect?.(patientId) // Also call the parent's handler if it exists
    },
    [onPatientSelect, setSelectedPatientId],
  )

  return (
    <div className={cn("overflow-y-auto", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">Partner ID: 4449</h2>
            <span className="ml-2 text-gray-600">Danbury, CA</span>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border rounded-md overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-2 text-gray-600">Orders: July</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">15</div>
                <div className="flex items-center text-evexia-green">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>4.96%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border rounded-md overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-2 text-gray-600">EvexiaDirect: July Summary</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">$1,500.00</div>
                <div className="flex items-center text-evexia-green">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>24.96%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border rounded-md overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-2 text-gray-600">Client Bill: July Summary</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">$500.00</div>
                <div className="flex items-center text-evexia-red">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span>3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Orders with Patient Filter */}
        <div className="border rounded-md overflow-hidden mb-6">
          <div className="bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">{isFiltering ? "Filtered Orders" : "Latest Orders"}</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-evexia-blue hover:bg-evexia-lightblue"
                  onClick={onViewAllOrders}
                >
                  See All
                </Button>
              </div>
            </div>

            {/* Patient Filter */}
            <PatientFilter onPatientSelect={handlePatientSelect} selectedPatientId={selectedPatientId} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Order</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Order Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Last Update</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Patient</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Test Type</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ordersToDisplay.length > 0 ? (
                  ordersToDisplay.map((order) => {
                    const patient = getPatientById(order.patientId)
                    return (
                      <tr key={order.id} className="bg-white">
                        <td className="px-4 py-3 text-sm">{order.id}</td>
                        <td className="px-4 py-3 text-sm">
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
                        </td>
                        <td className="px-4 py-3 text-sm">{order.lastUpdated}</td>
                        <td className="px-4 py-3 text-sm font-medium">{patient?.name || "Unknown"}</td>
                        <td className="px-4 py-3 text-sm">{order.testName}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-evexia-blue"
                            onClick={() => openOrderDetails(order)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Order
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {isFiltering ? "No orders found for the selected patient." : "No recent orders found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Order count indicator */}
          <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 border-t">
            {isFiltering
              ? `Showing ${filteredOrders.length} order${filteredOrders.length !== 1 ? "s" : ""} for selected patient`
              : `Showing ${ordersToDisplay.length} most recent order${ordersToDisplay.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {/* Order Details Modal - only used if onViewOrder is not provided */}
      {!onViewOrder && <OrderDetailsModal order={selectedOrder} isOpen={isModalOpen} onClose={closeOrderDetails} />}
    </div>
  )
}

