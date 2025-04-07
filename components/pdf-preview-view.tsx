"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { type TestOrder, getPatientById } from "@/data/dummy-patients"

interface PdfPreviewViewProps {
  order: TestOrder
  isOpen: boolean
  onClose: () => void
}

export default function PdfPreviewView({ order, isOpen, onClose }: PdfPreviewViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 2
  const patient = getPatientById(order.patientId)

  // Generate specimen ID based on order ID
  const specimenId = `123-${order.id.replace(/\D/g, "")}-79`
  const specimenIdAlt = `123-${order.id.replace(/\D/g, "")}-78`

  // Generate collection and received dates
  const collectionDate = new Date(order.orderedDate)
  const receivedDate = new Date(collectionDate)
  receivedDate.setDate(collectionDate.getDate() + 5)

  // Format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  }

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Handle previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Reset to first page when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-[90vh] max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Specimen #{specimenId}</h2>
          </div>

          {/* Content - Add better overflow handling */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white rounded-lg border p-6 mx-auto max-w-2xl">
              <h1 className="text-xl font-bold mb-4">Insight Report</h1>

              {/* Patient Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
                <div>
                  <div className="font-semibold">Patient:</div>
                  <div>{patient?.name || "Omar Culhane"}</div>
                </div>
                <div>
                  <div className="font-semibold">Email:</div>
                  <div className="break-words">{patient?.email || "o.culhane@mailinator.com"}</div>
                </div>
                <div>
                  <div className="font-semibold">Date of Birth:</div>
                  <div>{patient?.dateOfBirth || "04/03/1999"}</div>
                </div>
                <div>
                  <div className="font-semibold">Phone:</div>
                  <div>{patient?.phone || "619-555-5555"}</div>
                </div>
                <div>
                  <div className="font-semibold">Gender:</div>
                  <div>{patient?.gender || "Male"}</div>
                </div>
                <div>
                  <div className="font-semibold">Physician Name:</div>
                  <div>{order.orderedBy || "Testing Clinic"}</div>
                </div>
              </div>

              {/* Specimen Information */}
              <h2 className="text-lg font-semibold mb-2">Specimen Information</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
                <div>
                  <div className="font-semibold">Specimen:</div>
                  <div>{specimenIdAlt}</div>
                </div>
                <div></div>
                <div>
                  <div className="font-semibold">Collected:</div>
                  <div>{formatDate(collectionDate)}</div>
                </div>
                <div>
                  <div className="font-semibold">Received:</div>
                  <div>{formatDate(receivedDate)}</div>
                </div>
              </div>

              {/* Analytes Results */}
              <h2 className="text-lg font-semibold mb-4">Analytes Results</h2>

              {currentPage === 1 ? (
                <>
                  {/* Bilirubin */}
                  <div className="mb-6 border rounded-lg p-4">
                    <div className="font-semibold mb-2">Bilirubin, Total</div>
                    <div className="flex flex-col md:flex-row md:items-center mb-2">
                      <div className="w-20 h-20 flex items-center justify-center border rounded-md mb-3 md:mb-0 md:mr-4 shrink-0">
                        <div className="text-2xl font-bold text-green-600">0.6</div>
                        <div className="text-sm ml-1">mg/dL</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-6 flex rounded-md overflow-hidden">
                          <div className="w-1/5 bg-red-400 text-xs text-center py-1 truncate">Below Standard</div>
                          <div className="w-1/5 bg-yellow-300 text-xs text-center py-1 truncate">Below Optimal</div>
                          <div className="w-1/5 bg-green-400 text-xs text-center py-1 relative truncate">
                            Optimal
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-black"></div>
                          </div>
                          <div className="w-1/5 bg-yellow-300 text-xs text-center py-1 truncate">Above Optimal</div>
                          <div className="w-1/5 bg-red-400 text-xs text-center py-1 truncate">Above Standard</div>
                        </div>
                        <div className="flex text-xs mt-1">
                          <div className="w-1/5 text-center truncate">0.00-0.00</div>
                          <div className="w-1/5 text-center truncate">0.00-0.10</div>
                          <div className="w-1/5 text-center truncate">0.10-0.80</div>
                          <div className="w-1/5 text-center truncate">0.80-1.20</div>
                          <div className="w-1/5 text-center truncate">1.20-1.80</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hemoglobin */}
                  <div className="mb-6 border rounded-lg p-4">
                    <div className="font-semibold mb-2">Hemoglobin</div>
                    <div className="flex flex-col md:flex-row md:items-center mb-2">
                      <div className="w-20 h-20 flex items-center justify-center border rounded-md mb-3 md:mb-0 md:mr-4 shrink-0">
                        <div className="text-2xl font-bold text-green-600">15.6</div>
                        <div className="text-sm ml-1">g/dL</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-6 flex rounded-md overflow-hidden">
                          <div className="w-1/5 bg-red-400 text-xs text-center py-1 truncate">Below Standard</div>
                          <div className="w-1/5 bg-yellow-300 text-xs text-center py-1 truncate">Below Optimal</div>
                          <div className="w-1/5 bg-green-400 text-xs text-center py-1 truncate">Optimal</div>
                          <div className="w-1/5 bg-yellow-300 text-xs text-center py-1 relative truncate">
                            Above Optimal
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-black"></div>
                          </div>
                          <div className="w-1/5 bg-red-400 text-xs text-center py-1 truncate">Above Standard</div>
                        </div>
                        <div className="flex text-xs mt-1">
                          <div className="w-1/5 text-center truncate">0.00-13.20</div>
                          <div className="w-1/5 text-center truncate">13.20-14.00</div>
                          <div className="w-1/5 text-center truncate">14.00-15.00</div>
                          <div className="w-1/5 text-center truncate">15.00-17.10</div>
                          <div className="w-1/5 text-center truncate">17.10-18.00</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Page 2 content - additional analytes */}
                  <div className="mb-6 border rounded-lg p-4">
                    <div className="font-semibold mb-2">Sodium</div>
                    <div className="flex flex-col md:flex-row md:items-center mb-2">
                      <div className="w-20 h-20 flex items-center justify-center border rounded-md mb-3 md:mb-0 md:mr-4 shrink-0">
                        <div className="text-2xl font-bold text-green-600">140</div>
                        <div className="text-sm ml-1">mEq/L</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-6 flex rounded-md overflow-hidden">
                          <div className="w-1/5 bg-red-400 text-xs text-center py-1 truncate">Below Standard</div>
                          <div className="w-1/5 bg-yellow-300 text-xs text-center py-1 truncate">Below Optimal</div>
                          <div className="w-1/5 bg-green-400 text-xs text-center py-1 relative truncate">
                            Optimal
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-black"></div>
                          </div>
                          <div className="w-1/5 bg-yellow-300 text-xs text-center py-1 truncate">Above Optimal</div>
                          <div className="w-1/5 bg-red-400 text-xs text-center py-1 truncate">Above Standard</div>
                        </div>
                        <div className="flex text-xs mt-1">
                          <div className="w-1/5 text-center truncate">120-130</div>
                          <div className="w-1/5 text-center truncate">130-135</div>
                          <div className="w-1/5 text-center truncate">135-145</div>
                          <div className="w-1/5 text-center truncate">145-150</div>
                          <div className="w-1/5 text-center truncate">150-160</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 border rounded-lg p-4">
                    <div className="font-semibold mb-2">Potassium</div>
                    <div className="flex flex-col md:flex-row md:items-center mb-2">
                      <div className="w-20 h-20 flex items-center justify-center border rounded-md mb-3 md:mb-0 md:mr-4 shrink-0">
                        <div className="text-2xl font-bold text-green-600">4.2</div>
                        <div className="text-sm ml-1">mEq/L</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-6 flex rounded-md overflow-hidden">
                          <div className="w-1/5 bg-red-400 text-xs text-center py-1 truncate">Below Standard</div>
                          <div className="w-1/5 bg-yellow-300 text-xs text-center py-1 truncate">Below Optimal</div>
                          <div className="w-1/5 bg-green-400 text-xs text-center py-1 relative truncate">
                            Optimal
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-black"></div>
                          </div>
                          <div className="w-1/5 bg-yellow-300 text-xs text-center py-1 truncate">Above Optimal</div>
                          <div className="w-1/5 bg-red-400 text-xs text-center py-1 truncate">Above Standard</div>
                        </div>
                        <div className="flex text-xs mt-1">
                          <div className="w-1/5 text-center truncate">2.5-3.0</div>
                          <div className="w-1/5 text-center truncate">3.0-3.5</div>
                          <div className="w-1/5 text-center truncate">3.5-5.1</div>
                          <div className="w-1/5 text-center truncate">5.1-5.5</div>
                          <div className="w-1/5 text-center truncate">5.5-6.0</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t gap-3">
            <div className="text-sm text-gray-500 w-full sm:w-auto text-center sm:text-left">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2 order-3 sm:order-2">
              {currentPage < totalPages && (
                <Button variant="outline" onClick={handleNextPage} className="flex items-center">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              {currentPage > 1 && (
                <Button variant="outline" onClick={handlePrevPage} className="flex items-center">
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end order-2 sm:order-3">
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button variant="default" className="bg-evexia-blue hover:bg-evexia-lightblue">
                Print
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

