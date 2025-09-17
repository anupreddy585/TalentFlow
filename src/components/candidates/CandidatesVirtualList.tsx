import React from 'react';
// import { FixedSizeList } from 'react-window';
import { FixedSizeList } from 'react-window/dist/index.esm.js'

interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: string;
  position: string;
  appliedDate: string;
}

interface CandidatesVirtualListProps {
  candidates: Candidate[];
  loading: boolean;
  onCandidateClick: (candidate: Candidate) => void;
}

// Use react-window's ListChildComponentProps for type safety
import { ListChildComponentProps } from 'react-window';

const CandidatesVirtualList: React.FC<CandidatesVirtualListProps> = ({
  candidates,
  loading,
  onCandidateClick,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading candidates...</div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No candidates found</div>
      </div>
    );
  }

  const CandidateRow: React.FC<ListChildComponentProps> = ({ index, style }) => {
    const candidate = candidates[index];

    if (!candidate) {
      return <div style={style} />;
    }

    return (
      <div
        style={style}
        className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => onCandidateClick(candidate)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{candidate.name}</h3>
            <p className="text-sm text-gray-600">{candidate.email}</p>
            <p className="text-sm text-gray-500">{candidate.position}</p>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${candidate.stage === 'hired'
                ? 'bg-green-100 text-green-800'
                : candidate.stage === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : candidate.stage === 'offer'
                    ? 'bg-purple-100 text-purple-800'
                    : candidate.stage === 'tech'
                      ? 'bg-yellow-100 text-yellow-800'
                      : candidate.stage === 'screen'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
            >
              {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {new Date(candidate.appliedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <FixedSizeList
        height={600}
        itemCount={candidates.length}
        itemSize={80}
        width="100%"
      >
        {CandidateRow}
      </FixedSizeList>
    </div>
  );
};

export default CandidatesVirtualList;
