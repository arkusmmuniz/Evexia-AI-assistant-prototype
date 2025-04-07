"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowLeft, CheckCircle } from "lucide-react"
import { patients } from "@/data/dummy-patients"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface OrderCartModalProps {
  isOpen: boolean
  onClose: () => void
  onOrderCreated?: (orderId: string, orderDetails?: any) => void
  onReturnToDashboard?: () => void
  initialPatientId?: string
}

interface TestItem {
  id: string
  name: string
  code: string
  price: number
}

interface Patient {
  id: string
  name: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  address: string
  orders: TestOrder[]
}

// Initial state values
const initialTests: TestItem[] = [
  {
    id: "1",
    name: "Vitamin D, 1,25-Dihydroxy (Calcitriol), LC/MS-MS",
    code: "500600",
    price: 187.34,
  },
]

export default function OrderCartModal({ isOpen, onClose, onOrderCreated, onReturnToDashboard, initialPatientId }: OrderCartModalProps) {
  // Track which view we're showing (cart or review)
  const [currentView, setCurrentView] = useState<"cart" | "review" | "confirmation">("cart")

  // Add a state for the generated order ID
  const [generatedOrderId, setGeneratedOrderId] = useState<string>("")

  // Also add this at the top of the component to track order details:
  const [orderDetails, setOrderDetails] = useState<any>(null)

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Update selected patient when initialPatientId changes
  useEffect(() => {
    if (initialPatientId) {
      const patient = patients.find(p => p.id === initialPatientId)
      if (patient) {
        setSelectedPatient(patient)
      }
    }
  }, [initialPatientId])

  const [selectedTests, setSelectedTests] = useState<TestItem[]>(initialTests)

  // Add these new state variables after the other useState declarations
  const [searchTerm, setSearchTerm] = useState("")
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  // Phlebotomy options
  const [phlebotomyOption, setPhlebotomyOption] = useState("draw_center")
  const [phlebotomyType, setPhlebotomyType] = useState("single")
  const [billedTo, setBilledTo] = useState("clinician")

  // Get available tests
  const availableTests = [
    { id: "4", name: "Complete Blood Count (CBC)", code: "100001", price: 45.99 },
    { id: "5", name: "Comprehensive Metabolic Panel", code: "100002", price: 65.5 },
    { id: "6", name: "Lipid Panel", code: "100003", price: 38.75 },
    { id: "7", name: "Thyroid Function Panel", code: "100004", price: 89.99 },
    { id: "8", name: "Hemoglobin A1C", code: "100005", price: 42.25 },
    { id: "9", name: "Vitamin D, 25-Hydroxy", code: "100006", price: 59.95 },
  ]

  // Calculate total
  const total = selectedTests.reduce((sum, test) => sum + test.price, 0)

  // Function to reset the component state
  const resetComponent = () => {
    setCurrentView("cart")
    setSelectedPatient(patients[0])
    setSelectedTests([...initialTests])
    setPhlebotomyOption("draw_center")
    setPhlebotomyType("single")
    setBilledTo("clinician")
    setGeneratedOrderId("")
    setOrderDetails(null)
    setSearchTerm("")
    setShowPatientDropdown(false)
  }

  // Reset component when modal is closed
  const resetOnClose = useCallback(() => {
    resetComponent()
  }, [])

  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure the modal is fully closed before resetting
      const timer = setTimeout(() => {
        resetOnClose()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, resetOnClose])

  // Handle removing a test
  const removeTest = (id: string) => {
    setSelectedTests(selectedTests.filter((test) => test.id !== id))
  }

  // Update the handleSubmitOrder function to ensure we're not triggering any redirects
  const handleSubmitOrder = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a random order ID
      const newOrderId = `O${Math.floor(5000 + Math.random() * 5000)}`

      // Create order details object
      const orderDetails = {
        id: newOrderId,
        patient: selectedPatient,
        tests: selectedTests,
        phlebotomyOption,
        phlebotomyType,
        billedTo,
        total,
        date: new Date().toISOString(),
        status: "Pending",
      }

      // Store the generated order ID
      setGeneratedOrderId(newOrderId)
      setOrderDetails(orderDetails)

      // Show confirmation view
      setCurrentView("confirmation")

      // Notify parent component - but don't trigger navigation
      if (onOrderCreated) {
        // Only send the order data, don't trigger any navigation
        onOrderCreated(newOrderId, {
          ...orderDetails,
          // Don't include any navigation flags here
        })
      }
    } catch (error) {
      console.error("Error creating order:", error)
    }
  }

  // Add a function to close the modal
  const handleCloseModal = () => {
    onClose()
    if (onReturnToDashboard) {
      onReturnToDashboard()
    }
  }

  // Handle going to review view
  const goToReview = () => {
    setCurrentView("review")
  }

  // Handle going back to cart view
  const goToCart = () => {
    setCurrentView("cart")
  }

  // Handle patient change
  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      setSelectedPatient(patient)
    }
  }

  // Custom handler for dialog open change to prevent auto-closing in confirmation view
  const handleOpenChange = (open: boolean) => {
    // If trying to close and we're in confirmation view, prevent auto-closing
    if (!open && currentView === "confirmation") {
      // Do nothing - require explicit button click
      return
    }

    // Otherwise, proceed with normal close behavior
    if (!open) {
      onClose()
    }
  }

  // Add this function before the renderCartView function
  const filteredPatients = () => {
    // Add clinician to the list
    const allOptions = [
      {
        id: "clinician",
        name: "Dr. Sarah Reynolds (You)",
        dateOfBirth: "",
        gender: "Female",
        email: "sarah.reynolds@example.com",
      },
      ...patients,
    ]

    if (!searchTerm.trim()) return allOptions

    const lowerSearchTerm = searchTerm.toLowerCase()
    return allOptions.filter(
      (patient) =>
        patient.name.toLowerCase().includes(lowerSearchTerm) || patient.id.toLowerCase().includes(lowerSearchTerm),
    )
  }

  // Render the cart view
  const renderCartView = () => (
    <>
      <div className="bg-[#1e3178] text-white p-4">
        <h2 className="text-xl font-semibold">Cart</h2>
      </div>

      <div className="p-4">
        <div className="mb-6">
          {/* Only show patient search if no patient is pre-selected */}
          {!initialPatientId && (
            <div className="patient-search-container relative mb-4">
              <div className="text-sm font-medium mb-1">Patient:</div>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    // Show dropdown when typing
                    if (!showPatientDropdown) {
                      setShowPatientDropdown(true)
                    }
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  placeholder={selectedPatient ? "" : "Search patients..."}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {selectedPatient && searchTerm === "" && (
                  <div 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => {
                      setShowPatientDropdown(true)
                      setSearchTerm("")
                    }}
                  >
                    {selectedPatient.name}
                  </div>
                )}

                {showPatientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredPatients().map((patient) => (
                      <div
                        key={patient.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setSearchTerm("")
                          setShowPatientDropdown(false)
                        }}
                      >
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-gray-500">
                          {patient.id !== "clinician" ? `ID: ${patient.id} • DOB: ${patient.dateOfBirth}` : "Clinician"}
                        </div>
                      </div>
                    ))}
                    {filteredPatients().length === 0 && <div className="px-3 py-2 text-gray-500">No patients found</div>}
                    <div className="border-t mt-2">
                      <button
                        className="w-full text-center py-2 text-sm text-gray-600 hover:bg-gray-100"
                        onClick={() => setShowPatientDropdown(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Patient details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <div className="text-sm font-medium mb-1">Client ID:</div>
              <div className="px-3 py-2 border rounded-md bg-gray-50">{selectedPatient?.id}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Client Name:</div>
              <div className="px-3 py-2 border rounded-md bg-gray-50">{selectedPatient?.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Date of Birth:</div>
              <div className="px-3 py-2 border rounded-md bg-gray-50">{selectedPatient?.dateOfBirth}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Gender:</div>
              <div className="px-3 py-2 border rounded-md bg-gray-50">{selectedPatient?.gender}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Email:</div>
              <div className="px-3 py-2 border rounded-md bg-gray-50">{selectedPatient?.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Phone:</div>
              <div className="px-3 py-2 border rounded-md bg-gray-50">{selectedPatient?.phone}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Address:</div>
              <div className="px-3 py-2 border rounded-md bg-gray-50">{selectedPatient?.address}</div>
            </div>
          </div>
        </div>

        {/* Only show patient selection if no patient is pre-selected */}
        {!initialPatientId && (
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">Select Client:</div>
              <Select value={selectedPatient?.id} onValueChange={handlePatientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center mb-1">
            <div className="text-sm font-medium">Phlebotomy:</div>
            <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="phlebotomy"
                value="mobile"
                checked={phlebotomyOption === "mobile"}
                onChange={() => setPhlebotomyOption("mobile")}
                className="mr-2"
              />
              Mobile Phlebotomy
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="phlebotomy"
                value="in_office"
                checked={phlebotomyOption === "in_office"}
                onChange={() => setPhlebotomyOption("in_office")}
                className="mr-2"
              />
              In-Office Collection
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="phlebotomy"
                value="draw_center"
                checked={phlebotomyOption === "draw_center"}
                onChange={() => setPhlebotomyOption("draw_center")}
                className="mr-2"
              />
              <span className="text-[#1e3178]">Draw Center</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-1">
            <div className="text-sm font-medium">Phlebotomy Option:</div>
            <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="phlebotomyType"
                value="single"
                checked={phlebotomyType === "single"}
                onChange={() => setPhlebotomyType("single")}
                className="mr-2"
              />
              Single
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="phlebotomyType"
                value="hourly"
                checked={phlebotomyType === "hourly"}
                onChange={() => setPhlebotomyType("hourly")}
                className="mr-2"
              />
              Hourly
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-1">
            <div className="text-sm font-medium">Billed to:</div>
            <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="billedTo"
                value="clinician"
                checked={billedTo === "clinician"}
                onChange={() => setBilledTo("clinician")}
                className="mr-2"
              />
              Clinician (You)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="billedTo"
                value="patient"
                checked={billedTo === "patient"}
                onChange={() => setBilledTo("patient")}
                className="mr-2"
              />
              Patient (Direct)
            </label>
          </div>
        </div>

        <div className="border rounded-md p-4 mb-4">
          <h3 className="font-medium mb-3">Order</h3>

          {/* Add test dropdown - now above the order summary */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-medium">Add Tests</h4>
            </div>
            <Select
              value=""
              onValueChange={(value) => {
                if (!value) return

                const testToAdd = availableTests.find((test) => test.id === value)
                if (testToAdd) {
                  setSelectedTests([...selectedTests, testToAdd])
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a test to add..." />
              </SelectTrigger>
              <SelectContent>
                {availableTests.map((test) => (
                  <SelectItem key={test.id} value={test.id}>
                    {test.name} - ${test.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {selectedTests.map((test) => (
              <div key={test.id} className="flex items-start">
                <div className="mr-2 mt-1">
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm">{test.name}</div>
                  <div className="text-xs text-gray-500">({test.code})</div>
                </div>
                <div className="font-medium whitespace-nowrap">${test.price.toFixed(2)}</div>
                <button className="ml-2" onClick={() => removeTest(test.id)}>
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Show total */}
          {selectedTests.length > 0 && (
            <div className="flex justify-end mt-4 pt-2 border-t">
              <div className="font-semibold">Total: ${total.toFixed(2)}</div>
            </div>
          )}
        </div>

        <Button
          className="w-full bg-[#1e3178] hover:bg-[#2a3d8f]"
          onClick={goToReview}
          disabled={selectedTests.length === 0}
        >
          Review Order
        </Button>
      </div>
    </>
  )

  // Render the review view
  const renderReviewView = () => (
    <>
      <div className="bg-[#1e3178] text-white p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 h-8 w-8 text-white hover:bg-[#2a3d8f] hover:text-white"
          onClick={goToCart}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Order Review</h2>
      </div>

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4 flex items-start">
          <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
            <CheckCircle className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800">Please review your order</h3>
            <p className="text-sm text-blue-600">Confirm all details before submitting</p>
          </div>
        </div>

        <div className="border rounded-md p-4 mb-4">
          <h3 className="font-medium mb-3">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Name:</div>
              <div className="font-medium">{selectedPatient?.name}</div>
            </div>
            <div>
              <div className="text-gray-500">ID:</div>
              <div className="font-medium">{selectedPatient?.id}</div>
            </div>
            <div>
              <div className="text-gray-500">Date of Birth:</div>
              <div className="font-medium">{selectedPatient?.dateOfBirth}</div>
            </div>
            <div>
              <div className="text-gray-500">Gender:</div>
              <div className="font-medium">{selectedPatient?.gender}</div>
            </div>
          </div>
        </div>

        <div className="border rounded-md p-4 mb-4">
          <h3 className="font-medium mb-3">Order Details</h3>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="text-gray-500">Phlebotomy:</div>
              <div className="font-medium capitalize">{phlebotomyOption.replace("_", " ")}</div>
            </div>
            <div>
              <div className="text-gray-500">Phlebotomy Option:</div>
              <div className="font-medium capitalize">{phlebotomyType}</div>
            </div>
            <div>
              <div className="text-gray-500">Billed to:</div>
              <div className="font-medium capitalize">{billedTo}</div>
            </div>
            <div>
              <div className="text-gray-500">Physician:</div>
              <div className="font-medium">Dani Miller</div>
            </div>
          </div>

          <Separator className="my-4" />

          <h4 className="font-medium mb-2">Tests</h4>
          <div className="space-y-3">
            {selectedTests.map((test) => (
              <div key={test.id} className="flex justify-between text-sm">
                <div>
                  <div>{test.name}</div>
                  <div className="text-xs text-gray-500">({test.code})</div>
                </div>
                <div className="font-medium">${test.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 pt-3 border-t">
            <div className="font-medium">Total</div>
            <div className="font-bold text-lg">${total.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={goToCart}>
            Back to Cart
          </Button>
          <Button className="flex-1 bg-[#1e3178] hover:bg-[#2a3d8f]" onClick={handleSubmitOrder}>
            Confirm Order
          </Button>
        </div>
      </div>
    </>
  )

  // Add a new renderConfirmationView function after the renderReviewView function
  const renderConfirmationView = () => (
    <>
      <div className="bg-[#1e3178] text-white p-4">
        <h2 className="text-xl font-semibold">Order Confirmed</h2>
      </div>

      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h3 className="text-xl font-bold mb-2">Order Successfully Placed</h3>
        <p className="text-gray-600 mb-4">Your order has been submitted and is being processed.</p>

        <div className="bg-gray-50 border rounded-md p-4 mb-6 mx-auto max-w-xs">
          <div className="text-sm text-gray-500 mb-1">Order ID:</div>
          <div className="text-lg font-bold text-[#1e3178]">{generatedOrderId}</div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p>A confirmation email has been sent to:</p>
          <p className="font-medium">{selectedPatient?.email}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="sm:flex-1" onClick={handleCloseModal}>
            Return to Dashboard
          </Button>
          <Button
            className="sm:flex-1 bg-[#1e3178] hover:bg-[#2a3d8f]"
            onClick={() => {
              // Close the modal first
              onClose()

              // Then navigate to order details view if onOrderCreated is provided
              if (onOrderCreated && generatedOrderId) {
                // Call onOrderCreated again with a special flag to view details
                onOrderCreated(generatedOrderId, {
                  ...orderDetails,
                  viewDetails: true,
                })
              }
            }}
          >
            View Order Details
          </Button>
        </div>
      </div>
    </>
  )

  // Update the return statement to include scrolling
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="overflow-y-auto">
          {currentView === "cart" && renderCartView()}
          {currentView === "review" && renderReviewView()}
          {currentView === "confirmation" && renderConfirmationView()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

