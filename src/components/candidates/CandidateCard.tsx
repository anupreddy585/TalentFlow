import React from 'react';
import { format } from 'date-fns';
import { Mail, Phone, Calendar, MoreHorizontal } from 'lucide-react';
import { Candidate } from '../../types';
import { Badge } from '../ui/Badge';

interface CandidateCardProps {
  candidate: Candidate;
  onView: (candidate: Candidate) => void;
  onClick?: (candidate: Candidate) => void;
}

const stageColors = {
  applied: 'secondary',
  screen: 'info',
  tech: 'warning',
  offer: 'primary',
  hired: 'success',
  rejected: 'danger',
} as const;

export function CandidateCard({ candidate, onView, onClick }: CandidateCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(candidate);
    }
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
            <Badge variant={stageColors[candidate.stage]}>
              {candidate.stage}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {candidate.email}
            </div>
            
            {candidate.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {candidate.phone}
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              Applied {format(new Date(candidate.appliedAt), 'MMM d, yyyy')}
            </div>
          </div>
          
          {candidate.notes.length > 0 && (
            <p className="text-sm text-gray-600">
              {candidate.notes.length} note{candidate.notes.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(candidate);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
