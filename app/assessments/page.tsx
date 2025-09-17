"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Eye, Edit, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { mockApi } from "@/lib/mock-api"


interface Assessment {
  id: string
  title: string
  description: string
  questions: string[]
  createdAt: string
  updatedAt: string
  isPublished: boolean
  responses: number
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    try {
      const data = await mockApi.getAssessments()
      setAssessments(data)
    } catch (error) {
      console.error("Failed to load assessments:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAssessment = async (id: string) => {
    try {
      await mockApi.deleteAssessment(id)
      setAssessments((prev) => prev.filter((a) => a.id !== id))
    } catch (error) {
      console.error("Failed to delete assessment:", error)
    }
  }

  const filteredAssessments = assessments.filter(
    (assessment) =>
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">Create and manage candidate assessments</p>
        </div>
        <Link href="/assessments/builder">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{assessment.description}</p>
                </div>
                <Badge variant={assessment.isPublished ? "default" : "secondary"}>
                  {assessment.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{assessment.questions.length} questions</span>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {assessment.responses} responses
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link href={`/assessments/${assessment.id}/preview`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </Link>
                  <Link href={`/assessments/builder?id=${assessment.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAssessment(assessment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssessments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No assessments found</div>
          <p className="text-gray-600 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Create your first assessment to get started"}
          </p>
          {!searchTerm && (
            <Link href="/assessments/builder">
              <Button>Create Assessment</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
