"use client"

import { useState, useEffect } from "react"
import DashboardHeader from "@/components/dashboard-header"
import DashboardTabs from "@/components/dashboard-tabs"
import DashboardContent from "@/components/dashboard-content"
import ChatAssistant from "@/components/chat-assistant"
import OrderView from "@/components/order-view"
import OrderTracking from "@/components/order-tracking"
import OrderCartModal from "@/components/order-cart-modal"
import LabResultsView from "@/components/lab-results-view"
import PdfPreviewView from "@/components/pdf-preview-view"
import type { TestOrder } from "@/data/dummy-patients"
import { getPatientsByName } from "@/data/dummy-patients"
import { getOrderById } from "@/data/dummy-orders"
import { cn } from "@/lib/utils"
import ApiDiagnostics from "@/components/api-diagnostics"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import OrderHistory from "@/components/order-history"
import NewOrderPanel from "@/components/new-order-panel"

export default function Dashboard() {
  const [chatOpen, setChatOpen] = useState(true)
  const [activeView, setActiveView] = useState<
    "dashboard" | "order" | "order-history" | "order-tracking" | "lab-results"
  >("dashboard")
  const [selectedOrder, setSelectedOrder] = useState<TestOrder | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  // Add state for PDF preview
  const [showPdfPreview, setShowPdfPreview] = useState(false)

  // Add state for patient filtering
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<TestOrder | null>(null)

  // Add activeTab state
  const [activeTab, setActiveTab] = useState("dashboard")

  // Add a state for storing created orders
  const [createdOrders, setCreatedOrders] = useState<any[]>([])

  // Add a state to store pending orders (created but not yet viewed)
  const [pendingOrder, setPendingOrder] = useState<TestOrder | null>(null)

  // Add a function to handle tab navigation
  const handleTabNavigation = (tab: string) => {
    if (tab === "dashboard") {
      setActiveView("dashboard")
      setActiveTab("dashboard")
    } else if (tab === "order-history") {
      setActiveView("order-history")
      setActiveTab("order-history")
    }
    // Handle other tabs as needed
  }

  // Function to view order details with transition
  const viewOrder = (order: TestOrder) => {
    if (
      activeView === "dashboard" ||
      activeView === "order-history" ||
      activeView === "order-tracking" ||
      activeView === "lab-results"
    ) {
      setIsTransitioning(true)
      setSelectedOrder(order)
      setOrderError(null)

      // Small delay for transition effect
      setTimeout(() => {
        setActiveView("order")
        setIsTransitioning(false)
      }, 300)
    } else {
      // If already in order view, just update the order
      setSelectedOrder(order)
      setOrderError(null)
    }
  }

  // Function to view order tracking with transition
  const viewOrderTracking = (order: TestOrder) => {
    if (!order) return

    // Get all orders for this patient to ensure we have the most recent one
    const allOrders = getAllOrdersForPatient(order.patientId)
    
    // Find the most recent order for this patient
    const mostRecentOrder = allOrders.length > 0 ? allOrders[0] : order
    
    setIsTransitioning(true)
    setSelectedOrder(mostRecentOrder)
    setOrderError(null)

    // Small delay for transition effect
    setTimeout(() => {
      setActiveView("order-tracking")
      setIsTransitioning(false)
    }, 300)
  }

  // Function to handle order creation
  const handleOrderCreated = (orderId: string, orderDetails: any) => {
    console.log("Order created:", orderId, orderDetails)
    
    // Add the order to our created orders list with all necessary details
    const newOrder = {
      ...orderDetails,
      id: orderId,
      date: new Date().toISOString(),
    }
    
    setCreatedOrders((prev) => [newOrder, ...prev])

    // Store the order in pendingOrder state
    const newTestOrder: TestOrder = {
      id: orderId,
      patientId: orderDetails.patient.id,
      testName: orderDetails.tests.map((t: any) => t.name).join(", "),
      testType: "Blood",
      orderedBy: "Dr. Sarah Reynolds",
      orderedDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      lastUpdated: new Date().toISOString().split("T")[0],
      notes: `Order created with ${orderDetails.tests.length} tests. Billed to ${orderDetails.billedTo}. Phlebotomy: ${orderDetails.phlebotomyOption}.`,
    }

    setPendingOrder(newTestOrder)

    if (orderDetails.viewDetails === true) {
      setSelectedOrder(newTestOrder)
      setOrderError(null)

      setIsTransitioning(true)
      setTimeout(() => {
        setActiveView("order")
        setIsTransitioning(false)
      }, 300)

      setPendingOrder(null)
    }
  }

  // Helper function to convert created order to TestOrder format
  const convertCreatedOrderToTestOrder = (createdOrder: any): TestOrder => {
    return {
      id: createdOrder.id,
      patientId: createdOrder.patient.id,
      testName: createdOrder.tests.map((t: any) => t.name).join(", "),
      testType: "Blood",
      orderedBy: "Dr. Sarah Reynolds",
      orderedDate: new Date(createdOrder.date).toISOString().split("T")[0],
      status: "Pending",
      lastUpdated: new Date(createdOrder.date).toISOString().split("T")[0],
      notes: `Order created with ${createdOrder.tests.length} tests. Billed to ${createdOrder.billedTo}. Phlebotomy: ${createdOrder.phlebotomyOption}.`,
    }
  }

  // Function to get all orders for a patient (both created and existing)
  const getAllOrdersForPatient = (patientId: string): TestOrder[] => {
    const existingOrders = getPatientsByName("").find(p => p.id === patientId)?.orders || []
    const patientCreatedOrders = createdOrders
      .filter(order => order.patient.id === patientId)
      .map(convertCreatedOrderToTestOrder)
    
    // Sort all orders by date, most recent first
    return [...patientCreatedOrders, ...existingOrders].sort((a, b) => {
      const dateA = new Date(a.orderedDate).getTime()
      const dateB = new Date(b.orderedDate).getTime()
      return dateB - dateA
    })
  }

  // Function to view order tracking by ID
  const viewOrderTrackingById = (orderId: string, patientName?: string) => {
    if (!orderId) return
    
    setIsTransitioning(true)

    // First check in created orders
    const createdOrder = createdOrders.find(order => order.id === orderId)
    
    if (createdOrder) {
      const order = convertCreatedOrderToTestOrder(createdOrder)
      
      // Get all orders for this patient to ensure we have the most recent one
      const allOrders = getAllOrdersForPatient(order.patientId)
      const mostRecentOrder = allOrders.length > 0 ? allOrders[0] : order
      
      setSelectedOrder(mostRecentOrder)
      setOrderError(null)

      setTimeout(() => {
        setActiveView("order-tracking")
        setIsTransitioning(false)
      }, 300)
      return
    }

    // If not found in created orders, try to find in existing orders
    const existingOrder = getOrderById(orderId)

    if (existingOrder) {
      // Get all orders for this patient to ensure we have the most recent one
      const allOrders = getAllOrdersForPatient(existingOrder.patientId)
      const mostRecentOrder = allOrders.length > 0 ? allOrders[0] : existingOrder
      
      setSelectedOrder(mostRecentOrder)
      setOrderError(null)

      setTimeout(() => {
        setActiveView("order-tracking")
        setIsTransitioning(false)
      }, 300)
    } else {
      setSelectedOrder(null)
      setOrderError(
        patientName
          ? `We couldn't find order ${orderId} for patient ${patientName}. Please verify the order ID and try again.`
          : `We couldn't find order ${orderId}. Please verify the order ID and try again.`
      )

      setTimeout(() => {
        setActiveView("order-tracking")
        setIsTransitioning(false)
      }, 300)
    }
  }

  // Function to view lab results with transition
  const viewLabResults = (order: TestOrder) => {
    // First set the selected order
    setSelectedOrder(order)
    setOrderError(null)

    // Then handle the transition
    if (activeView !== "lab-results") {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveView("lab-results")
        setIsTransitioning(false)
      }, 300)
    } else {
      // If already in lab results view, briefly set transitioning to force re-render
      setIsTransitioning(true)
      // Use a shorter timeout to make it less noticeable
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }
  }

  // Function to show PDF preview
  const viewPdfPreview = (order: TestOrder) => {
    setSelectedOrder(order)
    setOrderError(null)
    setShowPdfPreview(true)
  }

  // Function to show the new order modal
  const showNewOrderPanel = (patientId?: string) => {
    console.log("Opening new order modal", patientId ? `for patient ${patientId}` : "")
    setShowOrderModal(true)
    if (patientId) {
      // Find the patient by ID directly from the patients array
      const patient = getPatientsByName(selectedPatientName || "").find(p => p.id === patientId)
      if (patient) {
        console.log("Found patient:", patient)
        setSelectedPatientId(patientId)
        setSelectedPatientName(patient.name)
      }
    }
  }

  // Add a function to navigate to order history
  const goToOrderHistory = () => {
    setActiveView("order-history")
    setActiveTab("order-history")
  }

  // Add a function to go back to dashboard from order history
  const goToDashboard = () => {
    setActiveView("dashboard")
    setActiveTab("dashboard")
    setOrderError(null)

    // Clear selected order after transition
    setTimeout(() => {
      setSelectedOrder(null)
    }, 300)
  }

  // Function to filter orders by patient
  const filterByPatient = (patientName: string) => {
    console.log("Filtering by patient name:", patientName)
    // Find the patient by name
    const patients = getPatientsByName(patientName)

    if (patients.length > 0) {
      const patient = patients[0] // Use the first matching patient
      console.log("Found patient:", patient)

      // Set patient filter state
      setSelectedPatientId(patient.id)
      setSelectedPatientName(patient.name)

      // Always navigate to order history with a smooth transition
      setIsTransitioning(true)

      // Short delay for transition effect
      setTimeout(() => {
        setActiveView("order-history")
        setActiveTab("order-history")
        setIsTransitioning(false)
      }, 300)
    } else {
      console.log("No patient found with name:", patientName)
    }
  }

  // Function to clear patient filter
  const clearPatientFilter = () => {
    setSelectedPatientId(null)
    setSelectedPatientName(null)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key to go back to dashboard
      if (
        e.key === "Escape" &&
        (activeView === "order" || activeView === "order-tracking" || activeView === "lab-results")
      ) {
        goToDashboard()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeView])

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <>
        <DashboardHeader 
          onShowDiagnostics={() => setShowDiagnostics(!showDiagnostics)} 
          onCreateNewOrder={showNewOrderPanel}
        />
        {showDiagnostics && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-4 rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">API Diagnostics</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowDiagnostics(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ApiDiagnostics />
            </div>
          </div>
        )}
      </>
      <DashboardTabs activeTab={activeTab} onNavigate={handleTabNavigation} />
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              activeView === "dashboard" && !isTransitioning
                ? "opacity-100 translate-y-0 z-10"
                : "opacity-0 translate-y-4 z-0",
            )}
          >
            <DashboardContent
              className="h-full overflow-auto w-full"
              onViewOrder={viewOrder}
              onViewAllOrders={goToOrderHistory}
              selectedPatientId={selectedPatientId}
              onPatientSelect={setSelectedPatientId}
              createdOrders={createdOrders.map(convertCreatedOrderToTestOrder)}
            />
          </div>

          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              activeView === "order" && !isTransitioning
                ? "opacity-100 translate-y-0 z-10"
                : "opacity-0 translate-y-4 z-0",
            )}
          >
            {selectedOrder && (
              <OrderView
                order={selectedOrder}
                onBack={goToDashboard}
                onTrackOrder={viewOrderTracking}
                onViewLabResults={viewLabResults}
                onViewPdfPreview={viewPdfPreview}
              />
            )}
          </div>

          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              activeView === "order-tracking" && !isTransitioning
                ? "opacity-100 translate-y-0 z-10"
                : "opacity-0 translate-y-4 z-0",
            )}
          >
            <OrderTracking
              order={selectedOrder}
              onBack={() => viewOrder(selectedOrder!)}
              error={orderError || undefined}
            />
          </div>

          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              activeView === "lab-results" && !isTransitioning
                ? "opacity-100 translate-y-0 z-10"
                : "opacity-0 translate-y-4 z-0",
            )}
          >
            {selectedOrder && <LabResultsView order={selectedOrder} onBack={() => viewOrder(selectedOrder)} />}
          </div>

          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              activeView === "order-history" && !isTransitioning
                ? "opacity-100 translate-y-0 z-10"
                : "opacity-0 translate-y-4 z-0",
            )}
          >
            <OrderHistory
              onViewOrder={viewOrder}
              onTrackOrder={viewOrderTracking}
              selectedPatientId={selectedPatientId}
              selectedPatientName={selectedPatientName}
              onClearPatientFilter={clearPatientFilter}
              onViewLabResults={viewLabResults}
              onViewPdfPreview={viewPdfPreview}
              createdOrders={createdOrders.map(convertCreatedOrderToTestOrder)}
            />
          </div>
        </div>

        {/* Order Cart Modal */}
        <OrderCartModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false)
            // Limpiar el paciente seleccionado al cerrar el modal
            setSelectedPatientId(null)
            setSelectedPatientName(null)
          }}
          onOrderCreated={handleOrderCreated}
          onReturnToDashboard={goToDashboard}
          initialPatientId={selectedPatientId || undefined}
        />

        {/* PDF Preview Modal */}
        {selectedOrder && (
          <PdfPreviewView order={selectedOrder} isOpen={showPdfPreview} onClose={() => setShowPdfPreview(false)} />
        )}

        {/* Chat assistant is now rendered last, ensuring it's on top of the stacking context */}
        <ChatAssistant
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          className={chatOpen ? "w-1/4 overflow-hidden" : "w-0"}
          onViewOrder={viewOrder}
          onFilterByPatient={filterByPatient}
          onCreateNewOrder={showNewOrderPanel}
          onTrackOrderById={viewOrderTrackingById}
        />
      </div>
    </div>
  )
}

