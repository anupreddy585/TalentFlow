"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { useJobsStore } from "../store/jobs-store"
import type { Job } from "../types"
import { Button } from "../components/ui/Button"
import { Select } from "../components/ui/Select"
import { Modal } from "../components/ui/Modal"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { JobsList } from "../components/jobs/JobsList"
import { JobForm } from "../components/jobs/JobForm"

export function JobsPage() {
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const {
    jobs,
    loading,
    error,
    pagination,
    filters,
    fetchJobs,
    createJob,
    updateJob,
    reorderJobs,
    reorderJob,
    setFilters,
    setPagination,
  } = useJobsStore()

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs, filters, pagination.page])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchTerm })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilters])

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setFilters({ status })
  }

  const handleCreateJob = async (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">) => {
    try {
      await createJob(jobData)
      setShowCreateModal(false)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleUpdateJob = async (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">) => {
    if (!selectedJob) return

    try {
      await updateJob(selectedJob.id, jobData)
      setShowEditModal(false)
      setSelectedJob(null)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleViewJob = (job: Job) => {
    router.push(`/jobs/${job.id}`)
  }

  const handleEditJob = (job: Job) => {
    setSelectedJob(job)
    setShowEditModal(true)
  }

  const handleArchiveJob = async (job: Job) => {
    const newStatus = job.status === "active" ? "archived" : "active"
    await updateJob(job.id, { status: newStatus })
  }

  const handleDeleteJob = async (job: Job) => {
    if (confirm("Are you sure you want to delete this job?")) {
      // For demo purposes, we'll just archive it
      await updateJob(job.id, { status: "archived" })
    }
  }

  const handleReorderJobs = async (reorderedJobs: Job[]) => {
    reorderJobs(reorderedJobs)

    // Find the job that was moved and call the API
    const originalJob = jobs.find((j) => reorderedJobs.find((rj) => rj.id === j.id)?.order !== j.order)

    if (originalJob) {
      const reorderedJob = reorderedJobs.find((j) => j.id === originalJob.id)
      if (reorderedJob) {
        try {
          await reorderJob(originalJob.id, originalJob.order, reorderedJob.order)
        } catch (error) {
          // Error handling is done in the store
        }
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600">Manage your job postings and requirements</p>
          </div>

          <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create Job
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]}
            className="w-40"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
            <div className="text-sm text-gray-600">Total Jobs</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{jobs.filter((j) => j.status === "active").length}</div>
            <div className="text-sm text-gray-600">Active Jobs</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{jobs.filter((j) => j.status === "archived").length}</div>
            <div className="text-sm text-gray-600">Archived Jobs</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found</p>
          <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
            Create Your First Job
          </Button>
        </div>
      ) : (
        <JobsList
          jobs={jobs}
          onView={handleViewJob}
          onEdit={handleEditJob}
          onArchive={handleArchiveJob}
          onDelete={handleDeleteJob}
          onReorder={handleReorderJobs}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Job" size="lg">
        <JobForm onSubmit={handleCreateJob} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedJob(null)
        }}
        title="Edit Job"
        size="lg"
      >
        {selectedJob && (
          <JobForm
            job={selectedJob}
            onSubmit={handleUpdateJob}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedJob(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default JobsPage
