"use client"

import { useParams } from "next/navigation"
import { JobDetailPage } from "../../../src/pages/JobDetailPage"
import { AppLayout } from "../../../components/layout/AppLayout"

export default function JobDetail() {
  const params = useParams()

  return (
    <AppLayout>
      <JobDetailPage />
    </AppLayout>
  )
}
