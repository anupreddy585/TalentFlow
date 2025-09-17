"use client"

import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import { Plus, Save, Eye } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { AssessmentSection } from "./AssessmentSection"
import { AssessmentPreview } from "./AssessmentPreview"
import { useAssessmentsStore } from "../../store/assessments-store"
import { LoadingSpinner } from "../ui/LoadingSpinner"

export function AssessmentBuilder() {
  const params = useParams()
  const jobId = params?.jobId as string
  const [showPreview, setShowPreview] = React.useState(false)

  const {
    currentAssessment,
    loading,
    fetchAssessment,
    saveAssessment,
    updateAssessment,
    addSection,
    updateSection,
    deleteSection,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  } = useAssessmentsStore()

  useEffect(() => {
    if (jobId) {
      fetchAssessment(jobId)
    }
  }, [jobId, fetchAssessment])

  const handleSave = async () => {
    if (currentAssessment && jobId) {
      await saveAssessment(jobId, currentAssessment)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentAssessment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Assessment not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assessment Builder</h2>
          <p className="text-gray-600">Create and edit assessment questions</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" icon={Eye} onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button icon={Save} onClick={handleSave}>
            Save Assessment
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="space-y-6">
          {/* Assessment Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Details</h3>

            <div className="space-y-4">
              <Input
                label="Assessment Title"
                value={currentAssessment.title}
                onChange={(e) => updateAssessment({ title: e.target.value })}
                placeholder="Enter assessment title"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={currentAssessment.description}
                  onChange={(e) => updateAssessment({ description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter assessment description"
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {currentAssessment.sections.map((section, index) => (
              <AssessmentSection
                key={section.id}
                section={section}
                sectionIndex={index}
                onUpdate={(updates) => updateSection(section.id, updates)}
                onDelete={() => deleteSection(section.id)}
                onAddQuestion={() => addQuestion(section.id)}
                onUpdateQuestion={(questionId, updates) => updateQuestion(section.id, questionId, updates)}
                onDeleteQuestion={(questionId) => deleteQuestion(section.id, questionId)}
                onReorderQuestions={(questions) => reorderQuestions(section.id, questions)}
              />
            ))}

            <Button variant="outline" icon={Plus} onClick={addSection} className="w-full bg-transparent">
              Add New Section
            </Button>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="sticky top-6">
            <AssessmentPreview assessment={currentAssessment} />
          </div>
        )}
      </div>
    </div>
  )
}
