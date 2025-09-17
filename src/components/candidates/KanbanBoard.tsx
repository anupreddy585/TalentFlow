import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Candidate } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { useCandidatesStore } from '../../store/candidates-store';

interface KanbanBoardProps {
  candidates: Candidate[];
}

const stages = [
  { id: 'applied', title: 'Applied', color: 'bg-gray-100' },
  { id: 'screen', title: 'Screening', color: 'bg-blue-100' },
  { id: 'tech', title: 'Technical', color: 'bg-yellow-100' },
  { id: 'offer', title: 'Offer', color: 'bg-purple-100' },
  { id: 'hired', title: 'Hired', color: 'bg-green-100' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-100' },
] as const;

export function KanbanBoard({ candidates }: KanbanBoardProps) {
  const { moveCandidateStage } = useCandidatesStore();
  const [activeCandidate, setActiveCandidate] = React.useState<Candidate | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find(c => c.id === event.active.id);
    setActiveCandidate(candidate || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCandidate(null);
    
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const candidateId = active.id as string;
    const newStage = over.id as Candidate['stage'];
    
    try {
      await moveCandidateStage(candidateId, newStage);
    } catch (error) {
      console.error('Failed to move candidate:', error);
    }
  };

  const candidatesByStage = React.useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.id] = candidates.filter(candidate => candidate.stage === stage.id);
      return acc;
    }, {} as Record<string, Candidate[]>);
  }, [candidates]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            candidates={candidatesByStage[stage.id] || []}
            activeCandidate={activeCandidate}
          />
        ))}
      </div>
    </DndContext>
  );
}
