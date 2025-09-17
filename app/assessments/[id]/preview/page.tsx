"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { mockApi, Assessment, Question } from "@/lib/mock-api"
import { saveState, loadState } from "@/lib/storage"
import Notes from "@/components/Notes"

export default function AssessmentPreview() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const saved = loadState<Record<string, any>>("responses", {})
    setResponses(saved)
    loadAssessment()
  }, [])

  useEffect(() => {
    saveState("responses", responses)
  }, [responses])

  const loadAssessment = async () => {
    try {
      const data = await mockApi.getAssessmentById(params.id as string)
      setAssessment(data)
    } catch (error) {
      console.error("Failed to load assessment:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    assessment?.questions.forEach((q) => {
      // check conditional
      if (q.conditional) {
        const depValue = responses[q.conditional.dependsOn]
        if (depValue !== q.conditional.value) return
      }

      const val = responses[q.id]
      if (q.rules?.required && (!val || (Array.isArray(val) && val.length === 0))) {
        newErrors[q.id] = "This field is required"
      }
      if (q.rules?.min !== undefined && Number(val) < q.rules.min) {
        newErrors[q.id] = `Min value is ${q.rules.min}`
      }
      if (q.rules?.max !== undefined && Number(val) > q.rules.max) {
        newErrors[q.id] = `Max value is ${q.rules.max}`
      }
      if (q.rules?.maxLength && val?.length > q.rules.maxLength) {
        newErrors[q.id] = `Max length is ${q.rules.maxLength}`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitAssessment = async () => {
    if (!validateForm()) return
    try {
      setSubmitting(true)
      await mockApi.submitAssessmentResponse(params.id as string, responses)
      setSubmitted(true)
    } catch (error) {
      console.error("Failed to submit assessment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!assessment) return <p>Assessment not found</p>
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted!</h2>
            <Button onClick={() => router.push("/assessments")}>Back to Assessments</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <Button variant="ghost" onClick={() => router.push("/assessments")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{assessment.title}</h1>
        <p className="text-gray-600">{assessment.description}</p>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {assessment.questions.map((q, index) => {
          // conditionals
          if (q.conditional) {
            const depVal = responses[q.conditional.dependsOn]
            if (depVal !== q.conditional.value) return null
          }

          return (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle>
                  {index + 1}. {q.title} {q.rules?.required && <span className="text-red-500">*</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {q.type === "text" && (
                  <Input
                    value={responses[q.id] || ""}
                    onChange={(e) => updateResponse(q.id, e.target.value)}
                    className={errors[q.id] ? "border-red-500" : ""}
                  />
                )}
                {q.type === "textarea" && (
                  <Textarea
                    value={responses[q.id] || ""}
                    onChange={(e) => updateResponse(q.id, e.target.value)}
                    className={errors[q.id] ? "border-red-500" : ""}
                  />
                )}
                {q.type === "multiple-choice" &&
                  q.options?.map((opt) => (
                    <label key={opt} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={responses[q.id] === opt}
                        onChange={(e) => updateResponse(q.id, e.target.value)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                {q.type === "checkbox" &&
                  q.options?.map((opt) => (
                    <label key={opt} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={opt}
                        checked={(responses[q.id] || []).includes(opt)}
                        onChange={(e) => {
                          const current = responses[q.id] || []
                          if (e.target.checked) updateResponse(q.id, [...current, opt])
                          else updateResponse(q.id, current.filter((v: string) => v !== opt))
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                {errors[q.id] && <p className="text-sm text-red-600">{errors[q.id]}</p>}
              </CardContent>
            </Card>
          )
        })}

        <Notes />

        <div className="flex justify-end">
          <Button onClick={submitAssessment} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  )
}

