"use client"

import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type TestOrder, getPatientById } from "@/data/dummy-patients"

interface OrderDetailsModalProps {
  order: TestOrder | null
  isOpen: boolean
  onClose: () => void
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null

  const patient = getPatientById(order.patientId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Order Details</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div>
            <div className="text-sm text-gray-500">Order ID</div>
            <div className="font-medium">{order.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Patient</div>
            <div className="font-medium">{patient?.name || "Unknown"}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Test Type</div>
            <div className="font-medium">{order.testName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
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

          <div>
            <div className="text-sm text-gray-500">Date</div>
            <div className="font-medium">{order.orderedDate}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Doctor</div>
            <div className="font-medium">{order.orderedBy}</div>
          </div>
        </div>

        {order.results && (
          <>
            <Separator className="my-2" />

            <div className="py-4">
              <h3 className="text-lg font-semibold mb-4">Test Results</h3>
              <div className="space-y-2">
                {Object.entries(order.results.resultDetails).map(([key, detail]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium capitalize">{key}</div>
                    <div className="flex items-center">
                      <span className={detail.flag ? "text-red-600 font-medium" : ""}>
                        {detail.value} {detail.unit}
                      </span>
                      {detail.flag && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                          {detail.flag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.results.interpretation && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500">Interpretation</div>
                  <div className="mt-1">{order.results.interpretation}</div>
                </div>
              )}

              {order.results.recommendedFollowUp && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500">Recommended Follow-Up</div>
                  <div className="mt-1">{order.results.recommendedFollowUp}</div>
                </div>
              )}
            </div>
          </>
        )}

        {order.notes && (
          <>
            <Separator className="my-2" />

            <div className="py-4">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p>{order.notes}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

