"use client"

interface DashboardTabsProps {
  onNavigate?: (tab: string) => void
  activeTab?: string
}

export default function DashboardTabs({ onNavigate, activeTab = "dashboard" }: DashboardTabsProps) {
  const handleTabClick = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab)
    }
  }

  return (
    <div className="bg-gray-100 border-b">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => handleTabClick("dashboard")}
            className={`px-6 py-3 font-medium ${
              activeTab === "dashboard"
                ? "text-[#1e3178] border-b-2 border-[#1e3178]"
                : "text-gray-600 hover:text-[#1e3178]"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabClick("billing")}
            className={`px-6 py-3 font-medium ${
              activeTab === "billing"
                ? "text-[#1e3178] border-b-2 border-[#1e3178]"
                : "text-gray-600 hover:text-[#1e3178]"
            }`}
          >
            Billing
          </button>
          <button
            onClick={() => handleTabClick("order-history")}
            className={`px-6 py-3 font-medium ${
              activeTab === "order-history"
                ? "text-[#1e3178] border-b-2 border-[#1e3178]"
                : "text-gray-600 hover:text-[#1e3178]"
            }`}
          >
            Order History
          </button>
          <button
            onClick={() => handleTabClick("lab-results")}
            className={`px-6 py-3 font-medium ${
              activeTab === "lab-results"
                ? "text-[#1e3178] border-b-2 border-[#1e3178]"
                : "text-gray-600 hover:text-[#1e3178]"
            }`}
          >
            Lab Results
          </button>
          <button
            onClick={() => handleTabClick("fhr-orders")}
            className={`px-6 py-3 font-medium ${
              activeTab === "fhr-orders"
                ? "text-[#1e3178] border-b-2 border-[#1e3178]"
                : "text-gray-600 hover:text-[#1e3178]"
            }`}
          >
            FHR Orders
          </button>
          <button
            onClick={() => handleTabClick("reports")}
            className={`px-6 py-3 font-medium ${
              activeTab === "reports"
                ? "text-[#1e3178] border-b-2 border-[#1e3178]"
                : "text-gray-600 hover:text-[#1e3178]"
            }`}
          >
            Reports
          </button>
        </div>
      </div>
    </div>
  )
}

