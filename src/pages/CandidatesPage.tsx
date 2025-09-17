"use client"

import React, { useEffect, useState } from "react"
import { Search, LayoutGrid, List } from "lucide-react"
import { useCandidatesStore } from "../store/candidates-store"
import type { Candidate } from "../types"
import { Button } from "../components/ui/Button"
import { Select } from "../components/ui/Select"
import CandidatesVirtualList from "../components/candidates/CandidatesVirtualList"
import { KanbanBoard } from "../components/candidates/KanbanBoard"
import { CandidateProfile } from "../components/candidates/CandidateProfile"

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

  const {
    candidates,
    loading,
    selectedCandidate,
    pagination,
    fetchCandidates,
    selectCandidate,
    setFilters,
    setPagination,
  } = useCandidatesStore()

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchTerm })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilters])

  const handleStageFilter = (stage: string) => {
    setStageFilter(stage)
    setFilters({ stage })
  }

  const handleCandidateClick = (candidate: Candidate) => {
    selectCandidate(candidate)
  }

  const stageStats = React.useMemo(() => {
    return {
      applied: candidates.filter((c) => c.stage === "applied").length,
      screen: candidates.filter((c) => c.stage === "screen").length,
      tech: candidates.filter((c) => c.stage === "tech").length,
      offer: candidates.filter((c) => c.stage === "offer").length,
      hired: candidates.filter((c) => c.stage === "hired").length,
      rejected: candidates.filter((c) => c.stage === "rejected").length,
    }
  }, [candidates])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
            <p className="text-gray-600">Manage candidate applications and progress</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "primary" : "outline"}
              icon={List}
              onClick={() => setViewMode("list")}
              size="sm"
            >
              List
            </Button>
            <Button
              variant={viewMode === "kanban" ? "primary" : "outline"}
              icon={LayoutGrid}
              onClick={() => setViewMode("kanban")}
              size="sm"
            >
              Kanban
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </div>

          <Select
            value={stageFilter}
            onChange={(e) => handleStageFilter(e.target.value)}
            options={[
              { value: "", label: "All Stages" },
              { value: "applied", label: "Applied" },
              { value: "screen", label: "Screening" },
              { value: "tech", label: "Technical" },
              { value: "offer", label: "Offer" },
              { value: "hired", label: "Hired" },
              { value: "rejected", label: "Rejected" },
            ]}
            className="w-40"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-600">{stageStats.applied}</div>
            <div className="text-xs text-gray-500">Applied</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{stageStats.screen}</div>
            <div className="text-xs text-gray-500">Screening</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stageStats.tech}</div>
            <div className="text-xs text-gray-500">Technical</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">{stageStats.offer}</div>
            <div className="text-xs text-gray-500">Offer</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">{stageStats.hired}</div>
            <div className="text-xs text-gray-500">Hired</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-red-600">{stageStats.rejected}</div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <CandidatesVirtualList candidates={candidates} loading={loading} onCandidateClick={handleCandidateClick} />

          {/* Pagination for list view */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
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
        </div>
      ) : (
        <KanbanBoard candidates={candidates} />
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidate && <CandidateProfile candidate={selectedCandidate} onClose={() => selectCandidate(null)} />}
    </div>
  )
}
