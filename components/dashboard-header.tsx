"use client"

import { ShoppingCart } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type DashboardHeaderProps = {
  onShowDiagnostics?: () => void
  onCreateNewOrder?: () => void
}

export default function DashboardHeader({ onShowDiagnostics, onCreateNewOrder }: DashboardHeaderProps) {
  return (
    <header className="bg-[#1e3178] text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded mr-2 flex items-center justify-center">
              <div className="text-[#1e3178] font-bold text-xl">+</div>
            </div>
            <span className="font-bold text-xl">evexia</span>
            <span className="text-xs ml-1 opacity-70">diagnostics</span>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a href="#" className="font-medium px-2 py-1 rounded hover:bg-[#2a3d8f]">
              My Business
            </a>
            <a href="#" className="font-medium px-2 py-1 rounded hover:bg-[#2a3d8f]">
              My Patients
            </a>
            <a href="#" className="font-medium px-2 py-1 rounded hover:bg-[#2a3d8f]">
              Tests
            </a>
            <a href="#" className="font-medium px-2 py-1 rounded hover:bg-[#2a3d8f]">
              Support
            </a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-[#2a3d8f]"
            onClick={onCreateNewOrder}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8 bg-white text-[#1e3178]">
            <AvatarFallback>KS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

