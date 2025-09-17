import { Job, Candidate, Assessment, ApiResponse, PaginationParams, TimelineEvent } from '../types';

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Jobs API
  async getJobs(params: PaginationParams = {}): Promise<ApiResponse<Job[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<ApiResponse<Job[]>>(`/jobs?${searchParams}`);
  }

  async createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Job }> {
    return this.request<{ data: Job }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<{ data: Job }> {
    return this.request<{ data: Job }>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async reorderJob(id: string, fromOrder: number, toOrder: number): Promise<{ data: Job }> {
    return this.request<{ data: Job }>(`/jobs/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ fromOrder, toOrder }),
    });
  }

  // Candidates API
  async getCandidates(params: PaginationParams = {}): Promise<ApiResponse<Candidate[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<ApiResponse<Candidate[]>>(`/candidates?${searchParams}`);
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<{ data: Candidate }> {
    return this.request<{ data: Candidate }>(`/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getCandidateTimeline(id: string): Promise<{ data: TimelineEvent[] }> {
    return this.request<{ data: TimelineEvent[] }>(`/candidates/${id}/timeline`);
  }

  // Assessments API
  async getAssessment(jobId: string): Promise<{ data: Assessment }> {
    return this.request<{ data: Assessment }>(`/assessments/${jobId}`);
  }

  async saveAssessment(jobId: string, assessment: Assessment): Promise<{ data: Assessment }> {
    return this.request<{ data: Assessment }>(`/assessments/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(assessment),
    });
  }

  async submitAssessment(jobId: string, candidateId: string, answers: Record<string, any>): Promise<{ data: any }> {
    return this.request<{ data: any }>(`/assessments/${jobId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ candidateId, answers }),
    });
  }
}

export const apiClient = new ApiClient();
