import { create } from 'zustand';
import { Job } from '../types';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    status: string;
  };
  
  // Actions
  fetchJobs: () => Promise<void>;
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  reorderJobs: (jobs: Job[]) => void;
  reorderJob: (id: string, fromOrder: number, toOrder: number) => Promise<void>;
  setFilters: (filters: Partial<JobsState['filters']>) => void;
  setPagination: (pagination: Partial<JobsState['pagination']>) => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: '',
  },

  fetchJobs: async () => {
    set({ loading: true, error: null });
    
    try {
      const { filters, pagination } = get();
      const response = await apiClient.getJobs({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      set({
        jobs: response.data,
        pagination: response.pagination!,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
        loading: false,
      });
      toast.error('Failed to fetch jobs');
    }
  },

  createJob: async (jobData) => {
    try {
      const response = await apiClient.createJob(jobData);
      set(state => ({
        jobs: [response.data, ...state.jobs],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
      }));
      toast.success('Job created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job';
      toast.error(message);
      throw error;
    }
  },

  updateJob: async (id, updates) => {
    try {
      const response = await apiClient.updateJob(id, updates);
      set(state => ({
        jobs: state.jobs.map(job => 
          job.id === id ? response.data : job
        ),
      }));
      toast.success('Job updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update job';
      toast.error(message);
      throw error;
    }
  },

  reorderJobs: (jobs) => {
    set({ jobs });
  },

  reorderJob: async (id, fromOrder, toOrder) => {
    const { jobs } = get();
    const originalJobs = [...jobs];
    
    // Optimistic update
    const newJobs = [...jobs];
    const jobIndex = newJobs.findIndex(job => job.id === id);
    const job = newJobs[jobIndex];
    
    // Remove job from current position
    newJobs.splice(jobIndex, 1);
    
    // Insert at new position
    const newIndex = toOrder > fromOrder ? toOrder - 1 : toOrder;
    newJobs.splice(newIndex, 0, { ...job, order: toOrder });
    
    // Update orders
    newJobs.forEach((job, index) => {
      job.order = index + 1;
    });
    
    set({ jobs: newJobs });
    
    try {
      await apiClient.reorderJob(id, fromOrder, toOrder);
      toast.success('Job order updated');
    } catch (error) {
      // Rollback on error
      set({ jobs: originalJobs });
      toast.error('Failed to update job order');
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page
    }));
  },

  setPagination: (newPagination) => {
    set(state => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
  },
}));
