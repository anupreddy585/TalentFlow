import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Job } from '../../types';
import { JobCard } from './JobCard';

interface SortableJobCardProps {
  job: Job;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
  onDelete: (job: Job) => void;
}

export function SortableJobCard({ job, onView, onEdit, onArchive, onDelete }: SortableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-10' : ''}`}
    >
      <div className="flex items-stretch">
        <button
          className="flex items-center px-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-l-lg border border-r-0 border-gray-200 transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        
        <div className="flex-1">
          <JobCard
            job={job}
            onView={onView}
            onEdit={onEdit}
            onArchive={onArchive}
            onDelete={onDelete}
            isDragging={isDragging}
          />
        </div>
      </div>
    </div>
  );
}
