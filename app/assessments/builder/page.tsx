"use client"

import { useState, useEffect } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import {
  Plus,
  GripVertical,
  Trash2,
  Eye,
  Save,
  Type,
  List,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { mockApi } from "@/lib/mock-api"
import { useSearchParams, useRouter } from "next/navigation"

interface Question {
  id: string
  type: "text" | "textarea" | "multiple-choice" | "checkbox"
  title: string
  description?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
  }
}

interface Assessment {
  id?: string
  title: string
  description: string
  questions: Question[]
  isPublished: boolean
}

const questionTypes = [
  { value: "text", label: "Short Text", icon: Type },
  { value: "textarea", label: "Long Text", icon: Type },
  { value: "multiple-choice", label: "Multiple Choice", icon: List },
  { value: "checkbox", label: "Checkboxes", icon: CheckSquare },
]

export default function AssessmentBuilder() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const assessmentId = searchParams.get("id")

  const [assessment, setAssessment] = useState<Assessment>({
    title: "",
    description: "",
    questions: [],
    isPublished: false,
  })
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // ---------------- Load from localStorage or mockApi ----------------
  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId)
    }
  }, [assessmentId])

  const loadAssessment = async (id: string) => {
    try {
      setLoading(true)
      const stored = localStorage.getItem("assessments")
      const assessments: Assessment[] = stored ? JSON.parse(stored) : []
      const local = assessments.find((a) => a.id === id)

      if (local) {
        setAssessment(local)
      } else {
        const data = await mockApi.getAssessment(id)
        setAssessment(data)
      }
    } catch (error) {
      console.error("Failed to load assessment:", error)
    } finally {
      setLoading(false)
    }
  }

  // ---------------- Save to localStorage + mockApi ----------------
  // ---------------- Save to localStorage + mockApi ----------------
  const saveAssessment = async () => {
    try {
      setLoading(true)

      const stored = localStorage.getItem("assessments")
      let assessments: Assessment[] = stored ? JSON.parse(stored) : []

      if (assessmentId) {
        // update existing
        assessments = assessments.map((a) =>
          a.id === assessmentId ? { ...assessment, id: assessmentId } : a
        )
        await mockApi.updateAssessment(assessmentId, assessment)
      } else {
        // create new
        const newId = `local_${Date.now()}`
        const newAssessment = { ...assessment, id: newId }
        assessments.push(newAssessment)
        await mockApi.createAssessment(newAssessment)
      }

      // persist to localStorage
      localStorage.setItem("assessments", JSON.stringify(assessments))
      console.log("✅ Saved assessment to localStorage")

      // redirect to assessments list page
      router.push("/assessments")
    } catch (error) {
      console.error("Failed to save assessment:", error)
    } finally {
      setLoading(false)
    }
  }

  // ---------------- Builder Actions ----------------
  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      title: "",
      required: false,
      options:
        type === "multiple-choice" || type === "checkbox"
          ? ["Option 1"]
          : undefined,
    }
    setAssessment((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
  }

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }))
  }

  const deleteQuestion = (questionId: string) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }))
  }

  // ✅ Fixed typing: DropResult from @hello-pangea/dnd
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(assessment.questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setAssessment((prev) => ({ ...prev, questions: items }))
  }

  const addOption = (questionId: string) => {
    const question = assessment.questions.find((q) => q.id === questionId)
    if (question?.options) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`],
      })
    }
  }

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    const question = assessment.questions.find((q) => q.id === questionId)
    if (question?.options) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = assessment.questions.find((q) => q.id === questionId)
    if (question?.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex)
      updateQuestion(questionId, { options: newOptions })
    }
  }

  // ---------------- Render ----------------
  if (loading && assessmentId) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {assessmentId ? "Edit Assessment" : "Create Assessment"}
            </h1>
            <p className="text-gray-600 mt-1">Build your candidate assessment</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button onClick={saveAssessment} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Assessment
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Builder Panel */}
        <div className={`${showPreview ? "w-1/2" : "w-full"} p-6 space-y-6`}>
          {/* Assessment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={assessment.title}
                  onChange={(e) => setAssessment((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assessment title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assessment.description}
                  onChange={(e) => setAssessment((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter assessment description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={assessment.isPublished}
                  onCheckedChange={(checked) => setAssessment((prev) => ({ ...prev, isPublished: checked }))}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </CardContent>
          </Card>

          {/* Question Types */}
          <Card>
            <CardHeader>
              <CardTitle>Add Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {questionTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.value}
                      variant="outline"
                      onClick={() => addQuestion(type.value as Question["type"])}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{type.label}</span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {assessment.questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id} index={index}>
                      {(provided) => (
                        <Card ref={provided.innerRef} {...provided.draggableProps} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              <Badge variant="secondary">
                                {questionTypes.find((t) => t.value === question.type)?.label}
                              </Badge>
                              <div className="flex-1" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteQuestion(question.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Question Title</Label>
                              <Input
                                value={question.title}
                                onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                                placeholder="Enter question title"
                              />
                            </div>

                            {question.description !== undefined && (
                              <div>
                                <Label>Description (optional)</Label>
                                <Textarea
                                  value={question.description || ""}
                                  onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                                  placeholder="Enter question description"
                                />
                              </div>
                            )}

                            {(question.type === "multiple-choice" || question.type === "checkbox") && (
                              <div>
                                <Label>Options</Label>
                                <div className="space-y-2">
                                  {question.options?.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center space-x-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                      {question.options!.length > 1 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeOption(question.id, optionIndex)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  <Button variant="outline" size="sm" onClick={() => addOption(question.id)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={question.required}
                                onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                              />
                              <Label>Required</Label>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {assessment.questions.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 text-lg mb-2">No questions yet</div>
                <p className="text-gray-600 mb-4">Add your first question to get started</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-l bg-white p-6">
            <div className="sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <h2 className="text-2xl font-bold">{assessment.title || "Untitled Assessment"}</h2>
                  {assessment.description && <p className="text-gray-600 mt-2">{assessment.description}</p>}
                </div>

                {assessment.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <div>
                      <h4 className="font-medium">
                        {index + 1}. {question.title || "Untitled Question"}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {question.description && <p className="text-sm text-gray-600 mt-1">{question.description}</p>}
                    </div>

                    {question.type === "text" && <Input placeholder="Your answer..." disabled />}

                    {question.type === "textarea" && <Textarea placeholder="Your answer..." disabled />}

                    {question.type === "multiple-choice" && (
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input type="radio" name={question.id} disabled />
                            <label className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "checkbox" && (
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input type="checkbox" disabled />
                            <label className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {assessment.questions.length > 0 && (
                  <Button className="w-full" disabled>
                    Submit Assessment
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

