import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { testName, patientName } = await req.json()

    // In a real application, this would connect to your database
    // and create an actual test order

    // Simulate a delay for processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a random order ID
    const orderId = Math.floor(10000 + Math.random() * 90000)

    return NextResponse.json({
      success: true,
      orderId,
      message: `Test order for ${testName} created successfully for patient ${patientName}`,
      status: "In Progress",
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating test order:", error)
    return NextResponse.json({ success: false, message: "Failed to create test order" }, { status: 500 })
  }
}

