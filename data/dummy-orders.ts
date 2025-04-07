import { patients, type TestOrder } from "@/data/dummy-patients"

export function getOrderById(orderId: string): TestOrder | undefined {
  if (!orderId) return undefined

  try {
    // Normalize the order ID for comparison
    const normalizedOrderId = orderId.trim().toUpperCase()

    // Search through all patients for the order
    for (const patient of patients) {
      if (!patient.orders || !Array.isArray(patient.orders)) continue

      const order = patient.orders.find((order) => order.id && order.id.toUpperCase() === normalizedOrderId)

      if (order) return order
    }

    return undefined
  } catch (error) {
    console.error("Error in getOrderById:", error)
    return undefined
  }
}

// Helper function to get recent orders safely
export function getSafeRecentOrders(limit = 5): TestOrder[] {
  try {
    const allOrders: TestOrder[] = []

    // Collect all orders
    for (const patient of patients) {
      if (patient.orders && Array.isArray(patient.orders)) {
        allOrders.push(...patient.orders)
      }
    }

    // Sort by ordered date (most recent first)
    const sortedOrders = allOrders.sort((a, b) => {
      try {
        return new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime()
      } catch (e) {
        return 0
      }
    })

    // Return the specified number of orders
    return sortedOrders.slice(0, limit)
  } catch (error) {
    console.error("Error in getSafeRecentOrders:", error)
    return []
  }
}

