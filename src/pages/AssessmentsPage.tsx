"use client"

import { useEffect } from "react"
import Link from "next/link"
import { FileText, Edit, Plus, Eye } from "lucide-react"
import { useJobsStore } from "../store/jobs-store"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"

export function AssessmentsPage() {
  const { jobs, loading, fetchJobs } = useJobsStore()

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const activeJobs = jobs.filter((job) => job.status === "active")

  if (loading) {
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
            <p className="text-gray-600">Create and manage job-specific assessments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeJobs.length}</div>
                <div className="text-sm text-gray-600">Active Jobs</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Edit className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-sm text-gray-600">Assessments Created</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">127</div>
                <div className="text-sm text-gray-600">Total Responses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Assessments List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Job Assessments</h2>

        {activeJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No active jobs available</p>
            <p className="text-gray-400 text-sm mt-2">Create a job first to build assessments</p>
            <Link href="/jobs">
              <Button className="mt-4" icon={Plus}>
                Create Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                      {job.department && (
                        <Badge variant="secondary" size="sm">
                          {job.department}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    Assessment Status: <span className="text-blue-600">Available</span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/assessments/${job.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full" icon={Edit}>
                        Edit Assessment
                      </Button>
                    </Link>
                    <Link href={`/assessments/${job.id}/preview`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent" icon={Eye}>
                        Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
