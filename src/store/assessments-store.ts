import { create } from 'zustand';
import { Assessment, Question, AssessmentSection } from '../types';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface AssessmentsState {
  currentAssessment: Assessment | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAssessment: (jobId: string) => Promise<void>;
  saveAssessment: (jobId: string, assessment: Assessment) => Promise<void>;
  updateAssessment: (updates: Partial<Assessment>) => void;
  addSection: () => void;
  updateSection: (sectionId: string, updates: Partial<AssessmentSection>) => void;
  deleteSection: (sectionId: string) => void;
  addQuestion: (sectionId: string) => void;
  updateQuestion: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (sectionId: string, questionId: string) => void;
  reorderQuestions: (sectionId: string, questions: Question[]) => void;
  resetAssessment: () => void;
}

export const useAssessmentsStore = create<AssessmentsState>((set, get) => ({
  currentAssessment: null,
  loading: false,
  error: null,

  fetchAssessment: async (jobId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await apiClient.getAssessment(jobId);
      set({
        currentAssessment: response.data,
        loading: false,
      });
    } catch (error) {
      // If assessment doesn't exist, create a new one
      const newAssessment: Assessment = {
        id: `assessment-${Date.now()}`,
        jobId,
        title: 'New Assessment',
        description: '',
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set({
        currentAssessment: newAssessment,
        loading: false,
      });
    }
  },

  saveAssessment: async (jobId, assessment) => {
    try {
      const response = await apiClient.saveAssessment(jobId, assessment);
      set({ currentAssessment: response.data });
      toast.success('Assessment saved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save assessment';
      toast.error(message);
      throw error;
    }
  },

  updateAssessment: (updates) => {
    set(state => ({
      currentAssessment: state.currentAssessment 
        ? { ...state.currentAssessment, ...updates, updatedAt: new Date() }
        : null,
    }));
  },

  addSection: () => {
    set(state => {
      if (!state.currentAssessment) return state;
      
      const newSection: AssessmentSection = {
        id: `section-${Date.now()}`,
        title: 'New Section',
        description: '',
        questions: [],
        order: state.currentAssessment.sections.length + 1,
      };

      return {
        currentAssessment: {
          ...state.currentAssessment,
          sections: [...state.currentAssessment.sections, newSection],
          updatedAt: new Date(),
        },
      };
    });
  },

  updateSection: (sectionId, updates) => {
    set(state => ({
      currentAssessment: state.currentAssessment 
        ? {
            ...state.currentAssessment,
            sections: state.currentAssessment.sections.map(section =>
              section.id === sectionId ? { ...section, ...updates } : section
            ),
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  deleteSection: (sectionId) => {
    set(state => ({
      currentAssessment: state.currentAssessment 
        ? {
            ...state.currentAssessment,
            sections: state.currentAssessment.sections.filter(section => section.id !== sectionId),
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  addQuestion: (sectionId) => {
    set(state => {
      if (!state.currentAssessment) return state;
      
      const newQuestion: Question = {
        id: `question-${Date.now()}`,
        type: 'short-text',
        title: 'New Question',
        required: false,
        order: 1,
      };

      return {
        currentAssessment: {
          ...state.currentAssessment,
          sections: state.currentAssessment.sections.map(section =>
            section.id === sectionId 
              ? {
                  ...section,
                  questions: [...section.questions, { ...newQuestion, order: section.questions.length + 1 }],
                }
              : section
          ),
          updatedAt: new Date(),
        },
      };
    });
  },

  updateQuestion: (sectionId, questionId, updates) => {
    set(state => ({
      currentAssessment: state.currentAssessment 
        ? {
            ...state.currentAssessment,
            sections: state.currentAssessment.sections.map(section =>
              section.id === sectionId 
                ? {
                    ...section,
                    questions: section.questions.map(question =>
                      question.id === questionId ? { ...question, ...updates } : question
                    ),
                  }
                : section
            ),
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  deleteQuestion: (sectionId, questionId) => {
    set(state => ({
      currentAssessment: state.currentAssessment 
        ? {
            ...state.currentAssessment,
            sections: state.currentAssessment.sections.map(section =>
              section.id === sectionId 
                ? {
                    ...section,
                    questions: section.questions.filter(question => question.id !== questionId),
                  }
                : section
            ),
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  reorderQuestions: (sectionId, questions) => {
    set(state => ({
      currentAssessment: state.currentAssessment 
        ? {
            ...state.currentAssessment,
            sections: state.currentAssessment.sections.map(section =>
              section.id === sectionId 
                ? { ...section, questions }
                : section
            ),
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  resetAssessment: () => {
    set({ currentAssessment: null, error: null });
  },
}));
