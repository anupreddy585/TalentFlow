import { http, HttpResponse } from "msw"
import { db } from "./database"
import type { Job, Candidate, Assessment, ApiResponse, TimelineEvent } from "../types"

// Utility function to add artificial latency and potential errors
const delay = () => new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 1000))
const shouldError = () => Math.random() < 0.08 // 8% error rate

export const handlers = [
  // Jobs endpoints
  http.get("/api/jobs", async ({ request }) => {
    await delay()

    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const status = url.searchParams.get("status") || ""
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10")
    const sort = url.searchParams.get("sort") || "order"
    const order = url.searchParams.get("order") || "asc"

    try {
      let query = db.jobs.orderBy(sort)

      if (order === "desc") {
        query = query.reverse()
      }

      const jobs = await query.toArray()

      let filtered = jobs

      if (search) {
        filtered = filtered.filter(
          (job) =>
            job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
        )
      }

      if (status) {
        filtered = filtered.filter((job) => job.status === status)
      }

      const total = filtered.length
      const offset = (page - 1) * pageSize
      const paginatedJobs = filtered.slice(offset, offset + pageSize)

      const response: ApiResponse<Job[]> = {
        data: paginatedJobs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }

      return HttpResponse.json(response)
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  http.post("/api/jobs", async ({ request }) => {
    await delay()

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to create job" }, { status: 500 })
    }

    try {
      const jobData = (await request.json()) as Omit<Job, "id" | "createdAt" | "updatedAt">

      // Check for duplicate slug
      const existingJob = await db.jobs.where("slug").equals(jobData.slug).first()
      if (existingJob) {
        return HttpResponse.json({ error: "Job with this slug already exists" }, { status: 409 })
      }

      const job: Job = {
        ...jobData,
        id: `job-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.jobs.add(job)
      return HttpResponse.json({ data: job })
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  http.patch("/api/jobs/:id", async ({ request, params }) => {
    await delay()

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to update job" }, { status: 500 })
    }

    try {
      const { id } = params
      const updates = (await request.json()) as Partial<Job>

      const updated = await db.jobs.update(id as string, {
        ...updates,
        updatedAt: new Date(),
      })

      if (!updated) {
        return HttpResponse.json({ error: "Job not found" }, { status: 404 })
      }

      const job = await db.jobs.get(id as string)
      return HttpResponse.json({ data: job })
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  http.patch("/api/jobs/:id/reorder", async ({ request, params }) => {
    await delay()

    // Higher error rate for reorder to test rollback
    if (Math.random() < 0.1) {
      return HttpResponse.json({ error: "Reorder failed" }, { status: 500 })
    }

    try {
      const { id } = params
      const { fromOrder, toOrder } = await request.json()

      // Update job order
      await db.jobs.update(id as string, { order: toOrder, updatedAt: new Date() })

      // Update other jobs' orders
      if (fromOrder < toOrder) {
        await db.jobs
          .where("order")
          .between(fromOrder + 1, toOrder)
          .modify((job) => {
            job.order--
            job.updatedAt = new Date()
          })
      } else {
        await db.jobs
          .where("order")
          .between(toOrder, fromOrder - 1)
          .modify((job) => {
            job.order++
            job.updatedAt = new Date()
          })
      }

      const job = await db.jobs.get(id as string)
      return HttpResponse.json({ data: job })
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  // Candidates endpoints
  http.get("/api/candidates", async ({ request }) => {
    await delay()

    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const stage = url.searchParams.get("stage") || ""
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "50")

    try {
      let candidates = await db.candidates.orderBy("appliedAt").reverse().toArray()

      if (search) {
        candidates = candidates.filter(
          (candidate) =>
            candidate.name.toLowerCase().includes(search.toLowerCase()) ||
            candidate.email.toLowerCase().includes(search.toLowerCase()),
        )
      }

      if (stage) {
        candidates = candidates.filter((candidate) => candidate.stage === stage)
      }

      const total = candidates.length
      const offset = (page - 1) * pageSize
      const paginatedCandidates = candidates.slice(offset, offset + pageSize)

      const response: ApiResponse<Candidate[]> = {
        data: paginatedCandidates,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }

      return HttpResponse.json(response)
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  http.patch("/api/candidates/:id", async ({ request, params }) => {
    await delay()

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to update candidate" }, { status: 500 })
    }

    try {
      const { id } = params
      const updates = (await request.json()) as Partial<Candidate>

      const candidate = await db.candidates.get(id as string)
      if (!candidate) {
        return HttpResponse.json({ error: "Candidate not found" }, { status: 404 })
      }

      // If stage is changing, add timeline event
      if (updates.stage && updates.stage !== candidate.stage) {
        const timelineEvent: TimelineEvent = {
          id: `timeline-${Date.now()}`,
          candidateId: id as string,
          type: "stage_change",
          description: `Moved from ${candidate.stage} to ${updates.stage}`,
          oldValue: candidate.stage,
          newValue: updates.stage,
          createdAt: new Date(),
          author: "HR Team",
        }

        await db.timeline.add(timelineEvent)
      }

      await db.candidates.update(id as string, {
        ...updates,
        updatedAt: new Date(),
      })

      const updatedCandidate = await db.candidates.get(id as string)
      return HttpResponse.json({ data: updatedCandidate })
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  http.get("/api/candidates/:id/timeline", async ({ params }) => {
    await delay()

    try {
      const { id } = params
      const events = await db.timeline
        .where("candidateId")
        .equals(id as string)
        .orderBy("createdAt")
        .toArray()

      return HttpResponse.json({ data: events })
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  // Assessments endpoints
  http.get("/api/assessments/:jobId", async ({ params }) => {
    await delay()

    try {
      const { jobId } = params
      const assessment = await db.assessments
        .where("jobId")
        .equals(jobId as string)
        .first()

      if (!assessment) {
        return HttpResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      return HttpResponse.json({ data: assessment })
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  http.put("/api/assessments/:jobId", async ({ request, params }) => {
    await delay()

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to save assessment" }, { status: 500 })
    }

    try {
      const { jobId } = params
      const assessmentData = (await request.json()) as Assessment

      const existing = await db.assessments
        .where("jobId")
        .equals(jobId as string)
        .first()

      if (existing) {
        await db.assessments.update(existing.id, {
          ...assessmentData,
          updatedAt: new Date(),
        })
      } else {
        await db.assessments.add({
          ...assessmentData,
          id: `assessment-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      const assessment = await db.assessments
        .where("jobId")
        .equals(jobId as string)
        .first()
      return HttpResponse.json({ data: assessment })
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),

  http.post("/api/assessments/:jobId/submit", async ({ request, params }) => {
    await delay()

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to submit assessment" }, { status: 500 })
    }

    try {
      const { jobId } = params
      const responseData = await request.json()

      const response = {
        id: `response-${Date.now()}`,
        ...responseData,
        submittedAt: new Date(),
      }

      await db.responses.add(response)
      return HttpResponse.json({ data: response })
    } catch (error) {
      return HttpResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }),
]
