import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Mail, Calendar, GripVertical } from 'lucide-react';
import { Candidate } from '../../types';
import { useCandidatesStore } from '../../store/candidates-store';

interface DraggableCandidateCardProps {
  candidate: Candidate;
  isDragging?: boolean;
}

export function DraggableCandidateCard({ candidate, isDragging }: DraggableCandidateCardProps) {
  const { selectCandidate } = useCandidatesStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md 
        transition-all duration-200 cursor-pointer group
        ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
      `}
      {...attributes}
      {...listeners}
      onClick={() => selectCandidate(candidate)}
    >
      <div className="flex items-start gap-3">
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{candidate.name}</h4>
          
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-3 h-3 mr-1" />
              <span className="truncate">{candidate.email}</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(candidate.appliedAt), 'MMM d')}
            </div>
          </div>
          
          {candidate.notes.length > 0 && (
            <div className="mt-2 text-xs text-blue-600">
              {candidate.notes.length} note{candidate.notes.length === 1 ? '' : 's'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
