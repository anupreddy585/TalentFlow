// lib/mock-api.ts
export interface ValidationRules {
  required?: boolean
  min?: number
  max?: number
  maxLength?: number
}

export interface Question {
  id: string
  type: "text" | "textarea" | "multiple-choice" | "checkbox"
  title: string
  description?: string
  options?: string[]
  rules?: ValidationRules
  conditional?: {
    dependsOn: string
    value: string
  }
}

export interface Assessment {
  id: string
  title: string
  description: string
  questions: Question[]
  createdAt: string
  updatedAt: string
  isPublished: boolean
  responses: number
}

let assessments: Assessment[] = [
  {
    id: "1",
    title: "JavaScript Basics",
    description: "Test your knowledge of JS fundamentals",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    responses: 0,
    questions: [
      {
        id: "q1",
        type: "text",
        title: "What is closure?",
        rules: { required: true, maxLength: 100 },
      },
      {
        id: "q2",
        type: "multiple-choice",
        title: "Choose the correct types of JS data",
        options: ["String", "Boolean", "Banana"],
        rules: { required: true },
      },
      {
        id: "q3",
        type: "text",
        title: "Why did you answer Banana?",
        conditional: { dependsOn: "q2", value: "Banana" },
      },
    ],
  },
]

export const mockApi = {
  // --- Fetch all ---
  async getAssessments(): Promise<Assessment[]> {
    return [...assessments] // clone
  },

  // --- Fetch one (UI expects getAssessment) ---
  async getAssessment(id: string): Promise<Assessment> {
    const found = assessments.find((a) => a.id === id)
    if (!found) throw new Error(`Assessment ${id} not found`)
    return { ...found, questions: [...found.questions] }
  },

  // --- Alias (for backward compatibility) ---
  async getAssessmentById(id: string): Promise<Assessment | null> {
    return assessments.find((a) => a.id === id) || null
  },

  // --- Create (UI expects createAssessment) ---
  async createAssessment(
    data: Omit<Assessment, "id" | "createdAt" | "updatedAt" | "responses">
  ): Promise<Assessment> {
    const now = new Date().toISOString()
    const newAssessment: Assessment = {
      ...data,
      id: `local_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      responses: 0,
    }
    assessments.push(newAssessment)
    return newAssessment
  },

  // --- Update ---
  async updateAssessment(id: string, updated: Partial<Assessment>): Promise<void> {
    assessments = assessments.map((a) =>
      a.id === id ? { ...a, ...updated, updatedAt: new Date().toISOString() } : a
    )
  },

  // --- Delete ---
  async deleteAssessment(id: string): Promise<void> {
    assessments = assessments.filter((a) => a.id !== id)
  },

  // --- Responses ---
  async submitAssessmentResponse(id: string, responses: Record<string, any>): Promise<void> {
    assessments = assessments.map((a) =>
      a.id === id ? { ...a, responses: a.responses + 1 } : a
    )
    console.log("Submitted responses for", id, responses)
  },
}

