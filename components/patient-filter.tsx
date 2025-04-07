"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { patients } from "@/data/dummy-patients"
import { cn } from "@/lib/utils"

interface PatientFilterProps {
  onPatientSelect: (patientId: string | null) => void
  selectedPatientId: string | null
}

export default function PatientFilter({ onPatientSelect, selectedPatientId }: PatientFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filteredPatients, setFilteredPatients] = useState(patients)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get the selected patient name for display
  const selectedPatient = selectedPatientId ? patients.find((p) => p.id === selectedPatientId) : null

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredPatients(filtered)
    }
  }, [searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    onPatientSelect(patientId)
    setIsDropdownOpen(false)
    setSearchTerm("")
  }

  // Clear the filter
  const clearFilter = () => {
    onPatientSelect(null)
    setSearchTerm("")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsDropdownOpen(true)
            }}
            onClick={() => setIsDropdownOpen(true)}
            className="pl-8 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {selectedPatientId && (
          <Button variant="outline" size="sm" onClick={clearFilter} className="whitespace-nowrap">
            Clear Filter
          </Button>
        )}
      </div>

      {/* Selected patient indicator */}
      {selectedPatientId && (
        <div className="mt-2 flex items-center">
          <span className="text-sm text-muted-foreground">Filtered by patient:</span>
          <span className="ml-2 rounded-full bg-evexia-blue/10 px-2.5 py-0.5 text-sm font-medium text-evexia-blue">
            {selectedPatient?.name}
          </span>
        </div>
      )}

      {/* Dropdown for patient selection */}
      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={cn(
                    "cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-gray-100",
                    selectedPatientId === patient.id && "bg-evexia-blue/10",
                  )}
                  onClick={() => handlePatientSelect(patient.id)}
                >
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {patient.id} • DOB: {patient.dateOfBirth}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No patients found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

