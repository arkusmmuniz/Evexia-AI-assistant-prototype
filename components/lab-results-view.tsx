"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { type TestOrder, getPatientById } from "@/data/dummy-patients"

interface LabResultsViewProps {
  order: TestOrder
  onBack: () => void
}

interface AnalyteResult {
  name: string
  value: number
  unit: string
  ranges: {
    belowStandard: [number, number]
    belowOptimal: [number, number]
    optimal: [number, number]
    aboveOptimal: [number, number]
    aboveStandard: [number, number]
  }
}

export default function LabResultsView({ order, onBack }: LabResultsViewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const patient = getPatientById(order.patientId)

  // Generate specimen ID based on order ID
  const specimenId = `123-${order.id.replace(/\D/g, "")}-78`

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

  // Animation effect when component mounts
  useEffect(() => {
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
    }, 300)
  }

  // Generate analyte results based on order details
  const generateAnalyteResults = (): AnalyteResult[] => {
    if (!order.results) return []

    const results: AnalyteResult[] = []

    // Map result details to our analyte format
    Object.entries(order.results.resultDetails).forEach(([key, detail]) => {
      // Only include numeric results
      if (typeof detail.value === "number" || !isNaN(Number(detail.value))) {
        const value = typeof detail.value === "number" ? detail.value : Number(detail.value)

        // Create ranges based on the value and reference
        let ranges

        switch (key) {
          case "totalCholesterol":
            ranges = {
              belowStandard: [0, 150],
              belowOptimal: [150, 180],
              optimal: [180, 200],
              aboveOptimal: [200, 240],
              aboveStandard: [240, 300],
            }
            break
          case "glucose":
            ranges = {
              belowStandard: [0, 70],
              belowOptimal: [70, 80],
              optimal: [80, 100],
              aboveOptimal: [100, 125],
              aboveStandard: [125, 200],
            }
            break
          case "wbc":
            ranges = {
              belowStandard: [0, 3.5],
              belowOptimal: [3.5, 4.5],
              optimal: [4.5, 11.0],
              aboveOptimal: [11.0, 15.0],
              aboveStandard: [15.0, 20.0],
            }
            break
          case "rbc":
            ranges = {
              belowStandard: [0, 4.0],
              belowOptimal: [4.0, 4.5],
              optimal: [4.5, 5.9],
              aboveOptimal: [5.9, 6.5],
              aboveStandard: [6.5, 8.0],
            }
            break
          case "hgb":
          case "hemoglobin":
            ranges = {
              belowStandard: [0, 13.2],
              belowOptimal: [13.2, 14.0],
              optimal: [14.0, 15.0],
              aboveOptimal: [15.0, 17.0],
              aboveStandard: [17.0, 18.0],
            }
            break
          case "sodium":
            ranges = {
              belowStandard: [100, 120],
              belowOptimal: [120, 135],
              optimal: [135, 145],
              aboveOptimal: [145, 160],
              aboveStandard: [160, 175],
            }
            break
          case "bilirubin":
            ranges = {
              belowStandard: [0.0, 0.0],
              belowOptimal: [0.0, 0.1],
              optimal: [0.1, 0.8],
              aboveOptimal: [0.8, 1.2],
              aboveStandard: [1.2, 1.5],
            }
            break
          default:
            // Default ranges if specific ones aren't defined
            const refValue =
              typeof detail.reference === "string" ? Number(detail.reference.replace(/[^0-9.]/g, "")) : 100

            ranges = {
              belowStandard: [0, refValue * 0.7],
              belowOptimal: [refValue * 0.7, refValue * 0.9],
              optimal: [refValue * 0.9, refValue * 1.1],
              aboveOptimal: [refValue * 1.1, refValue * 1.3],
              aboveStandard: [refValue * 1.3, refValue * 1.5],
            }
        }

        // Format the name to be more readable
        const formattedName = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/([a-zA-Z])(\d)/g, "$1 $2")

        results.push({
          name: formattedName,
          value,
          unit: detail.unit || "",
          ranges,
        })
      }
    })

    // Add some default results if we don't have enough
    if (results.length < 4) {
      if (!results.some((r) => r.name.toLowerCase().includes("bilirubin"))) {
        results.push({
          name: "Bilirubin, Total",
          value: 0.6,
          unit: "mg/dL",
          ranges: {
            belowStandard: [0.0, 0.0],
            belowOptimal: [0.0, 0.1],
            optimal: [0.1, 0.8],
            aboveOptimal: [0.8, 1.2],
            aboveStandard: [1.2, 1.5],
          },
        })
      }

      if (!results.some((r) => r.name.toLowerCase().includes("hemoglobin"))) {
        results.push({
          name: "Hemoglobin",
          value: 15.6,
          unit: "g/dL",
          ranges: {
            belowStandard: [0, 13.2],
            belowOptimal: [13.2, 14.0],
            optimal: [14.0, 15.0],
            aboveOptimal: [15.0, 17.0],
            aboveStandard: [17.0, 18.0],
          },
        })
      }

      if (!results.some((r) => r.name.toLowerCase().includes("sodium"))) {
        results.push({
          name: "Sodium",
          value: 140,
          unit: "mEq/L",
          ranges: {
            belowStandard: [100, 120],
            belowOptimal: [120, 135],
            optimal: [135, 145],
            aboveOptimal: [145, 160],
            aboveStandard: [160, 175],
          },
        })
      }

      if (!results.some((r) => r.name.toLowerCase().includes("psa"))) {
        results.push({
          name: "PSA",
          value: 0.49,
          unit: "ng/mL",
          ranges: {
            belowStandard: [0, 0],
            belowOptimal: [0, 0],
            optimal: [0, 2.5],
            aboveOptimal: [2.5, 3.0],
            aboveStandard: [3.0, 4.0],
          },
        })
      }
    }

    return results.slice(0, 8) // Limit to 8 results
  }

  const analyteResults = generateAnalyteResults()

  // Function to determine where to place the marker on the range bar
  const getMarkerPosition = (value: number, ranges: AnalyteResult["ranges"]) => {
    const min = Math.min(
      ranges.belowStandard[0],
      ranges.belowOptimal[0],
      ranges.optimal[0],
      ranges.aboveOptimal[0],
      ranges.aboveStandard[0],
    )
    const max = Math.max(
      ranges.belowStandard[1],
      ranges.belowOptimal[1],
      ranges.optimal[1],
      ranges.aboveOptimal[1],
      ranges.aboveStandard[1],
    )

    // Calculate percentage position
    const percentage = ((value - min) / (max - min)) * 100
    return Math.max(0, Math.min(100, percentage)) + "%"
  }

  // Function to determine which range a value falls into
  const getValueRange = (value: number, ranges: AnalyteResult["ranges"]) => {
    if (value >= ranges.belowStandard[0] && value <= ranges.belowStandard[1]) return "Below Standard"
    if (value >= ranges.belowOptimal[0] && value <= ranges.belowOptimal[1]) return "Below Optimal"
    if (value >= ranges.optimal[0] && value <= ranges.optimal[1]) return "Optimal"
    if (value >= ranges.aboveOptimal[0] && value <= ranges.aboveOptimal[1]) return "Above Optimal"
    if (value >= ranges.aboveStandard[0] && value <= ranges.aboveStandard[1]) return "Above Standard"
    return "Outside Range"
  }

  return (
    <div
      className={cn(
        "p-6 max-w-5xl mx-auto transition-all duration-300 ease-in-out overflow-y-auto",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Breadcrumb and header */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <span>My Business</span>
        <span className="mx-2">›</span>
        <span>Order History</span>
        <span className="mx-2">›</span>
        <span className="font-medium text-gray-700">Report: {specimenId}</span>

        <div className="ml-auto flex items-center">
          <div className="text-sm mr-2">
            <div>Partner ID: 4449</div>
            <div>Danbury, CA</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Insight Lab Results Report</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Information panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Patient Information */}
        <Card className="overflow-hidden">
          <div className="bg-[#3b4781] text-white p-3 font-medium">Patient Information</div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="font-medium">Full Name:</div>
              <div>{patient?.name || "Unknown"}</div>

              <div className="font-medium">Date of Birth:</div>
              <div>{patient?.dateOfBirth || "Unknown"}</div>

              <div className="font-medium">Gender:</div>
              <div>{patient?.gender || "Unknown"}</div>
            </div>
          </div>
        </Card>

        {/* Specimen Information */}
        <Card className="overflow-hidden">
          <div className="bg-[#3b4781] text-white p-3 font-medium">Specimen Information</div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="font-medium">Specimen:</div>
              <div>{specimenId}</div>

              <div className="font-medium">Collected:</div>
              <div>{formatDate(collectionDate)}</div>

              <div className="font-medium">Received:</div>
              <div>{formatDate(receivedDate)}</div>
            </div>
          </div>
        </Card>

        {/* Physician Information */}
        <Card className="overflow-hidden">
          <div className="bg-[#3b4781] text-white p-3 font-medium">Physician Information</div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="font-medium">Client ID:</div>
              <div>21354</div>

              <div className="font-medium">Physician Name:</div>
              <div>{order.orderedBy}</div>

              <div className="font-medium">Account Name:</div>
              <div>The Wellness Surge</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytes section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">
          {analyteResults.length} Analytes in total for Specimen #{specimenId}
        </h2>

        <div className="space-y-6">
          {analyteResults.map((analyte, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-medium mb-2">{analyte.name}</h3>
              <div className="flex items-stretch">
                {/* Value box */}
                <div className="w-24 h-16 border rounded-md flex flex-col items-center justify-center mr-4">
                  <div
                    className={cn(
                      "text-xl font-bold",
                      getValueRange(analyte.value, analyte.ranges) === "Optimal"
                        ? "text-green-600"
                        : getValueRange(analyte.value, analyte.ranges).includes("Below")
                          ? "text-yellow-600"
                          : "text-red-600",
                    )}
                  >
                    {analyte.value}
                  </div>
                  <div className="text-xs text-gray-500">{analyte.unit}</div>
                </div>

                {/* Range bar */}
                <div className="flex-1 border rounded-md p-2">
                  <div className="grid grid-cols-5 text-xs text-center mb-1">
                    <div>Below Standard</div>
                    <div>Below Optimal</div>
                    <div>Optimal</div>
                    <div>Above Optimal</div>
                    <div>Above Standard</div>
                  </div>

                  <div className="relative h-6 flex">
                    {/* Below Standard */}
                    <div className="h-full bg-red-500 flex-1 rounded-l-sm"></div>

                    {/* Below Optimal */}
                    <div className="h-full bg-yellow-500 flex-1"></div>

                    {/* Optimal */}
                    <div className="h-full bg-green-500 flex-1 relative">
                      {/* Marker */}
                      <div
                        className="absolute top-0 w-0.5 h-10 bg-black -mt-2"
                        style={{
                          left: getMarkerPosition(analyte.value, analyte.ranges),
                          transform: "translateX(-50%)",
                        }}
                      >
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-black absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>

                    {/* Above Optimal */}
                    <div className="h-full bg-yellow-500 flex-1"></div>

                    {/* Above Standard */}
                    <div className="h-full bg-red-500 flex-1 rounded-r-sm"></div>
                  </div>

                  <div className="grid grid-cols-5 text-xs text-center mt-2">
                    <div>{analyte.ranges.belowStandard.join("-")}</div>
                    <div>{analyte.ranges.belowOptimal.join("-")}</div>
                    <div>{analyte.ranges.optimal.join("-")}</div>
                    <div>{analyte.ranges.aboveOptimal.join("-")}</div>
                    <div>{analyte.ranges.aboveStandard.join("-")}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes and interpretation */}
      {order.results?.interpretation && (
        <Card className="p-4 mb-6">
          <h3 className="font-medium mb-2">Interpretation</h3>
          <p className="text-sm">{order.results.interpretation}</p>

          {order.results.recommendedFollowUp && (
            <>
              <Separator className="my-3" />
              <h3 className="font-medium mb-2">Recommended Follow-Up</h3>
              <p className="text-sm">{order.results.recommendedFollowUp}</p>
            </>
          )}
        </Card>
      )}
    </div>
  )
}

