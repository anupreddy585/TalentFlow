import { create } from 'zustand';
import { Candidate, TimelineEvent } from '../types';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface CandidatesState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  selectedCandidate: Candidate | null;
  candidateTimeline: TimelineEvent[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    stage: string;
  };
  
  // Actions
  fetchCandidates: () => Promise<void>;
  updateCandidate: (id: string, updates: Partial<Candidate>) => Promise<void>;
  selectCandidate: (candidate: Candidate | null) => void;
  fetchCandidateTimeline: (id: string) => Promise<void>;
  setFilters: (filters: Partial<CandidatesState['filters']>) => void;
  setPagination: (pagination: Partial<CandidatesState['pagination']>) => void;
  moveCandidateStage: (candidateId: string, newStage: Candidate['stage']) => Promise<void>;
}

export const useCandidatesStore = create<CandidatesState>((set, get) => ({
  candidates: [],
  loading: false,
  error: null,
  selectedCandidate: null,
  candidateTimeline: [],
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    stage: '',
  },

  fetchCandidates: async () => {
    set({ loading: true, error: null });
    
    try {
      const { filters, pagination } = get();
      const response = await apiClient.getCandidates({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      set({
        candidates: response.data,
        pagination: response.pagination!,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch candidates',
        loading: false,
      });
      toast.error('Failed to fetch candidates');
    }
  },

  updateCandidate: async (id, updates) => {
    try {
      const response = await apiClient.updateCandidate(id, updates);
      set(state => ({
        candidates: state.candidates.map(candidate => 
          candidate.id === id ? response.data : candidate
        ),
        selectedCandidate: state.selectedCandidate?.id === id ? response.data : state.selectedCandidate,
      }));
      toast.success('Candidate updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update candidate';
      toast.error(message);
      throw error;
    }
  },

  selectCandidate: (candidate) => {
    set({ selectedCandidate: candidate, candidateTimeline: [] });
  },

  fetchCandidateTimeline: async (id) => {
    try {
      const response = await apiClient.getCandidateTimeline(id);
      set({ candidateTimeline: response.data });
    } catch (error) {
      toast.error('Failed to fetch candidate timeline');
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setPagination: (newPagination) => {
    set(state => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
  },

  moveCandidateStage: async (candidateId, newStage) => {
    const { candidates } = get();
    const candidate = candidates.find(c => c.id === candidateId);
    
    if (!candidate) return;
    
    const originalStage = candidate.stage;
    
    // Optimistic update
    set(state => ({
      candidates: state.candidates.map(c =>
        c.id === candidateId ? { ...c, stage: newStage } : c
      ),
    }));
    
    try {
      await apiClient.updateCandidate(candidateId, { stage: newStage });
    } catch (error) {
      // Rollback on error
      set(state => ({
        candidates: state.candidates.map(c =>
          c.id === candidateId ? { ...c, stage: originalStage } : c
        ),
      }));
      throw error;
    }
  },
}));
