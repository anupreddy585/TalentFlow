"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Bell, Search, Settings, User } from "lucide-react"

const pageTitles: Record<string, string> = {
  "/jobs": "Jobs",
  "/candidates": "Candidates",
  "/assessments": "Assessments",
  "/analytics": "Analytics",
}

export function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "TalentFlow"

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

