"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { seedDatabase, isDatabaseEmpty } from "../../src/lib/seed-data"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        try {
          // Import only in the browser
          const { setupWorker } = await import("msw/browser")
          const { handlers } = await import("../../src/lib/msw-handlers")

          const worker = setupWorker(...handlers)

          await worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          })

          const isEmpty = await isDatabaseEmpty()
          if (isEmpty) {
            console.log("Database is empty, seeding...")
            await seedDatabase()
          }

          setIsReady(true)
        } catch (error) {
          console.error("Failed to initialize MSW:", error)
          setIsReady(true) // Continue even if MSW fails
        }
      } else {
        setIsReady(true) // skip MSW in production/SSR
      }
    }

    initializeApp()
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">TalentFlow</h2>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

