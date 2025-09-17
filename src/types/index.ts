export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  department?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  phone?: string;
  resume?: string;
  appliedAt: Date;
  updatedAt: Date;
  notes: Note[];
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  mentions: string[];
}

export interface TimelineEvent {
  id: string;
  candidateId: string;
  type: 'stage_change' | 'note_added' | 'assessment_completed';
  description: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
  author: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description: string;
  sections: AssessmentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  order: number;
}

export interface Question {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    maxLength?: number;
  };
  conditionalLogic?: {
    showIf: {
      questionId: string;
      operator: 'equals' | 'not-equals' | 'contains';
      value: string;
    };
  };
  order: number;
}

export interface AssessmentResponse {
  id: string;
  candidateId: string;
  assessmentId: string;
  answers: Record<string, string>;
  submittedAt: Date;
  score?: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  stage?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
