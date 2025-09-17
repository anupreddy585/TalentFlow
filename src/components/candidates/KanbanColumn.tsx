import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Candidate } from '../../types';
import { DraggableCandidateCard } from './DraggableCandidateCard';

interface KanbanColumnProps {
  stage: {
    id: string;
    title: string;
    color: string;
  };
  candidates: Candidate[];
  activeCandidate: Candidate | null;
}

export function KanbanColumn({ stage, candidates, activeCandidate }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`rounded-lg p-4 ${stage.color} mb-4`}>
        <h3 className="font-semibold text-gray-900 mb-1">{stage.title}</h3>
        <p className="text-sm text-gray-600">{candidates.length} candidates</p>
      </div>
      
      <div
        ref={setNodeRef}
        className={`min-h-[500px] space-y-3 p-2 rounded-lg transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
        }`}
      >
        <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map((candidate) => (
            <DraggableCandidateCard
              key={candidate.id}
              candidate={candidate}
              isDragging={activeCandidate?.id === candidate.id}
            />
          ))}
        </SortableContext>
        
        {candidates.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No candidates in this stage
          </div>
        )}
      </div>
    </div>
  );
}
