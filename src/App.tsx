"use client"

import { useEffect } from "react"
import { Toaster } from "react-hot-toast"
import { setupWorker } from "msw/browser"
import { handlers } from "./lib/msw-handlers"
import { seedDatabase, isDatabaseEmpty } from "./lib/seed-data"

const worker = setupWorker(...handlers)

export default function App({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window === "undefined") return

      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      })

      const isEmpty = await isDatabaseEmpty()
      if (isEmpty) {
        await seedDatabase()
      }
    }

    initializeApp()
  }, [])

  return (
    <div className="App">
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </div>
  )
}

