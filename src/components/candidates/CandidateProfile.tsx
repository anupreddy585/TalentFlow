import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { X, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';
import { Candidate, TimelineEvent } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCandidatesStore } from '../../store/candidates-store';

interface CandidateProfileProps {
  candidate: Candidate;
  onClose: () => void;
}

const stageColors = {
  applied: 'secondary',
  screen: 'info',
  tech: 'warning',
  offer: 'primary',
  hired: 'success',
  rejected: 'danger',
} as const;

export function CandidateProfile({ candidate, onClose }: CandidateProfileProps) {
  const { candidateTimeline, fetchCandidateTimeline } = useCandidatesStore();

  useEffect(() => {
    fetchCandidateTimeline(candidate.id);
  }, [candidate.id, fetchCandidateTimeline]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-6">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-2xl transform rounded-lg bg-white shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Candidate Profile</h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
                  <Badge variant={stageColors[candidate.stage]} size="md">
                    {candidate.stage}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${candidate.email}`} className="hover:text-blue-600">
                    {candidate.email}
                  </a>
                </div>
                
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${candidate.phone}`} className="hover:text-blue-600">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Applied {format(new Date(candidate.appliedAt), 'MMMM d, yyyy')}
                </div>
                
                {candidate.resume && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <a href={candidate.resume} className="hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h4>
              
              {candidateTimeline.length > 0 ? (
                <div className="space-y-4">
                  {candidateTimeline.map((event) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{event.description}</p>
                        <div className="text-xs text-gray-500 flex items-center gap-4">
                          <span>{format(new Date(event.createdAt), 'MMM d, yyyy h:mm a')}</span>
                          <span>by {event.author}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No timeline events available</p>
              )}
            </div>

            {/* Notes */}
            {candidate.notes.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Notes</h4>
                <div className="space-y-3">
                  {candidate.notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 mb-2">{note.content}</p>
                      <div className="text-xs text-gray-500 flex items-center gap-4">
                        <span>{format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}</span>
                        <span>by {note.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
