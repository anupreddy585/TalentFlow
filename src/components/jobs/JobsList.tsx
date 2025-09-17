import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Job } from '../../types';
import { SortableJobCard } from './SortableJobCard';
import { JobCard } from './JobCard';

interface JobsListProps {
  jobs: Job[];
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
  onDelete: (job: Job) => void;
  onReorder: (jobs: Job[]) => void;
}

export function JobsList({ jobs, onView, onEdit, onArchive, onDelete, onReorder }: JobsListProps) {
  const [activeJob, setActiveJob] = React.useState<Job | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find(j => j.id === event.active.id);
    setActiveJob(job || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveJob(null);
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = jobs.findIndex(job => job.id === active.id);
      const newIndex = jobs.findIndex(job => job.id === over.id);
      
      const newJobs = [...jobs];
      const [removed] = newJobs.splice(oldIndex, 1);
      newJobs.splice(newIndex, 0, removed);
      
      // Update order values
      const reorderedJobs = newJobs.map((job, index) => ({
        ...job,
        order: index + 1,
      }));
      
      onReorder(reorderedJobs);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {jobs.map((job) => (
            <SortableJobCard
              key={job.id}
              job={job}
              onView={onView}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeJob ? (
          <JobCard
            job={activeJob}
            onView={onView}
            onEdit={onEdit}
            onArchive={onArchive}
            onDelete={onDelete}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
