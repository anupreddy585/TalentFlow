import React from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Edit, Archive, Trash2 } from 'lucide-react';
import { Job } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface JobCardProps {
  job: Job;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
  onDelete: (job: Job) => void;
  isDragging?: boolean;
}

export function JobCard({ job, onView, onEdit, onArchive, onDelete, isDragging }: JobCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  
  return (
    <div 
      className={`
        bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200
        ${isDragging ? 'opacity-50 transform rotate-2' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <Badge 
              variant={job.status === 'active' ? 'success' : 'secondary'}
            >
              {job.status}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            {job.department && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Department:</span> {job.department}
              </p>
            )}
            {job.location && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Location:</span> {job.location}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Created {format(new Date(job.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map((tag, index) => (
                <Badge key={index} variant="info" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {job.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
          )}
        </div>
        
        <div className="relative ml-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 z-20 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                <button
                  onClick={() => {
                    onView(job);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(job);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onArchive(job);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {job.status === 'active' ? 'Archive' : 'Unarchive'}
                </button>
                <button
                  onClick={() => {
                    onDelete(job);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
