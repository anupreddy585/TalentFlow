"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Archive, Users, FileText, Calendar, MapPin, Building } from "lucide-react"
import { format } from "date-fns"
import { useJobsStore } from "../store/jobs-store"
import { useCandidatesStore } from "../store/candidates-store"
import type { Job } from "../types"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { JobForm } from "../components/jobs/JobForm"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"

export function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [job, setJob] = useState<Job | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [candidateCount, setCandidateCount] = useState(0)

  const { jobs, updateJob } = useJobsStore()
  const { candidates } = useCandidatesStore()

  useEffect(() => {
    if (id) {
      const foundJob = jobs.find((j) => j.id === id)
      setJob(foundJob || null)
    }
  }, [id, jobs])

  useEffect(() => {
    if (job) {
      const count = candidates.filter((c) => c.jobId === job.id).length
      setCandidateCount(count)
    }
  }, [job, candidates])

  const handleUpdateJob = async (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">) => {
    if (!job) return

    try {
      await updateJob(job.id, jobData)
      setShowEditModal(false)
      // Update local job state
      setJob({ ...job, ...jobData, updatedAt: new Date() })
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleArchive = async () => {
    if (!job) return

    const newStatus = job.status === "active" ? "archived" : "active"
    await updateJob(job.id, { status: newStatus })
    setJob({ ...job, status: newStatus, updatedAt: new Date() })
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => router.push("/jobs")}>
            Back to Jobs
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <Badge variant={job.status === "active" ? "success" : "secondary"} size="md">
                {job.status}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              {job.department && (
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {job.department}
                </div>
              )}
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {format(new Date(job.createdAt), "MMMM d, yyyy")}
              </div>
            </div>

            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag, index) => (
                  <Badge key={index} variant="info" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" icon={Edit} onClick={() => setShowEditModal(true)}>
              Edit Job
            </Button>
            <Button variant="outline" icon={Archive} onClick={handleArchive}>
              {job.status === "active" ? "Archive" : "Unarchive"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{candidateCount}</div>
              <div className="text-sm text-gray-600">Total Candidates</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {candidates.filter((c) => c.jobId === job.id && c.stage === "hired").length}
              </div>
              <div className="text-sm text-gray-600">Hired</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {candidates.filter((c) => c.jobId === job.id && ["screen", "tech", "offer"].includes(c.stage)).length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          {job.description ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              {job.description.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No description provided</p>
          )}
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/candidates?job=${job.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">View Candidates</span>
                </div>
                <Badge variant="secondary">{candidateCount}</Badge>
              </Link>

              <Link
                href={`/assessments/${job.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Manage Assessment</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Job ID:</span>
                <span className="font-medium">{job.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">URL Slug:</span>
                <span className="font-medium">{job.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={job.status === "active" ? "success" : "secondary"}>{job.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{format(new Date(job.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{format(new Date(job.updatedAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Job" size="lg">
        <JobForm job={job} onSubmit={handleUpdateJob} onCancel={() => setShowEditModal(false)} />
      </Modal>
    </div>
  )
}
