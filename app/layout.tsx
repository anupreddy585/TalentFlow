import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { MSWProvider } from "../components/providers/MSWProvider"
import { Toaster } from "react-hot-toast"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "TalentFlow - Hiring Platform",
  description: "A comprehensive hiring platform for managing jobs, candidates, and assessments",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="font-sans">
        <Suspense fallback={null}>
          <MSWProvider>{children}</MSWProvider>
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
        </Suspense>
      </body>
    </html>
  )
}
